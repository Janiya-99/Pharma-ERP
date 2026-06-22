package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type PettyCashFund struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID       uint64         `gorm:"not null;index:idx_pcf_company_fundcode,unique" json:"company_id"`
	BranchID        uint64         `gorm:"not null;index" json:"branch_id"`
	FundName        string         `gorm:"type:varchar(150);not null" json:"fund_name"`
	FundCode        string         `gorm:"type:varchar(50);not null;index:idx_pcf_company_fundcode,unique" json:"fund_code"`
	ChartAccountID  uint64         `gorm:"not null" json:"chart_account_id"`
	CustodianUserID *uint64        `json:"custodian_user_id"`
	OpeningBalance  float64        `gorm:"type:decimal(18,2);default:0" json:"opening_balance"`
	CurrentBalance  float64        `gorm:"type:decimal(18,2);default:0" json:"current_balance"`
	FundLimit       float64        `gorm:"type:decimal(18,2);default:0" json:"fund_limit"`
	Status          string         `gorm:"type:varchar(30);default:'active'" json:"status"`
	CreatedBy       *uint64        `json:"created_by"`
	UpdatedBy       *uint64        `json:"updated_by"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Company        *companyModels.Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Branch         *companyModels.Branch  `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	ChartOfAccount *ChartOfAccount        `gorm:"foreignKey:ChartAccountID" json:"chart_of_account,omitempty"`
	CustodianUser  *companyModels.User    `gorm:"foreignKey:CustodianUserID" json:"custodian_user,omitempty"`
	Creator        *companyModels.User    `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Updater        *companyModels.User    `gorm:"foreignKey:UpdatedBy" json:"updater,omitempty"`
}

func (PettyCashFund) TableName() string {
	return "petty_cash_funds"
}
