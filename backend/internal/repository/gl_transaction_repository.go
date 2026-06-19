package repository

import (
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// GlTransactionRepository handles general ledger transactions data access.
type GlTransactionRepository struct {
	db *gorm.DB
}

func NewGlTransactionRepository(db *gorm.DB) *GlTransactionRepository {
	return &GlTransactionRepository{db: db}
}

// CreateEntries batch creates GL transaction entries within a transaction.
func (r *GlTransactionRepository) CreateEntries(tx *gorm.DB, entries []model.GlTransaction) error {
	return tx.Create(&entries).Error
}

// GetAccountBalance returns the total debits, credits, and net balance for an account.
func (r *GlTransactionRepository) GetAccountBalance(branchID uint64, glID uint64) (debit, credit, balance decimal.Decimal, err error) {
	type Result struct {
		TotalDebit  decimal.Decimal
		TotalCredit decimal.Decimal
	}
	var result Result
	err = r.db.Model(&model.GlTransaction{}).
		Where("branch_id = ? AND gl_id = ?", branchID, glID).
		Select(`
			COALESCE(SUM(CASE WHEN transaction_type = 'DR' THEN transaction_amount ELSE 0 END), 0) as total_debit, 
			COALESCE(SUM(CASE WHEN transaction_type = 'CR' THEN transaction_amount ELSE 0 END), 0) as total_credit
		`).
		Scan(&result).Error
	if err != nil {
		return
	}
	debit = result.TotalDebit
	credit = result.TotalCredit
	balance = debit.Sub(credit)
	return
}

// DeleteByReference removes transactions by their polymorphic reference (within transaction).
func (r *GlTransactionRepository) DeleteByReference(tx *gorm.DB, refType string, refID uint64) error {
	return tx.Where("reference_type = ? AND reference_id = ?", refType, refID).
		Delete(&model.GlTransaction{}).Error
}
