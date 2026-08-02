package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type WarehouseRepository struct{}

func NewWarehouseRepository() *WarehouseRepository {
	return &WarehouseRepository{}
}

func (r *WarehouseRepository) List(db *gorm.DB, companyID uint64, branchID *uint64, filters map[string]interface{}, search string, page, limit int) ([]models.Warehouse, int64, error) {
	query := db.Where("company_id = ?", companyID)
	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	}

	for k, v := range filters {
		if v != "" {
			query = query.Where(k+" = ?", v)
		}
	}

	if search != "" {
		query = query.Where("(warehouse_code LIKE ? OR warehouse_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Model(&models.Warehouse{}).Count(&total)

	var warehouses []models.Warehouse
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Find(&warehouses).Error
	return warehouses, total, err
}

func (r *WarehouseRepository) GetByID(db *gorm.DB, companyID, id uint64) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&warehouse).Error
	return &warehouse, err
}

func (r *WarehouseRepository) GetByCode(db *gorm.DB, companyID uint64, code string) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := db.Where("company_id = ? AND warehouse_code = ?", companyID, code).First(&warehouse).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &warehouse, err
}

func (r *WarehouseRepository) Create(db *gorm.DB, warehouse *models.Warehouse) error {
	return db.Create(warehouse).Error
}

func (r *WarehouseRepository) Update(db *gorm.DB, warehouse *models.Warehouse) error {
	return db.Save(warehouse).Error
}

func (r *WarehouseRepository) Delete(db *gorm.DB, warehouse *models.Warehouse) error {
	return db.Delete(warehouse).Error
}

func (r *WarehouseRepository) UnsetOtherDefaults(db *gorm.DB, companyID, branchID, excludeID uint64) error {
	return db.Model(&models.Warehouse{}).
		Where("company_id = ? AND branch_id = ? AND id != ?", companyID, branchID, excludeID).
		Update("is_default", false).Error
}
