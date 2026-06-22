package models

import (
	"time"

	"gorm.io/gorm"
)

// GeneralLedgerEntry stores every debit and credit movement posted to Finance.
type GeneralLedgerEntry struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID          uint64  `gorm:"not null;index" json:"company_id"`
	BranchID           *uint64 `gorm:"index" json:"branch_id"`
	FinancialYearID    *uint64 `gorm:"index" json:"financial_year_id"`
	AccountingPeriodID *uint64 `gorm:"index" json:"accounting_period_id"`

	TransactionDate time.Time `gorm:"type:date;not null;index" json:"transaction_date"`

	SourceType   string `gorm:"type:varchar(80);not null;index" json:"source_type"`
	SourceID     uint64 `gorm:"not null;index" json:"source_id"`
	SourceNumber string `gorm:"type:varchar(100)" json:"source_number"`

	AccountID   uint64 `gorm:"not null;index" json:"account_id"`
	AccountCode string `gorm:"type:varchar(50);index" json:"account_code"`
	AccountName string `gorm:"type:varchar(150)" json:"account_name"`

	Description string `gorm:"type:text" json:"description"`

	DebitAmount  float64 `gorm:"type:decimal(18,2);default:0" json:"debit_amount"`
	CreditAmount float64 `gorm:"type:decimal(18,2);default:0" json:"credit_amount"`

	RunningBalance float64 `gorm:"type:decimal(18,2);default:0" json:"running_balance"`
	NormalBalance  string  `gorm:"type:varchar(20)" json:"normal_balance"`

	ReferenceNumber string `gorm:"type:varchar(100)" json:"reference_number"`

	PostedBy *uint64    `json:"posted_by,omitempty"`
	PostedAt *time.Time `json:"posted_at,omitempty"`

	Status string `gorm:"type:varchar(30);default:posted" json:"status"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	FinancialYear    FinancialYear    `gorm:"foreignKey:FinancialYearID" json:"financial_year,omitempty"`
	AccountingPeriod AccountingPeriod `gorm:"foreignKey:AccountingPeriodID" json:"accounting_period,omitempty"`
	ChartOfAccount   ChartOfAccount   `gorm:"foreignKey:AccountID" json:"account,omitempty"`
}

func (GeneralLedgerEntry) TableName() string {
	return "general_ledger_entries"
}
