package models

import (
	"time"
)

type BankReconciliationLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	BankReconciliationID uint64 `gorm:"not null;uniqueIndex:idx_recon_trans" json:"bank_reconciliation_id"`
	BankTransactionID    uint64 `gorm:"not null;uniqueIndex:idx_recon_trans" json:"bank_transaction_id"`

	IsReconciled   bool       `gorm:"default:false" json:"is_reconciled"`
	ReconciledDate *time.Time `gorm:"type:date" json:"reconciled_date"`

	Remarks string `gorm:"type:text" json:"remarks"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	BankReconciliation *BankReconciliation `gorm:"foreignKey:BankReconciliationID" json:"bank_reconciliation,omitempty"`
	BankTransaction    *BankTransaction    `gorm:"foreignKey:BankTransactionID" json:"bank_transaction,omitempty"`
}

func (BankReconciliationLine) TableName() string {
	return "bank_reconciliation_lines"
}
