package models

import (
	"time"

	"gorm.io/gorm"
)

type BankTransaction struct {
	ID        uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64  `gorm:"not null;index" json:"company_id"`
	BranchID  *uint64 `gorm:"index" json:"branch_id"`

	BankAccountID  uint64 `gorm:"not null;index" json:"bank_account_id"`
	ChartAccountID uint64 `gorm:"not null;index" json:"chart_account_id"`

	TransactionDate time.Time  `gorm:"type:date;not null;index" json:"transaction_date"`
	ValueDate       *time.Time `gorm:"type:date" json:"value_date"`

	TransactionType string `gorm:"type:varchar(30);not null" json:"transaction_type"`

	ReferenceType   string  `gorm:"type:varchar(50)" json:"reference_type"`
	ReferenceID     *uint64 `json:"reference_id"`
	ReferenceNumber string  `gorm:"type:varchar(100)" json:"reference_number"`

	Description string `gorm:"type:text" json:"description"`

	DebitAmount  float64 `gorm:"type:decimal(18,2);default:0" json:"debit_amount"`
	CreditAmount float64 `gorm:"type:decimal(18,2);default:0" json:"credit_amount"`

	RunningBalance float64 `gorm:"type:decimal(18,2);default:0" json:"running_balance"`

	IsReconciled bool       `gorm:"default:false;index" json:"is_reconciled"`
	ReconciledAt *time.Time `json:"reconciled_at"`
	ReconciledBy *uint64    `json:"reconciled_by"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64        `json:"created_by"`
	UpdatedBy *uint64        `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	BankAccount  *BankAccount    `gorm:"foreignKey:BankAccountID" json:"bank_account,omitempty"`
	ChartAccount *ChartOfAccount `gorm:"foreignKey:ChartAccountID" json:"chart_account,omitempty"`
}

func (BankTransaction) TableName() string {
	return "bank_transactions"
}
