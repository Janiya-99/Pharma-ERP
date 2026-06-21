package models

import (
	"time"

	"gorm.io/gorm"
)

// OpeningBalance stores opening balances per account and financial year.
type OpeningBalance struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID       uint64  `gorm:"not null;uniqueIndex:idx_ob_company_fy_acc_branch" json:"company_id"`
	BranchID        *uint64 `gorm:"uniqueIndex:idx_ob_company_fy_acc_branch" json:"branch_id"`
	FinancialYearID uint64  `gorm:"not null;uniqueIndex:idx_ob_company_fy_acc_branch" json:"financial_year_id"`
	AccountID       uint64  `gorm:"not null;uniqueIndex:idx_ob_company_fy_acc_branch" json:"account_id"`

	DebitAmount  float64 `gorm:"type:decimal(18,2);default:0" json:"debit_amount"`
	CreditAmount float64 `gorm:"type:decimal(18,2);default:0" json:"credit_amount"`

	Remarks string `gorm:"type:text" json:"remarks"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	FinancialYear  FinancialYear  `gorm:"foreignKey:FinancialYearID" json:"financial_year,omitempty"`
	ChartOfAccount ChartOfAccount `gorm:"foreignKey:AccountID" json:"account,omitempty"`
}

func (OpeningBalance) TableName() string {
	return "opening_balances"
}
