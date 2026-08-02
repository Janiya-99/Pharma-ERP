package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type OpeningBalanceRepository struct {
	db *gorm.DB
}

func NewOpeningBalanceRepository(db *gorm.DB) *OpeningBalanceRepository {
	return &OpeningBalanceRepository{db: db}
}

func (r *OpeningBalanceRepository) Create(ob *models.OpeningBalance) error {
	return r.db.Create(ob).Error
}

func (r *OpeningBalanceRepository) Update(ob *models.OpeningBalance) error {
	return r.db.Save(ob).Error
}

func (r *OpeningBalanceRepository) Delete(ob *models.OpeningBalance) error {
	return r.db.Delete(ob).Error
}

func (r *OpeningBalanceRepository) FindByID(companyID, id uint64) (*models.OpeningBalance, error) {
	var ob models.OpeningBalance
	err := r.db.Preload("FinancialYear").Preload("ChartOfAccount").
		Where("company_id = ? AND id = ?", companyID, id).First(&ob).Error
	if err != nil {
		return nil, err
	}
	return &ob, nil
}

func (r *OpeningBalanceRepository) FindDuplicate(companyID, financialYearID, accountID uint64, branchID *uint64) (*models.OpeningBalance, error) {
	var ob models.OpeningBalance
	query := r.db.Where("company_id = ? AND financial_year_id = ? AND account_id = ?", companyID, financialYearID, accountID)
	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	} else {
		query = query.Where("branch_id IS NULL")
	}
	err := query.First(&ob).Error
	if err != nil {
		return nil, err
	}
	return &ob, nil
}

func (r *OpeningBalanceRepository) List(companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.OpeningBalance, int64, error) {
	var balances []models.OpeningBalance
	var total int64

	query := r.db.Model(&models.OpeningBalance{}).Where("company_id = ?", companyID)

	for k, v := range filters {
		query = query.Where(k, v)
	}

	if search != "" {
		query = query.Joins("JOIN chart_of_accounts coa ON coa.id = opening_balances.account_id").
			Where("coa.account_code LIKE ? OR coa.account_name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Preload("FinancialYear").Preload("ChartOfAccount").
		Order("id DESC").Offset(offset).Limit(limit).Find(&balances).Error

	return balances, total, err
}
