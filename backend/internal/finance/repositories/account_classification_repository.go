package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type AccountClassificationRepository struct {
	db *gorm.DB
}

func NewAccountClassificationRepository(db *gorm.DB) *AccountClassificationRepository {
	return &AccountClassificationRepository{db: db}
}

func (r *AccountClassificationRepository) Create(ac *models.AccountClassification) error {
	return r.db.Create(ac).Error
}

func (r *AccountClassificationRepository) Update(ac *models.AccountClassification) error {
	return r.db.Save(ac).Error
}

func (r *AccountClassificationRepository) Delete(ac *models.AccountClassification) error {
	return r.db.Delete(ac).Error
}

func (r *AccountClassificationRepository) FindByID(companyID, id uint64) (*models.AccountClassification, error) {
	var ac models.AccountClassification
	err := r.db.Where("company_id = ? AND id = ?", companyID, id).First(&ac).Error
	if err != nil {
		return nil, err
	}
	return &ac, nil
}

func (r *AccountClassificationRepository) CountChildren(companyID, id uint64) (int64, error) {
	var count int64
	err := r.db.Model(&models.AccountClassification{}).
		Where("company_id = ? AND parent_id = ?", companyID, id).
		Count(&count).Error
	return count, err
}

func (r *AccountClassificationRepository) List(companyID uint64, filters map[string]interface{}) ([]models.AccountClassification, error) {
	var classifications []models.AccountClassification
	query := r.db.Where("company_id = ?", companyID)

	for k, v := range filters {
		query = query.Where(k, v)
	}

	err := query.Order("sort_order ASC").Find(&classifications).Error
	return classifications, err
}

func (r *AccountClassificationRepository) ListTree(companyID uint64) ([]models.AccountClassification, error) {
	var classifications []models.AccountClassification
	
	// Fetch Level 1 first, then preload all children recursively using GORM Preload
	err := r.db.Where("company_id = ? AND parent_id IS NULL", companyID).
		Preload("Children.Children").
		Order("sort_order ASC").
		Find(&classifications).Error
		
	return classifications, err
}
