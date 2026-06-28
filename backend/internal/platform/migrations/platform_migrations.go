package migrations

import (
	"github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/platform/seeders"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RunPlatformMigrations runs AutoMigrate for all platform models
// and seeds the software catalog.
//
// This should be called on backend startup in development mode.
func RunPlatformMigrations(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("Running platform database AutoMigrate...")

	// AutoMigrate platform tables
	err := db.AutoMigrate(
		&models.PlatformCompany{},
		&models.SoftwareCatalog{},
		&models.CompanySoftwareSubscription{},
		&models.PlatformAdminUser{},
		&models.PlatformRole{},
		&models.PlatformPermission{},
		&models.PlatformUserRole{},
		&models.PlatformAuditLog{},
		&models.PlatformLoginLog{},
		&models.TenantCompany{},
		&models.TenantCompanyDatabase{},
		&models.TenantCompanyContact{},
		&models.TenantCompanyBillingProfile{},
		&models.TenantCompanyFirstUser{},
		&models.TenantCompanySubscription{},
		&models.TenantCompanyModule{},
		&models.SubscriptionPlan{},
		&models.SubscriptionPlanModule{},
		&models.SubscriptionInvoice{},
		&models.SubscriptionPayment{},
		&models.ErpModule{},
		&models.ErpFeature{},
		&models.ErpVersion{},
		&models.FeatureFlag{},
		&models.SystemEmailSetting{},
		&models.SystemPaymentGatewaySetting{},
		&models.SystemBrandingSetting{},
		&models.SystemBackupSetting{},
		&models.SupportTicket{},
		&models.SupportTicketMessage{},
	)
	if err != nil {
		logger.Error("Platform AutoMigrate failed", zap.Error(err))
		return err
	}

	logger.Info("Platform AutoMigrate completed successfully")

	// Run seeders
	logger.Info("Running platform seeders...")
	if err := seeders.SeedSoftwareCatalog(db, logger); err != nil {
		logger.Error("Software catalog seeder failed", zap.Error(err))
		return err
	}

	if err := seeders.SeedPlatformCompanies(db, logger); err != nil {
		logger.Error("Platform company seeder failed", zap.Error(err))
		return err
	}

	if err := seeders.SeedPlatformAdminData(db, logger); err != nil {
		logger.Error("Platform admin data seeder failed", zap.Error(err))
		return err
	}

	logger.Info("Platform migrations and seeding complete")
	return nil
}
