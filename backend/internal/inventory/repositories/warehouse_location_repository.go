package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type WarehouseLocationRepository struct{}

func NewWarehouseLocationRepository() *WarehouseLocationRepository {
	return &WarehouseLocationRepository{}
}

func (r *WarehouseLocationRepository) List(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.WarehouseLocation, int64, error) {
	query := db.Where("company_id = ?", companyID)

	for k, v := range filters {
		if v != "" {
			query = query.Where(k+" = ?", v)
		}
	}

	if search != "" {
		query = query.Where("(location_code LIKE ? OR location_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Model(&models.WarehouseLocation{}).Count(&total)

	var locations []models.WarehouseLocation
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Find(&locations).Error
	return locations, total, err
}

func (r *WarehouseLocationRepository) GetByID(db *gorm.DB, companyID, id uint64) (*models.WarehouseLocation, error) {
	var location models.WarehouseLocation
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&location).Error
	return &location, err
}

func (r *WarehouseLocationRepository) GetByCode(db *gorm.DB, companyID, warehouseID uint64, code string) (*models.WarehouseLocation, error) {
	var location models.WarehouseLocation
	err := db.Where("company_id = ? AND warehouse_id = ? AND location_code = ?", companyID, warehouseID, code).First(&location).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &location, err
}

func (r *WarehouseLocationRepository) Create(db *gorm.DB, location *models.WarehouseLocation) error {
	return db.Create(location).Error
}

func (r *WarehouseLocationRepository) Update(db *gorm.DB, location *models.WarehouseLocation) error {
	return db.Save(location).Error
}

func (r *WarehouseLocationRepository) Delete(db *gorm.DB, location *models.WarehouseLocation) error {
	return db.Delete(location).Error
}
