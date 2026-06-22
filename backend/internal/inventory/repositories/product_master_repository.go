package repositories

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

// Helper methods for Product Masters (Category, Unit, DosageForm, GenericName, Manufacturer, Supplier)

type ProductMasterRepository struct{}

func NewProductMasterRepository() *ProductMasterRepository {
	return &ProductMasterRepository{}
}

// Category
func (r *ProductMasterRepository) ListCategories(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.ProductCategory, int64, error) {
	query := db.Where("company_id = ?", companyID)
	for k, v := range filters {
		if v != "" {
			query = query.Where(k+" = ?", v)
		}
	}
	if search != "" {
		query = query.Where("(category_code LIKE ? OR category_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	var total int64
	query.Model(&models.ProductCategory{}).Count(&total)
	var list []models.ProductCategory
	err := query.Offset((page - 1) * limit).Limit(limit).Find(&list).Error
	return list, total, err
}
func (r *ProductMasterRepository) GetCategoryByID(db *gorm.DB, companyID, id uint64) (*models.ProductCategory, error) {
	var res models.ProductCategory
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&res).Error
	return &res, err
}
func (r *ProductMasterRepository) GetCategoryByCode(db *gorm.DB, companyID uint64, code string) (*models.ProductCategory, error) {
	var res models.ProductCategory
	err := db.Where("company_id = ? AND category_code = ?", companyID, code).First(&res).Error
	return &res, err
}

// Unit
func (r *ProductMasterRepository) ListUnits(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.ProductUnit, int64, error) {
	query := db.Where("company_id = ?", companyID)
	if search != "" {
		query = query.Where("(unit_code LIKE ? OR unit_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	var total int64
	query.Model(&models.ProductUnit{}).Count(&total)
	var list []models.ProductUnit
	err := query.Offset((page - 1) * limit).Limit(limit).Find(&list).Error
	return list, total, err
}
func (r *ProductMasterRepository) GetUnitByID(db *gorm.DB, companyID, id uint64) (*models.ProductUnit, error) {
	var res models.ProductUnit
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&res).Error
	return &res, err
}
func (r *ProductMasterRepository) GetUnitByCode(db *gorm.DB, companyID uint64, code string) (*models.ProductUnit, error) {
	var res models.ProductUnit
	err := db.Where("company_id = ? AND unit_code = ?", companyID, code).First(&res).Error
	return &res, err
}

// Dosage Form
func (r *ProductMasterRepository) ListDosageForms(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.DosageForm, int64, error) {
	query := db.Where("company_id = ?", companyID)
	if search != "" {
		query = query.Where("(dosage_form_code LIKE ? OR dosage_form_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	var total int64
	query.Model(&models.DosageForm{}).Count(&total)
	var list []models.DosageForm
	err := query.Offset((page - 1) * limit).Limit(limit).Find(&list).Error
	return list, total, err
}
func (r *ProductMasterRepository) GetDosageFormByID(db *gorm.DB, companyID, id uint64) (*models.DosageForm, error) {
	var res models.DosageForm
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&res).Error
	return &res, err
}
func (r *ProductMasterRepository) GetDosageFormByCode(db *gorm.DB, companyID uint64, code string) (*models.DosageForm, error) {
	var res models.DosageForm
	err := db.Where("company_id = ? AND dosage_form_code = ?", companyID, code).First(&res).Error
	return &res, err
}

// Generic Name
func (r *ProductMasterRepository) ListGenericNames(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.GenericName, int64, error) {
	query := db.Where("company_id = ?", companyID)
	if search != "" {
		query = query.Where("(generic_code LIKE ? OR generic_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	var total int64
	query.Model(&models.GenericName{}).Count(&total)
	var list []models.GenericName
	err := query.Offset((page - 1) * limit).Limit(limit).Find(&list).Error
	return list, total, err
}
func (r *ProductMasterRepository) GetGenericNameByID(db *gorm.DB, companyID, id uint64) (*models.GenericName, error) {
	var res models.GenericName
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&res).Error
	return &res, err
}
func (r *ProductMasterRepository) GetGenericNameByCode(db *gorm.DB, companyID uint64, code string) (*models.GenericName, error) {
	var res models.GenericName
	err := db.Where("company_id = ? AND generic_code = ?", companyID, code).First(&res).Error
	return &res, err
}

// Manufacturer
func (r *ProductMasterRepository) ListManufacturers(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.Manufacturer, int64, error) {
	query := db.Where("company_id = ?", companyID)
	if search != "" {
		query = query.Where("(manufacturer_code LIKE ? OR manufacturer_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	var total int64
	query.Model(&models.Manufacturer{}).Count(&total)
	var list []models.Manufacturer
	err := query.Offset((page - 1) * limit).Limit(limit).Find(&list).Error
	return list, total, err
}
func (r *ProductMasterRepository) GetManufacturerByID(db *gorm.DB, companyID, id uint64) (*models.Manufacturer, error) {
	var res models.Manufacturer
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&res).Error
	return &res, err
}
func (r *ProductMasterRepository) GetManufacturerByCode(db *gorm.DB, companyID uint64, code string) (*models.Manufacturer, error) {
	var res models.Manufacturer
	err := db.Where("company_id = ? AND manufacturer_code = ?", companyID, code).First(&res).Error
	return &res, err
}

// Supplier
func (r *ProductMasterRepository) ListSuppliers(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.Supplier, int64, error) {
	query := db.Where("company_id = ?", companyID)
	if search != "" {
		query = query.Where("(supplier_code LIKE ? OR supplier_name LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	var total int64
	query.Model(&models.Supplier{}).Count(&total)
	var list []models.Supplier
	err := query.Offset((page - 1) * limit).Limit(limit).Find(&list).Error
	return list, total, err
}
func (r *ProductMasterRepository) GetSupplierByID(db *gorm.DB, companyID, id uint64) (*models.Supplier, error) {
	var res models.Supplier
	err := db.Where("company_id = ? AND id = ?", companyID, id).First(&res).Error
	return &res, err
}
func (r *ProductMasterRepository) GetSupplierByCode(db *gorm.DB, companyID uint64, code string) (*models.Supplier, error) {
	var res models.Supplier
	err := db.Where("company_id = ? AND supplier_code = ?", companyID, code).First(&res).Error
	return &res, err
}

// Generic Create/Update/Delete
func (r *ProductMasterRepository) Create(db *gorm.DB, model interface{}) error {
	return db.Create(model).Error
}
func (r *ProductMasterRepository) Update(db *gorm.DB, model interface{}) error {
	return db.Save(model).Error
}
func (r *ProductMasterRepository) Delete(db *gorm.DB, model interface{}) error {
	return db.Delete(model).Error
}
