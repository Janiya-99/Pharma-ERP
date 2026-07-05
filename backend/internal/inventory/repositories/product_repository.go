package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type ProductRepository struct{}

func NewProductRepository() *ProductRepository {
	return &ProductRepository{}
}

func (r *ProductRepository) List(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.Product, int64, error) {
	query := db.Where("company_id = ?", companyID)

	for k, v := range filters {
		if v != "" {
			query = query.Where(k+" = ?", v)
		}
	}

	if search != "" {
		query = query.Joins("LEFT JOIN generic_names ON generic_names.id = products.generic_name_id").
			Joins("LEFT JOIN product_barcodes ON product_barcodes.product_id = products.id").
			Where("(products.product_code LIKE ? OR products.product_name LIKE ? OR generic_names.generic_name LIKE ? OR products.nmra_registration_number LIKE ? OR product_barcodes.barcode LIKE ?)",
				"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%").
			Group("products.id")
	}

	var total int64
	// In gorm, count with group by requires a subquery or omitting joins if possible.
	// For simplicity, we just count the distinct products
	db.Model(&models.Product{}).Where("company_id = ?", companyID).Count(&total)

	var products []models.Product
	offset := (page - 1) * limit
	err := query.Preload("ProductCategory").Preload("GenericName").Preload("DosageForm").Preload("Manufacturer").Preload("BaseUnit").Offset(offset).Limit(limit).Find(&products).Error
	return products, total, err
}

func (r *ProductRepository) GetByID(db *gorm.DB, companyID, id uint64) (*models.Product, error) {
	var product models.Product
	err := db.Preload("ProductCategory").Preload("GenericName").Preload("DosageForm").Preload("Manufacturer").Preload("BaseUnit").Where("company_id = ? AND id = ?", companyID, id).First(&product).Error
	return &product, err
}

func (r *ProductRepository) GetByCode(db *gorm.DB, companyID uint64, code string) (*models.Product, error) {
	var product models.Product
	err := db.Preload("ProductCategory").Preload("GenericName").Preload("DosageForm").Preload("Manufacturer").Preload("BaseUnit").Where("company_id = ? AND product_code = ?", companyID, code).First(&product).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &product, err
}

func (r *ProductRepository) Create(db *gorm.DB, product *models.Product) error {
	return db.Create(product).Error
}

func (r *ProductRepository) Update(db *gorm.DB, product *models.Product) error {
	return db.Save(product).Error
}

func (r *ProductRepository) Delete(db *gorm.DB, product *models.Product) error {
	return db.Delete(product).Error
}

func (r *ProductRepository) GetBarcodes(db *gorm.DB, productID uint64) ([]models.ProductBarcode, error) {
	var barcodes []models.ProductBarcode
	err := db.Where("product_id = ?", productID).Find(&barcodes).Error
	return barcodes, err
}

func (r *ProductRepository) GetBarcode(db *gorm.DB, companyID uint64, barcode string) (*models.ProductBarcode, error) {
	var res models.ProductBarcode
	err := db.Where("company_id = ? AND barcode = ?", companyID, barcode).First(&res).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &res, err
}

func (r *ProductRepository) ReplaceBarcodes(db *gorm.DB, productID uint64, barcodes []models.ProductBarcode) error {
	if err := db.Where("product_id = ?", productID).Delete(&models.ProductBarcode{}).Error; err != nil {
		return err
	}
	if len(barcodes) > 0 {
		return db.Create(&barcodes).Error
	}
	return nil
}
