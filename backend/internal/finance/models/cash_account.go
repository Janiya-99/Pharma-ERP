package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type CashAccount struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64 `gorm:"not null;index:idx_cash_account_company_name,unique" json:"company_id"`
	BranchID  uint64 `gorm:"not null;index" json:"branch_id"`

	CashAccountName       string  `gorm:"type:varchar(150);not null;index:idx_cash_account_company_name,unique" json:"cash_account_name"`
	ResponsibleUserID     *uint64 `json:"responsible_user_id"`
	LinkedLedgerAccountID uint64  `gorm:"not null;index" json:"linked_ledger_account_id"`
	AutoCreateLedger      bool    `gorm:"default:false" json:"auto_create_ledger"`

	OpeningBalance     float64    `gorm:"type:decimal(18,2);default:0" json:"opening_balance"`
	CurrentBalance     float64    `gorm:"type:decimal(18,2);default:0" json:"current_balance"`
	OpeningBalanceDate *time.Time `json:"opening_balance_date"`

	Status      string `gorm:"type:varchar(30);default:'active'" json:"status"`
	Description string `gorm:"type:text" json:"description"`

	CreatedBy *uint64        `json:"created_by"`
	UpdatedBy *uint64        `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Branch              *companyModels.Branch `gorm:"foreignKey:BranchID;references:ID" json:"branch,omitempty"`
	LinkedLedgerAccount *ChartOfAccount       `gorm:"foreignKey:LinkedLedgerAccountID;references:ID" json:"linked_ledger_account,omitempty"`
	ResponsibleUser     *companyModels.User   `gorm:"-;references:ID" json:"responsible_user,omitempty"`
}

func (CashAccount) TableName() string {
	return "cash_accounts"
}
