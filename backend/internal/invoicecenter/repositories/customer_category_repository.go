package repositories

import (
	"errors"
	"strings"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type CustomerCategoryRepository struct{}

func NewCustomerCategoryRepository() *CustomerCategoryRepository {
	return &CustomerCategoryRepository{}
}

func (r *CustomerCategoryRepository) List(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.CustomerCategory, int64, error) {
	var categories []models.CustomerCategory
	var total int64

	query := db.Model(&models.CustomerCategory{}).Where("company_id = ?", companyID)
	if search != "" {
		s := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(category_code) LIKE ? OR LOWER(category_name) LIKE ?", s, s)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if limit > 0 {
		offset := (page - 1) * limit
		query = query.Offset(offset).Limit(limit)
	}

	if err := query.Order("id asc").Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (r *CustomerCategoryRepository) GetByID(db *gorm.DB, companyID uint64, id uint64) (*models.CustomerCategory, int64, error) {
	var category models.CustomerCategory
	if err := db.Where("company_id = ? AND id = ?", companyID, id).First(&category).Error; err != nil {
		return nil, 0, err
	}

	var count int64
	db.Model(&models.Customer{}).Where("company_id = ? AND customer_category_id = ?", companyID, id).Count(&count)

	return &category, count, nil
}

func (r *CustomerCategoryRepository) GetByCode(db *gorm.DB, companyID uint64, code string) (*models.CustomerCategory, error) {
	var category models.CustomerCategory
	if err := db.Where("company_id = ? AND LOWER(category_code) = ?", companyID, strings.ToLower(code)).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CustomerCategoryRepository) Create(db *gorm.DB, category *models.CustomerCategory) error {
	return db.Create(category).Error
}

func (r *CustomerCategoryRepository) Update(db *gorm.DB, category *models.CustomerCategory) error {
	return db.Save(category).Error
}

func (r *CustomerCategoryRepository) Delete(db *gorm.DB, companyID uint64, id uint64) error {
	var category models.CustomerCategory
	if err := db.Where("company_id = ? AND id = ?", companyID, id).First(&category).Error; err != nil {
		return err
	}

	// Check if linked to customers
	var count int64
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND customer_category_id = ?", companyID, id).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("cannot delete category linked to existing customers")
	}

	// Check default categories
	defaults := map[string]bool{
		"RETAIL":      true,
		"WHOLESALE":   true,
		"PHARMACY":    true,
		"HOSPITAL":    true,
		"CLINIC":      true,
		"DISTRIBUTOR": true,
	}
	if defaults[strings.ToUpper(category.CategoryCode)] {
		return errors.New("cannot delete system default category")
	}

	return db.Delete(&category).Error
}
