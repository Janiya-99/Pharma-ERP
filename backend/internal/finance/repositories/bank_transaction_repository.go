package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type BankTransactionRepository struct {
	db *gorm.DB
}

func NewBankTransactionRepository(db *gorm.DB) *BankTransactionRepository {
	return &BankTransactionRepository{db: db}
}

func (r *BankTransactionRepository) FindBankTransactions(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.BankTransaction, int64, error) {
	var transactions []models.BankTransaction
	var total int64

	query := r.db.Model(&models.BankTransaction{}).Where("company_id = ?", companyID)

	if accountID, ok := filters["bank_account_id"]; ok {
		query = query.Where("bank_account_id = ?", accountID)
	}

	if tType, ok := filters["transaction_type"]; ok && tType != "" {
		query = query.Where("transaction_type = ?", tType)
	}

	if isReconciled, ok := filters["is_reconciled"]; ok {
		query = query.Where("is_reconciled = ?", isReconciled)
	}

	if dateFrom, ok := filters["transaction_date_from"]; ok && dateFrom != "" {
		query = query.Where("transaction_date >= ?", dateFrom)
	}

	if dateTo, ok := filters["transaction_date_to"]; ok && dateTo != "" {
		query = query.Where("transaction_date <= ?", dateTo)
	}

	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("(reference_number LIKE ? OR description LIKE ?)", searchStr, searchStr)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Preload("BankAccount").Preload("ChartAccount").Limit(limit).Offset(offset).Order("transaction_date desc, id desc").Find(&transactions).Error

	return transactions, total, err
}

func (r *BankTransactionRepository) FindBankTransactionByID(companyID, transactionID uint64) (*models.BankTransaction, error) {
	var transaction models.BankTransaction
	err := r.db.Preload("BankAccount").Preload("ChartAccount").Where("company_id = ? AND id = ?", companyID, transactionID).First(&transaction).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *BankTransactionRepository) FindUnreconciledTransactions(companyID, accountID uint64, filters map[string]interface{}) ([]models.BankTransaction, error) {
	var transactions []models.BankTransaction

	query := r.db.Model(&models.BankTransaction{}).Where("company_id = ? AND bank_account_id = ? AND is_reconciled = ?", companyID, accountID, false)

	if dateFrom, ok := filters["date_from"]; ok && dateFrom != "" {
		query = query.Where("transaction_date >= ?", dateFrom)
	}

	if dateTo, ok := filters["date_to"]; ok && dateTo != "" {
		query = query.Where("transaction_date <= ?", dateTo)
	}

	if tType, ok := filters["transaction_type"]; ok && tType != "" {
		query = query.Where("transaction_type = ?", tType)
	}

	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("(reference_number LIKE ? OR description LIKE ?)", searchStr, searchStr)
	}

	err := query.Order("transaction_date asc, id asc").Find(&transactions).Error
	return transactions, err
}

func (r *BankTransactionRepository) CreateBankTransaction(tx *gorm.DB, transaction *models.BankTransaction) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.Create(transaction).Error
}

func (r *BankTransactionRepository) UpdateBankTransaction(transaction *models.BankTransaction) error {
	return r.db.Save(transaction).Error
}

func (r *BankTransactionRepository) SoftDeleteBankTransaction(transaction *models.BankTransaction) error {
	return r.db.Delete(transaction).Error
}

func (r *BankTransactionRepository) GetLastTransactionForAccount(accountID uint64) (*models.BankTransaction, error) {
	var transaction models.BankTransaction
	err := r.db.Where("bank_account_id = ?", accountID).Order("transaction_date desc, id desc").First(&transaction).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &transaction, nil
}
