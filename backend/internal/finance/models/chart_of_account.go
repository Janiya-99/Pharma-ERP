package models

import (
	"time"

	"gorm.io/gorm"
)

// ChartOfAccount represents an actual ledger account.
type ChartOfAccount struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64  `gorm:"not null;uniqueIndex:idx_coa_company_code;index:idx_coa_company" json:"company_id"`
	BranchID  *uint64 `gorm:"index:idx_coa_branch" json:"branch_id"`

	AccountCode string `gorm:"type:varchar(50);not null;uniqueIndex:idx_coa_company_code" json:"account_code"`
	AccountName string `gorm:"type:varchar(150);not null" json:"account_name"`

	AccountClassificationID uint64  `gorm:"not null;index:idx_coa_classification" json:"account_classification_id"`
	ParentAccountID         *uint64 `json:"parent_account_id"`

	AccountLevel  int    `gorm:"default:1" json:"account_level"`
	AccountType   string `gorm:"type:varchar(50)" json:"account_type"`
	NormalBalance string `gorm:"type:varchar(20)" json:"normal_balance"`

	IsControlAccount bool `gorm:"default:false" json:"is_control_account"`
	IsBankAccount    bool `gorm:"default:false" json:"is_bank_account"`
	IsCashAccount    bool `gorm:"default:false" json:"is_cash_account"`

	OpeningBalance float64 `gorm:"type:decimal(18,2);default:0" json:"opening_balance"`
	CurrentBalance float64 `gorm:"type:decimal(18,2);default:0" json:"current_balance"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	AccountClassification AccountClassification `gorm:"foreignKey:AccountClassificationID" json:"account_classification,omitempty"`
	ParentAccount         *ChartOfAccount       `gorm:"foreignKey:ParentAccountID" json:"parent_account,omitempty"`
}

func (ChartOfAccount) TableName() string {
	return "chart_of_accounts"
}
