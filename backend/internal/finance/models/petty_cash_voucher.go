package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type PettyCashVoucher struct {
	ID                 uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID          uint64         `gorm:"not null;index:idx_pcv_company_voucherno,unique" json:"company_id"`
	BranchID           uint64         `gorm:"not null;index" json:"branch_id"`
	PettyCashFundID    uint64         `gorm:"not null;index" json:"petty_cash_fund_id"`
	FinancialYearID    uint64         `gorm:"not null;index" json:"financial_year_id"`
	AccountingPeriodID uint64         `gorm:"not null;index" json:"accounting_period_id"`
	VoucherNumber      string         `gorm:"type:varchar(50);not null;index:idx_pcv_company_voucherno,unique" json:"voucher_number"`
	VoucherDate        string         `gorm:"type:date;not null" json:"voucher_date"`
	VoucherType        string         `gorm:"type:varchar(50);not null" json:"voucher_type"`
	PayeeName          string         `gorm:"type:varchar(150)" json:"payee_name"`
	ReferenceNumber    string         `gorm:"type:varchar(100)" json:"reference_number"`
	Description        string         `gorm:"type:text" json:"description"`
	TotalAmount        float64        `gorm:"type:decimal(18,2);default:0" json:"total_amount"`
	ApprovalStatus     string         `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"`
	ApprovedBy         *uint64        `json:"approved_by"`
	ApprovedAt         *time.Time     `json:"approved_at"`
	PostedStatus       string         `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"`
	PostedBy           *uint64        `json:"posted_by"`
	PostedAt           *time.Time     `json:"posted_at"`
	Status             string         `gorm:"type:varchar(30);default:'active'" json:"status"`
	CreatedBy          *uint64        `json:"created_by"`
	UpdatedBy          *uint64        `json:"updated_by"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Company          *companyModels.Company     `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Branch           *companyModels.Branch      `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	PettyCashFund    *PettyCashFund             `gorm:"foreignKey:PettyCashFundID" json:"petty_cash_fund,omitempty"`
	FinancialYear    *FinancialYear             `gorm:"foreignKey:FinancialYearID" json:"financial_year,omitempty"`
	AccountingPeriod *AccountingPeriod          `gorm:"foreignKey:AccountingPeriodID" json:"accounting_period,omitempty"`
	Approver         *companyModels.User        `gorm:"foreignKey:ApprovedBy" json:"approver,omitempty"`
	Poster           *companyModels.User        `gorm:"foreignKey:PostedBy" json:"poster,omitempty"`
	Creator          *companyModels.User        `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Updater          *companyModels.User        `gorm:"foreignKey:UpdatedBy" json:"updater,omitempty"`
	Lines            []PettyCashVoucherLine     `gorm:"foreignKey:PettyCashVoucherID" json:"lines,omitempty"`
	Approvals        []PettyCashVoucherApproval `gorm:"foreignKey:PettyCashVoucherID" json:"approvals,omitempty"`
}

func (PettyCashVoucher) TableName() string {
	return "petty_cash_vouchers"
}
