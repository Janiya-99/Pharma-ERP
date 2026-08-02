package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type CashAccountRepository struct {
	db *gorm.DB
}

func NewCashAccountRepository(db *gorm.DB) *CashAccountRepository {
	return &CashAccountRepository{db: db}
}

func (r *CashAccountRepository) FindCashAccounts(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.CashAccount, int64, error) {
	var accounts []models.CashAccount
	var total int64

	query := r.db.Model(&models.CashAccount{}).Where("company_id = ?", companyID)

	if branchID, ok := filters["branch_id"]; ok {
		query = query.Where("branch_id = ?", branchID)
	}
	if status, ok := filters["status"]; ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("cash_account_name LIKE ? OR description LIKE ?", searchStr, searchStr)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Preload("Branch").Preload("LinkedLedgerAccount").
		Limit(limit).Offset(offset).Order("id desc").Find(&accounts).Error

	return accounts, total, err
}

func (r *CashAccountRepository) FindCashAccountByID(companyID, accountID uint64) (*models.CashAccount, error) {
	var account models.CashAccount
	err := r.db.Preload("Branch").Preload("LinkedLedgerAccount").
		Where("company_id = ? AND id = ?", companyID, accountID).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *CashAccountRepository) CreateCashAccount(account *models.CashAccount) error {
	return r.db.Create(account).Error
}

func (r *CashAccountRepository) UpdateCashAccount(account *models.CashAccount) error {
	return r.db.Save(account).Error
}
