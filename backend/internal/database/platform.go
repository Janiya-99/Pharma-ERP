package database

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/config"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewPlatformDB creates a GORM connection to the platform database (erp_platform).
//
// The platform database stores:
//   - Registered companies
//   - Company database connection details
//   - Software/module subscription details
//
// This does NOT connect to any company-specific database.
// Company database connections will be resolved dynamically in a future step.
func NewPlatformDB(cfg *config.DatabaseConfig, zapLogger *zap.Logger) (*gorm.DB, error) {
	// Configure GORM logger based on environment
	gormLogLevel := logger.Warn
	if cfg.Host == "127.0.0.1" || cfg.Host == "localhost" {
		gormLogLevel = logger.Info
	}

	// 1. Create the platform database if it does not exist
	zapLogger.Info("Checking if platform database exists...", zap.String("db", cfg.Name))
	rawDB, err := gorm.Open(mysql.Open(cfg.DSNWithoutDB()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL server for platform DB: %w", err)
	}
	createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", cfg.Name)
	if err := rawDB.Exec(createDBSQL).Error; err != nil {
		return nil, fmt.Errorf("failed to create platform database: %w", err)
	}
	sqlRawDB, _ := rawDB.DB()
	sqlRawDB.Close()

	// 2. Connect to the platform database
	db, err := gorm.Open(mysql.New(mysql.Config{
		DSN:                       cfg.DSN(),
		DefaultStringSize:         256,
		DisableDatetimePrecision:  true,
		DontSupportRenameIndex:    true,
		DontSupportRenameColumn:   true,
		SkipInitializeWithVersion: false,
	}), &gorm.Config{
		Logger:                                   logger.Default.LogMode(gormLogLevel),
		PrepareStmt:                              true,
		DisableForeignKeyConstraintWhenMigrating: false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to platform MySQL: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB for platform: %w", err)
	}
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Verify connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping platform MySQL: %w", err)
	}

	zapLogger.Info("Platform MySQL connected successfully",
		zap.String("host", cfg.Host),
		zap.String("database", cfg.Name),
		zap.Int("max_open_conns", cfg.MaxOpenConns),
	)

	return db, nil
}
