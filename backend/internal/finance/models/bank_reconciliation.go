package models

import (
	"time"

	"gorm.io/gorm"
)

type BankReconciliation struct {
	ID        uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64  `gorm:"not null;uniqueIndex:idx_company_reconciliation_number" json:"company_id"`
	BranchID  *uint64 `gorm:"index" json:"branch_id"`

	BankAccountID uint64 `gorm:"not null;index" json:"bank_account_id"`

	ReconciliationNumber string `gorm:"type:varchar(50);not null;uniqueIndex:idx_company_reconciliation_number" json:"reconciliation_number"`

	StatementStartDate time.Time `gorm:"type:date;not null" json:"statement_start_date"`
	StatementEndDate   time.Time `gorm:"type:date;not null" json:"statement_end_date"`

	StatementOpeningBalance float64 `gorm:"type:decimal(18,2);default:0" json:"statement_opening_balance"`
	StatementClosingBalance float64 `gorm:"type:decimal(18,2);default:0" json:"statement_closing_balance"`

	SystemOpeningBalance float64 `gorm:"type:decimal(18,2);default:0" json:"system_opening_balance"`
	SystemClosingBalance float64 `gorm:"type:decimal(18,2);default:0" json:"system_closing_balance"`

	TotalDeposits              float64 `gorm:"type:decimal(18,2);default:0" json:"total_deposits"`
	TotalWithdrawals           float64 `gorm:"type:decimal(18,2);default:0" json:"total_withdrawals"`
	TotalReconciledDeposits    float64 `gorm:"type:decimal(18,2);default:0" json:"total_reconciled_deposits"`
	TotalReconciledWithdrawals float64 `gorm:"type:decimal(18,2);default:0" json:"total_reconciled_withdrawals"`

	DifferenceAmount float64 `gorm:"type:decimal(18,2);default:0" json:"difference_amount"`

	ReconciliationStatus string `gorm:"type:varchar(30);default:'draft';index" json:"reconciliation_status"`

	CompletedBy *uint64    `json:"completed_by"`
	CompletedAt *time.Time `json:"completed_at"`

	Remarks string `gorm:"type:text" json:"remarks"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64        `json:"created_by"`
	UpdatedBy *uint64        `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	BankAccount *BankAccount             `gorm:"foreignKey:BankAccountID" json:"bank_account,omitempty"`
	Lines       []BankReconciliationLine `gorm:"foreignKey:BankReconciliationID" json:"lines,omitempty"`
}

func (BankReconciliation) TableName() string {
	return "bank_reconciliations"
}
