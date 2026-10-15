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

	zapLogger.Info("Connecting to platform database...", zap.String("db", cfg.Name), zap.String("host", cfg.Host))

	// 1. First attempt to connect directly to the target platform database
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

	// 2. If direct connection fails, check if database needs creation (e.g. local dev)
	if err != nil {
		zapLogger.Warn("Direct connection to platform DB failed, attempting database creation...", zap.Error(err))
		rawDB, rawErr := gorm.Open(mysql.Open(cfg.DSNWithoutDB()), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if rawErr == nil {
			createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", cfg.Name)
			if createErr := rawDB.Exec(createDBSQL).Error; createErr != nil {
				zapLogger.Warn("Could not execute CREATE DATABASE (user may lack permission on shared server)", zap.Error(createErr))
			}
			sqlRawDB, _ := rawDB.DB()
			if sqlRawDB != nil {
				_ = sqlRawDB.Close()
			}

			// Retry connection to target database
			db, err = gorm.Open(mysql.New(mysql.Config{
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
		}

		if err != nil {
			return nil, fmt.Errorf("failed to connect to platform MySQL: %w", err)
		}
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
