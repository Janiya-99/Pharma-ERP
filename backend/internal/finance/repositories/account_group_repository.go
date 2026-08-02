package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type AccountGroupRepository struct {
	db *gorm.DB
}

func NewAccountGroupRepository(db *gorm.DB) *AccountGroupRepository {
	return &AccountGroupRepository{db: db}
}

func (r *AccountGroupRepository) List(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.AccountGroup, int64, error) {
	var groups []models.AccountGroup
	var total int64

	query := r.db.Model(&models.AccountGroup{}).Where("company_id = ?", companyID)

	if accountType, ok := filters["account_type"]; ok && accountType != "" {
		query = query.Where("account_type = ?", accountType)
	}
	if status, ok := filters["status"]; ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if parentID, ok := filters["parent_group_id"]; ok && parentID != "" {
		query = query.Where("parent_group_id = ?", parentID)
	}
	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("group_code LIKE ? OR group_name LIKE ? OR description LIKE ?", searchStr, searchStr, searchStr)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Preload("Parent").Limit(limit).Offset(offset).Order("group_code asc").Find(&groups).Error

	return groups, total, err
}

func (r *AccountGroupRepository) FindByID(companyID, id uint64) (*models.AccountGroup, error) {
	var group models.AccountGroup
	err := r.db.Preload("Parent").Where("company_id = ? AND id = ?", companyID, id).First(&group).Error
	if err != nil {
		return nil, err
	}
	return &group, nil
}

func (r *AccountGroupRepository) Create(group *models.AccountGroup) error {
	return r.db.Create(group).Error
}

func (r *AccountGroupRepository) Update(group *models.AccountGroup) error {
	return r.db.Save(group).Error
}
