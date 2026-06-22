package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type FixedAssetDisposal struct {
	ID        uint64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64                 `gorm:"not null;index:idx_fadi_company_disp,unique" json:"company_id"`
	Company   *companyModels.Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	BranchID  uint64                 `gorm:"not null;index" json:"branch_id"`
	Branch    *companyModels.Branch  `gorm:"foreignKey:BranchID" json:"branch,omitempty"`

	FixedAssetID uint64      `gorm:"not null;index" json:"fixed_asset_id"`
	FixedAsset   *FixedAsset `gorm:"foreignKey:FixedAssetID" json:"fixed_asset,omitempty"`

	FinancialYearID uint64         `gorm:"not null;index" json:"financial_year_id"`
	FinancialYear   *FinancialYear `gorm:"foreignKey:FinancialYearID" json:"financial_year,omitempty"`

	AccountingPeriodID uint64            `gorm:"not null;index" json:"accounting_period_id"`
	AccountingPeriod   *AccountingPeriod `gorm:"foreignKey:AccountingPeriodID" json:"accounting_period,omitempty"`

	DisposalNumber string     `gorm:"type:varchar(50);not null;index:idx_fadi_company_disp,unique" json:"disposal_number"`
	DisposalDate   *time.Time `gorm:"type:date;not null" json:"disposal_date"`

	DisposalType string `gorm:"type:varchar(50);not null" json:"disposal_type"` // sale, write_off, scrap, lost, damaged

	ProceedsAmount                float64 `gorm:"type:decimal(18,2);default:0" json:"proceeds_amount"`
	AccumulatedDepreciationAmount float64 `gorm:"type:decimal(18,2);default:0" json:"accumulated_depreciation_amount"`
	NetBookValue                  float64 `gorm:"type:decimal(18,2);default:0" json:"net_book_value"`
	GainLossAmount                float64 `gorm:"type:decimal(18,2);default:0" json:"gain_loss_amount"`

	ReceivedToAccountID     *uint64         `json:"received_to_account_id"`
	ReceivedToAccount       *ChartOfAccount `gorm:"foreignKey:ReceivedToAccountID" json:"received_to_account,omitempty"`
	GainOnDisposalAccountID *uint64         `json:"gain_on_disposal_account_id"`
	GainOnDisposalAccount   *ChartOfAccount `gorm:"foreignKey:GainOnDisposalAccountID" json:"gain_on_disposal_account,omitempty"`
	LossOnDisposalAccountID *uint64         `json:"loss_on_disposal_account_id"`
	LossOnDisposalAccount   *ChartOfAccount `gorm:"foreignKey:LossOnDisposalAccountID" json:"loss_on_disposal_account,omitempty"`

	Reason string `gorm:"type:text" json:"reason"`

	ApprovalStatus string              `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"` // draft, pending, approved, rejected, cancelled
	ApprovedBy     *uint64             `json:"approved_by"`
	ApprovedByUser *companyModels.User `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	ApprovedAt     *time.Time          `json:"approved_at"`

	PostedStatus string              `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"` // unposted, posted
	PostedBy     *uint64             `json:"posted_by"`
	PostedByUser *companyModels.User `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	PostedAt     *time.Time          `json:"posted_at"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy     *uint64             `json:"created_by"`
	CreatedByUser *companyModels.User `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedBy     *uint64             `json:"updated_by"`
	UpdatedByUser *companyModels.User `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Approvals []FixedAssetDisposalApproval `gorm:"foreignKey:FixedAssetDisposalID" json:"approvals,omitempty"`
}
