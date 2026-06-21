package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type ChartOfAccountRepository struct {
	db *gorm.DB
}

func NewChartOfAccountRepository(db *gorm.DB) *ChartOfAccountRepository {
	return &ChartOfAccountRepository{db: db}
}

func (r *ChartOfAccountRepository) Create(coa *models.ChartOfAccount) error {
	return r.db.Create(coa).Error
}

func (r *ChartOfAccountRepository) Update(coa *models.ChartOfAccount) error {
	return r.db.Save(coa).Error
}

func (r *ChartOfAccountRepository) Delete(coa *models.ChartOfAccount) error {
	return r.db.Delete(coa).Error
}

func (r *ChartOfAccountRepository) FindByID(companyID, id uint64) (*models.ChartOfAccount, error) {
	var coa models.ChartOfAccount
	err := r.db.Preload("AccountClassification").Where("company_id = ? AND id = ?", companyID, id).First(&coa).Error
	if err != nil {
		return nil, err
	}
	return &coa, nil
}

func (r *ChartOfAccountRepository) FindByCode(companyID uint64, code string) (*models.ChartOfAccount, error) {
	var coa models.ChartOfAccount
	err := r.db.Where("company_id = ? AND account_code = ?", companyID, code).First(&coa).Error
	if err != nil {
		return nil, err
	}
	return &coa, nil
}

func (r *ChartOfAccountRepository) CountChildren(companyID, id uint64) (int64, error) {
	var count int64
	err := r.db.Model(&models.ChartOfAccount{}).
		Where("company_id = ? AND parent_account_id = ?", companyID, id).
		Count(&count).Error
	return count, err
}

func (r *ChartOfAccountRepository) List(companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.ChartOfAccount, int64, error) {
	var accounts []models.ChartOfAccount
	var total int64

	query := r.db.Model(&models.ChartOfAccount{}).Where("company_id = ?", companyID)

	for k, v := range filters {
		query = query.Where(k, v)
	}

	if search != "" {
		query = query.Where("account_code LIKE ? OR account_name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Preload("AccountClassification").Order("account_code ASC").Offset(offset).Limit(limit).Find(&accounts).Error

	return accounts, total, err
}
