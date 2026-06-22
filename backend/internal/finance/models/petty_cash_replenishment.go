package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type PettyCashReplenishment struct {
	ID                  uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID           uint64         `gorm:"not null;index:idx_pcr_company_replno,unique" json:"company_id"`
	BranchID            uint64         `gorm:"not null;index" json:"branch_id"`
	PettyCashFundID     uint64         `gorm:"not null;index" json:"petty_cash_fund_id"`
	FinancialYearID     uint64         `gorm:"not null;index" json:"financial_year_id"`
	AccountingPeriodID  uint64         `gorm:"not null;index" json:"accounting_period_id"`
	ReplenishmentNumber string         `gorm:"type:varchar(50);not null;index:idx_pcr_company_replno,unique" json:"replenishment_number"`
	ReplenishmentDate   string         `gorm:"type:date;not null" json:"replenishment_date"`
	PaidFromAccountID   uint64         `gorm:"not null" json:"paid_from_account_id"`
	ReferenceNumber     string         `gorm:"type:varchar(100)" json:"reference_number"`
	Description         string         `gorm:"type:text" json:"description"`
	Amount              float64        `gorm:"type:decimal(18,2);default:0" json:"amount"`
	ApprovalStatus      string         `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"`
	ApprovedBy          *uint64        `json:"approved_by"`
	ApprovedAt          *time.Time     `json:"approved_at"`
	PostedStatus        string         `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"`
	PostedBy            *uint64        `json:"posted_by"`
	PostedAt            *time.Time     `json:"posted_at"`
	Status              string         `gorm:"type:varchar(30);default:'active'" json:"status"`
	CreatedBy           *uint64        `json:"created_by"`
	UpdatedBy           *uint64        `json:"updated_by"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Company          *companyModels.Company           `gorm:"foreignKey:CompanyID;references:ID" json:"company,omitempty"`
	Branch           *companyModels.Branch            `gorm:"foreignKey:BranchID;references:ID" json:"branch,omitempty"`
	PettyCashFund    *PettyCashFund                   `gorm:"foreignKey:PettyCashFundID;references:ID" json:"petty_cash_fund,omitempty"`
	FinancialYear    *FinancialYear                   `gorm:"foreignKey:FinancialYearID;references:ID" json:"financial_year,omitempty"`
	AccountingPeriod *AccountingPeriod                `gorm:"foreignKey:AccountingPeriodID;references:ID" json:"accounting_period,omitempty"`
	PaidFromAccount  *ChartOfAccount                  `gorm:"foreignKey:PaidFromAccountID;references:ID" json:"paid_from_account,omitempty"`
	Approver         *companyModels.User              `gorm:"-;references:ID" json:"approver,omitempty"`
	Poster           *companyModels.User              `gorm:"-;references:ID" json:"poster,omitempty"`
	Creator          *companyModels.User              `gorm:"-;references:ID" json:"creator,omitempty"`
	Updater          *companyModels.User              `gorm:"-;references:ID" json:"updater,omitempty"`
	Approvals        []PettyCashReplenishmentApproval `gorm:"foreignKey:PettyCashReplenishmentID" json:"approvals,omitempty"`
}

func (PettyCashReplenishment) TableName() string {
	return "petty_cash_replenishments"
}
