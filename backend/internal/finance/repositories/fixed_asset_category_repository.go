package repositories

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type FixedAssetCategoryRepository struct {
	db *gorm.DB
}

func NewFixedAssetCategoryRepository(db *gorm.DB) *FixedAssetCategoryRepository {
	return &FixedAssetCategoryRepository{db: db}
}

func (r *FixedAssetCategoryRepository) FindFixedAssetCategories(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAssetCategory, int64, error) {
	var categories []models.FixedAssetCategory
	var total int64

	query := r.db.Model(&models.FixedAssetCategory{}).Where("company_id = ?", companyID)

	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("category_code LIKE ? OR category_name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.
		Preload("DefaultAssetAccount").
		Preload("DefaultAccumulatedDepreciationAccount").
		Preload("DefaultDepreciationExpenseAccount").
		Preload("DefaultGainOnDisposalAccount").
		Preload("DefaultLossOnDisposalAccount").
		Offset(offset).Limit(limit).Order("id DESC").Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (r *FixedAssetCategoryRepository) FindFixedAssetCategoryByID(id uint64, companyID uint64) (*models.FixedAssetCategory, error) {
	var category models.FixedAssetCategory
	if err := r.db.
		Preload("DefaultAssetAccount").
		Preload("DefaultAccumulatedDepreciationAccount").
		Preload("DefaultDepreciationExpenseAccount").
		Preload("DefaultGainOnDisposalAccount").
		Preload("DefaultLossOnDisposalAccount").
		Where("id = ? AND company_id = ?", id, companyID).First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("fixed asset category not found")
		}
		return nil, err
	}
	return &category, nil
}

func (r *FixedAssetCategoryRepository) CreateFixedAssetCategory(category *models.FixedAssetCategory) error {
	return r.db.Create(category).Error
}

func (r *FixedAssetCategoryRepository) UpdateFixedAssetCategory(category *models.FixedAssetCategory) error {
	return r.db.Save(category).Error
}

func (r *FixedAssetCategoryRepository) SoftDeleteFixedAssetCategory(id uint64, companyID uint64) error {
	result := r.db.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.FixedAssetCategory{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("fixed asset category not found")
	}
	return nil
}
