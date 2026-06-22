package models

import (
	"time"

	"gorm.io/gorm"
)

type BankAccount struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_company_account_number" json:"company_id"`
	BranchID  *uint64 `gorm:"index" json:"branch_id"`

	ChartAccountID uint64 `gorm:"not null;index" json:"chart_account_id"`

	BankName       string `gorm:"type:varchar(150);not null" json:"bank_name"`
	BankBranchName string `gorm:"type:varchar(150)" json:"bank_branch_name"`
	AccountName    string `gorm:"type:varchar(150);not null" json:"account_name"`
	AccountNumber  string `gorm:"type:varchar(100);not null;uniqueIndex:idx_company_account_number" json:"account_number"`

	SwiftCode  string `gorm:"type:varchar(50)" json:"swift_code"`
	BankCode   string `gorm:"type:varchar(50)" json:"bank_code"`
	BranchCode string `gorm:"type:varchar(50)" json:"branch_code"`

	OpeningBalance float64 `gorm:"type:decimal(18,2);default:0" json:"opening_balance"`
	CurrentBalance float64 `gorm:"type:decimal(18,2);default:0" json:"current_balance"`

	IsDefault bool `gorm:"default:false" json:"is_default"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64 `json:"created_by"`
	UpdatedBy *uint64 `json:"updated_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	ChartAccount *ChartOfAccount `gorm:"foreignKey:ChartAccountID" json:"chart_account,omitempty"`
}

func (BankAccount) TableName() string {
	return "bank_accounts"
}
