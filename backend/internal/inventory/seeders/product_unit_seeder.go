package seeders

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedProductUnits(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	units := []models.ProductUnit{
		{CompanyID: companyID, UnitCode: "PCS", UnitName: "Pieces"},
		{CompanyID: companyID, UnitCode: "BOX", UnitName: "Box"},
		{CompanyID: companyID, UnitCode: "CTN", UnitName: "Carton"},
		{CompanyID: companyID, UnitCode: "BTL", UnitName: "Bottle"},
		{CompanyID: companyID, UnitCode: "STRIP", UnitName: "Strip"},
		{CompanyID: companyID, UnitCode: "TAB", UnitName: "Tablet"},
		{CompanyID: companyID, UnitCode: "CAP", UnitName: "Capsule"},
		{CompanyID: companyID, UnitCode: "ML", UnitName: "Millilitre"},
		{CompanyID: companyID, UnitCode: "MG", UnitName: "Milligram"},
		{CompanyID: companyID, UnitCode: "G", UnitName: "Gram"},
	}

	for _, unit := range units {
		var existing models.ProductUnit
		if err := db.Where("company_id = ? AND unit_code = ?", companyID, unit.UnitCode).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&unit).Error; err != nil {
					logger.Error("Failed to seed product unit", zap.String("unit_code", unit.UnitCode), zap.Error(err))
				}
			}
		}
	}
	return nil
}
