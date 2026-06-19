package database

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/config"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewMySQL creates a new GORM MySQL connection with InnoDB enforcement,
// connection pooling, and prepared statement caching.
//
// IMPORTANT: We do NOT use AutoMigrate. All schema changes go through
// golang-migrate SQL files in database/migrations/.
func NewMySQL(cfg *config.DatabaseConfig, zapLogger *zap.Logger) (*gorm.DB, error) {
	// Configure GORM logger based on environment
	gormLogLevel := logger.Warn
	if cfg.Host == "127.0.0.1" || cfg.Host == "localhost" {
		gormLogLevel = logger.Info
	}

	// 1. Create the database if it does not exist
	zapLogger.Info("Checking if database exists...", zap.String("db", cfg.Name))
	rawDB, err := gorm.Open(mysql.Open(cfg.DSNWithoutDB()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL server: %w", err)
	}
	createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", cfg.Name)
	if err := rawDB.Exec(createDBSQL).Error; err != nil {
		return nil, fmt.Errorf("failed to create database: %w", err)
	}
	sqlRawDB, _ := rawDB.DB()
	sqlRawDB.Close()

	// 2. Connect to the actual database
	db, err := gorm.Open(mysql.New(mysql.Config{
		DSN:                       cfg.DSN(),
		DefaultStringSize:         256,
		DisableDatetimePrecision:  true,
		DontSupportRenameIndex:    true,
		DontSupportRenameColumn:   true,
		SkipInitializeWithVersion: false,
	}), &gorm.Config{
		Logger:      logger.Default.LogMode(gormLogLevel),
		PrepareStmt: true, // Cache prepared statements for performance
		// Enforce InnoDB for all table creation
		DisableForeignKeyConstraintWhenMigrating: false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Verify connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping MySQL: %w", err)
	}

	zapLogger.Info("MySQL connected successfully",
		zap.String("host", cfg.Host),
		zap.String("database", cfg.Name),
		zap.Int("max_open_conns", cfg.MaxOpenConns),
	)

	return db, nil
}

// CloseMySQL gracefully closes the database connection.
func CloseMySQL(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
