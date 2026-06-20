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

	logger.Info("Platform migrations and seeding complete")
	return nil
}
