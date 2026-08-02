package seeders

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedProductCategories(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	parents := []models.ProductCategory{
		{CompanyID: companyID, CategoryCode: "MED", CategoryName: "Medicine", Level: 1},
		{CompanyID: companyID, CategoryCode: "DEV", CategoryName: "Medical Devices", Level: 1},
		{CompanyID: companyID, CategoryCode: "CON", CategoryName: "Consumables", Level: 1},
		{CompanyID: companyID, CategoryCode: "OTH", CategoryName: "Other", Level: 1},
	}

	for _, p := range parents {
		var existing models.ProductCategory
		if err := db.Where("company_id = ? AND category_code = ?", companyID, p.CategoryCode).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				db.Create(&p)
			}
		}
	}

	var medParent models.ProductCategory
	if err := db.Where("company_id = ? AND category_code = ?", companyID, "MED").First(&medParent).Error; err == nil {
		children := []models.ProductCategory{
			{CompanyID: companyID, CategoryCode: "MED-TAB", CategoryName: "Tablet", ParentID: &medParent.ID, Level: 2},
			{CompanyID: companyID, CategoryCode: "MED-CAP", CategoryName: "Capsule", ParentID: &medParent.ID, Level: 2},
			{CompanyID: companyID, CategoryCode: "MED-SYR", CategoryName: "Syrup", ParentID: &medParent.ID, Level: 2},
			{CompanyID: companyID, CategoryCode: "MED-INJ", CategoryName: "Injection", ParentID: &medParent.ID, Level: 2},
		}
		for _, c := range children {
			var existing models.ProductCategory
			if err := db.Where("company_id = ? AND category_code = ?", companyID, c.CategoryCode).First(&existing).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					db.Create(&c)
				}
			}
		}
	}

	return nil
}
