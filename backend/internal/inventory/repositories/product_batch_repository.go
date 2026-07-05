package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type ProductBatchRepository struct{}

func NewProductBatchRepository() *ProductBatchRepository {
	return &ProductBatchRepository{}
}

func (r *ProductBatchRepository) List(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.ProductBatch, int64, error) {
	query := db.Where("company_id = ?", companyID)

	for k, v := range filters {
		if v != "" {
			if k == "is_blocked" {
				query = query.Where("is_blocked = ?", v)
			} else if k == "expiry_date_from" {
				query = query.Where("expiry_date >= ?", v)
			} else if k == "expiry_date_to" {
				query = query.Where("expiry_date <= ?", v)
			} else if k == "near_expiry_days" {
				query = query.Where("expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)", v)
			} else {
				query = query.Where(k+" = ?", v)
			}
		}
	}

	if search != "" {
		query = query.Joins("LEFT JOIN products ON products.id = product_batches.product_id").
			Joins("LEFT JOIN suppliers ON suppliers.id = product_batches.supplier_id").
			Joins("LEFT JOIN manufacturers ON manufacturers.id = product_batches.manufacturer_id").
			Where("(product_batches.batch_number LIKE ? OR products.product_code LIKE ? OR products.product_name LIKE ? OR suppliers.supplier_name LIKE ? OR manufacturers.manufacturer_name LIKE ?)",
				"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	db.Model(&models.ProductBatch{}).Where("company_id = ?", companyID).Count(&total)

	var batches []models.ProductBatch
	offset := (page - 1) * limit
	err := query.Preload("Product.BaseUnit").Preload("Product").Preload("Supplier").Preload("Manufacturer").Offset(offset).Limit(limit).Find(&batches).Error
	return batches, total, err
}

func (r *ProductBatchRepository) GetByID(db *gorm.DB, companyID, id uint64) (*models.ProductBatch, error) {
	var batch models.ProductBatch
	err := db.Preload("Product.BaseUnit").Preload("Product").Preload("Supplier").Preload("Manufacturer").Where("company_id = ? AND id = ?", companyID, id).First(&batch).Error
	return &batch, err
}

func (r *ProductBatchRepository) GetByNumber(db *gorm.DB, companyID, productID uint64, batchNumber string) (*models.ProductBatch, error) {
	var batch models.ProductBatch
	err := db.Preload("Product.BaseUnit").Preload("Product").Preload("Supplier").Preload("Manufacturer").Where("company_id = ? AND product_id = ? AND batch_number = ?", companyID, productID, batchNumber).First(&batch).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &batch, err
}

func (r *ProductBatchRepository) Create(db *gorm.DB, batch *models.ProductBatch) error {
	return db.Create(batch).Error
}

func (r *ProductBatchRepository) Update(db *gorm.DB, batch *models.ProductBatch) error {
	return db.Save(batch).Error
}
