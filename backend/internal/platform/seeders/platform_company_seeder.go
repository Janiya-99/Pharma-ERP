package seeders

import (
	"github.com/pixandco/erp-phrma/internal/platform/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedPlatformCompanies(db *gorm.DB, logger *zap.Logger) error {
	company := models.PlatformCompany{
		CompanyCode:        "OMACX",
		CompanyName:        "OMACX Pharma",
		DatabaseName:       "erp_omacx",
		Status:             "active",
		SubscriptionStatus: "active",
	}

	result := db.Where("company_code = ?", company.CompanyCode).FirstOrCreate(&company)
	if result.Error != nil {
		logger.Error("Failed to seed platform company", zap.Error(result.Error))
		return result.Error
	}

	logger.Info("Platform company seeding completed", zap.String("company_code", company.CompanyCode))
	return nil
}
