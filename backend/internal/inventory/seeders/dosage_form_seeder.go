package seeders

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedDosageForms(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	forms := []models.DosageForm{
		{CompanyID: companyID, DosageFormCode: "TAB", DosageFormName: "Tablet"},
		{CompanyID: companyID, DosageFormCode: "CAP", DosageFormName: "Capsule"},
		{CompanyID: companyID, DosageFormCode: "SYR", DosageFormName: "Syrup"},
		{CompanyID: companyID, DosageFormCode: "INJ", DosageFormName: "Injection"},
		{CompanyID: companyID, DosageFormCode: "CRM", DosageFormName: "Cream"},
		{CompanyID: companyID, DosageFormCode: "OIN", DosageFormName: "Ointment"},
		{CompanyID: companyID, DosageFormCode: "DRP", DosageFormName: "Drops"},
		{CompanyID: companyID, DosageFormCode: "SUS", DosageFormName: "Suspension"},
	}

	for _, form := range forms {
		var existing models.DosageForm
		if err := db.Where("company_id = ? AND dosage_form_code = ?", companyID, form.DosageFormCode).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&form).Error; err != nil {
					logger.Error("Failed to seed dosage form", zap.String("dosage_form_code", form.DosageFormCode), zap.Error(err))
				}
			}
		}
	}
	return nil
}
