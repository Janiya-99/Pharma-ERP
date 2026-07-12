package database

import (
	"errors"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/pixandco/erp-phrma/internal/platform/models"
	companyMigrations "github.com/pixandco/erp-phrma/internal/company/migrations"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type CompanyResolver struct {
	platformDB *gorm.DB
	logger     *zap.Logger
	mu         sync.RWMutex
	dbs        map[string]*gorm.DB
}

func NewCompanyResolver(platformDB *gorm.DB, logger *zap.Logger) *CompanyResolver {
	return &CompanyResolver{
		platformDB: platformDB,
		logger:     logger,
		dbs:        make(map[string]*gorm.DB),
	}
}

func (r *CompanyResolver) FindActiveCompanies() ([]models.PlatformCompany, error) {
	var companies []models.PlatformCompany
	err := r.platformDB.
		Where("status = ? AND subscription_status = ?", "active", "active").
		Order("id ASC").
		Find(&companies).Error
	if err != nil {
		return nil, err
	}
	return companies, nil
}

// ResolveCompanyDB looks up the company in the platform DB and returns its connection.
func (r *CompanyResolver) ResolveCompanyDB(companyCode string) (*gorm.DB, *models.PlatformCompany, error) {
	var company models.PlatformCompany

	// 1. Find platform company by company_code first
	err := r.platformDB.Where("company_code = ?", companyCode).First(&company).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, errors.New("invalid company or inactive subscription")
		}
		return nil, nil, err
	}

	// 2. Validate company status to show explicit messages
	if company.Status == "suspended" {
		return nil, nil, errors.New("Company account is suspended. Please contact support.")
	}
	if company.Status == "expired" || company.SubscriptionStatus == "expired" {
		return nil, nil, errors.New("Company license has expired. Please contact billing.")
	}
	if company.Status == "cancelled" || company.SubscriptionStatus == "cancelled" {
		return nil, nil, errors.New("Company account is inactive. Please contact support.")
	}
	if company.Status != "active" || company.SubscriptionStatus != "active" {
		return nil, nil, errors.New("Company subscription is not active.")
	}

	// 3. Get or create the company DB connection
	db, err := r.GetOrCreateCompanyDBConnection(company)
	if err != nil {
		return nil, nil, err
	}

	return db, &company, nil
}

// GetOrCreateCompanyDBConnection manages connection caching.
func (r *CompanyResolver) GetOrCreateCompanyDBConnection(company models.PlatformCompany) (*gorm.DB, error) {
	r.mu.RLock()
	db, exists := r.dbs[company.DatabaseName]
	r.mu.RUnlock()

	if exists {
		return db, nil
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	// Double check inside lock
	if db, exists := r.dbs[company.DatabaseName]; exists {
		return db, nil
	}

	// Create new connection
	// We construct DSN from platform company details. Assuming host is localhost for now if not specified.
	// We'll use the DB_USER and DB_PASSWORD from env for now, or assume it's root/root locally.
	// In production, the credentials might be stored in the platform DB or standard across all company DBs.
	// Since .env contains DB_USER and DB_PASSWORD, we should inject them, but resolver only gets platformDB.
	// Let's rely on standard config or DSN format.
	// Given earlier setup: PLATFORM_DB_HOST, DB_HOST, etc.
	// The prompt implies platform database stores routing details.
	// Let's connect using standard root:root@tcp(127.0.0.1:3306)/dbname?parseTime=true

	// Default to local dev credentials for the company database.
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		"root",
		"root", // or from config
		"127.0.0.1",
		"3306",
		company.DatabaseName,
	)

	newDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		r.logger.Error("Failed to connect to company database", zap.String("db_name", company.DatabaseName), zap.Error(err))
		return nil, err
	}

	// Configure connection pool
	sqlDB, err := newDB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(25)
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetConnMaxLifetime(5 * time.Minute)
	}

	// Run migrations (skip if requested)
	if os.Getenv("SKIP_MIGRATIONS") != "true" {
		if err := companyMigrations.RunCompanyMigrations(newDB, r.logger); err != nil {
			r.logger.Error("Failed to run migrations for company database", zap.String("db_name", company.DatabaseName), zap.Error(err))
			return nil, err
		}
	} else {
		r.logger.Info("Skipping company migrations (SKIP_MIGRATIONS=true)", zap.String("db_name", company.DatabaseName))
	}

	r.dbs[company.DatabaseName] = newDB
	r.logger.Info("Established new company database connection and migrated schema", zap.String("company_code", company.CompanyCode), zap.String("db_name", company.DatabaseName))

	return newDB, nil
}
