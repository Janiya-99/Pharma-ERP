package seeders

import (
	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedWarehouses(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	var mainBranch companyModels.Branch
	if err := db.Where("company_id = ? AND branch_name LIKE ?", companyID, "%Main%").First(&mainBranch).Error; err != nil {
		if err := db.Where("company_id = ?", companyID).First(&mainBranch).Error; err != nil {
			logger.Warn("No branch found for warehouse seeder, skipping")
			return nil
		}
	}

	warehouses := []models.Warehouse{
		{CompanyID: companyID, BranchID: mainBranch.ID, WarehouseCode: "MAIN-WH", WarehouseName: "Main Warehouse", WarehouseType: "main", IsDefault: true},
		{CompanyID: companyID, BranchID: mainBranch.ID, WarehouseCode: "QUAR-WH", WarehouseName: "Quarantine Warehouse", WarehouseType: "quarantine"},
		{CompanyID: companyID, BranchID: mainBranch.ID, WarehouseCode: "EXP-WH", WarehouseName: "Expired Stock Warehouse", WarehouseType: "expired"},
		{CompanyID: companyID, BranchID: mainBranch.ID, WarehouseCode: "DMG-WH", WarehouseName: "Damaged Stock Warehouse", WarehouseType: "damaged"},
	}

	for _, w := range warehouses {
		var existing models.Warehouse
		if err := db.Where("company_id = ? AND warehouse_code = ?", companyID, w.WarehouseCode).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&w).Error; err != nil {
					logger.Error("Failed to seed warehouse", zap.String("warehouse_code", w.WarehouseCode), zap.Error(err))
				}
			}
		}
	}
	return nil
}
