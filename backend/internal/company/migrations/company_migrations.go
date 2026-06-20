package migrations

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/company/seeders"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RunCompanyMigrations runs AutoMigrate for the core company foundation models
// and seeds the software modules.
//
// This must be run on a company-specific database connection (e.g. erp_omacx),
// NEVER on the platform database.
func RunCompanyMigrations(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("Running company database AutoMigrate...")

	// AutoMigrate company foundation tables
	err := db.AutoMigrate(
		&models.Company{},
		&models.Branch{},
		&models.Department{},
		&models.Designation{},
		&models.SoftwareModule{},
	)
	if err != nil {
		logger.Error("Company AutoMigrate failed", zap.Error(err))
		return err
	}

	logger.Info("Company AutoMigrate completed successfully")

	// Run seeders for company database
	logger.Info("Running company seeders...")
	if err := seeders.SeedSoftwareModules(db, logger); err != nil {
		logger.Error("Company software module seeder failed", zap.Error(err))
		return err
	}

	logger.Info("Company migrations and seeding complete")
	return nil
}
