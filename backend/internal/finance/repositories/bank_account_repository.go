package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type BankAccountRepository struct {
	db *gorm.DB
}

func NewBankAccountRepository(db *gorm.DB) *BankAccountRepository {
	return &BankAccountRepository{db: db}
}

func (r *BankAccountRepository) FindBankAccounts(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.BankAccount, int64, error) {
	var accounts []models.BankAccount
	var total int64

	query := r.db.Model(&models.BankAccount{}).Where("company_id = ?", companyID)

	if branchID, ok := filters["branch_id"]; ok {
		query = query.Where("branch_id = ?", branchID)
	}

	if status, ok := filters["status"]; ok && status != "" {
		query = query.Where("status = ?", status)
	}

	if isDefault, ok := filters["is_default"]; ok {
		query = query.Where("is_default = ?", isDefault)
	}

	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("(bank_name LIKE ? OR account_name LIKE ? OR account_number LIKE ?)", searchStr, searchStr, searchStr)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Preload("ChartAccount").Limit(limit).Offset(offset).Order("id desc").Find(&accounts).Error

	return accounts, total, err
}

func (r *BankAccountRepository) FindBankAccountByID(companyID, accountID uint64) (*models.BankAccount, error) {
	var account models.BankAccount
	err := r.db.Preload("ChartAccount").Where("company_id = ? AND id = ?", companyID, accountID).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *BankAccountRepository) CreateBankAccount(account *models.BankAccount) error {
	return r.db.Create(account).Error
}

func (r *BankAccountRepository) UpdateBankAccount(account *models.BankAccount) error {
	return r.db.Save(account).Error
}

func (r *BankAccountRepository) SoftDeleteBankAccount(account *models.BankAccount) error {
	return r.db.Delete(account).Error
}

func (r *BankAccountRepository) UnsetOtherDefaultAccounts(companyID, excludeID uint64) error {
	query := r.db.Model(&models.BankAccount{}).Where("company_id = ?", companyID)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	return query.Update("is_default", false).Error
}
