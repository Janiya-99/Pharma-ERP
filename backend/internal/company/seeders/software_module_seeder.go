package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SeedSoftwareModules inserts the default software modules into the software_modules table
// for the provided company database connection.
func SeedSoftwareModules(db *gorm.DB, logger *zap.Logger) error {
	modules := []models.SoftwareModule{

		{
			SoftwareCode: "CONTROL_CENTER",
			SoftwareName: "Control Center",
			Description:  "Central administration and company management hub",
			IconName:     "settings",
			RoutePath:    "/control-center",
			DisplayOrder: 1,
			Status:       "active",
		},
		{
			SoftwareCode: "FINANCE",
			SoftwareName: "Finance",
			Description:  "Financial management, chart of accounts, journal entries, and reporting",
			IconName:     "dollar-sign",
			RoutePath:    "/finance",
			DisplayOrder: 2,
			Status:       "active",
		},
		{
			SoftwareCode: "INVENTORY",
			SoftwareName: "Inventory",
			Description:  "Warehouse, product, and stock management",
			IconName:     "package",
			RoutePath:    "/inventory",
			DisplayOrder: 3,
			Status:       "active",
		},
		{
			SoftwareCode: "INVOICE_CENTER",
			SoftwareName: "Invoice Center",
			Description:  "Sales invoicing, customer receipts, and billing",
			IconName:     "file-text",
			RoutePath:    "/invoice-center",
			DisplayOrder: 4,
			Status:       "active",
		},
		{
			SoftwareCode: "COMPLIANCE_CENTER",
			SoftwareName: "Compliance Center",
			Description:  "Regulatory compliance tracking and audit management",
			IconName:     "shield",
			RoutePath:    "/compliance-center",
			DisplayOrder: 5,
			Status:       "active",
		},
	}

	for _, module := range modules {
		var existing models.SoftwareModule
		result := db.Where("software_code = ?", module.SoftwareCode).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&module).Error; err != nil {
				logger.Error("Failed to seed software module in company db",
					zap.String("code", module.SoftwareCode),
					zap.Error(err),
				)
				return err
			}
			logger.Info("Seeded software module in company db",
				zap.String("code", module.SoftwareCode),
				zap.String("name", module.SoftwareName),
			)
		} else if result.Error != nil {
			return result.Error
		} else {
			logger.Debug("Software module already exists in company db, skipping",
				zap.String("code", module.SoftwareCode),
			)
		}
	}

	return nil
}
