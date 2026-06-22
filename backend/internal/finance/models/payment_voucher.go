package models

import (
	"time"

	"gorm.io/gorm"
)

type PaymentVoucher struct {
	ID                 uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID          uint64         `gorm:"not null;index:idx_company_pv_number,unique" json:"company_id"`
	BranchID           uint64         `gorm:"not null;index" json:"branch_id"`
	FinancialYearID    uint64         `gorm:"not null;index" json:"financial_year_id"`
	AccountingPeriodID uint64         `gorm:"not null;index" json:"accounting_period_id"`
	VoucherNumber      string         `gorm:"type:varchar(50);not null;index:idx_company_pv_number,unique" json:"voucher_number"`
	PaymentDate        time.Time      `gorm:"type:date;not null" json:"payment_date"`
	PaymentType        string         `gorm:"type:varchar(50);not null;index" json:"payment_type"`
	PaymentMethod      string         `gorm:"type:varchar(50);not null" json:"payment_method"`
	SupplierID         *uint64        `json:"supplier_id"`
	CustomerID         *uint64        `json:"customer_id"`
	PaidFromAccountID  uint64         `gorm:"not null" json:"paid_from_account_id"`
	ChequeNumber       string         `gorm:"type:varchar(100)" json:"cheque_number"`
	ChequeDate         *time.Time     `gorm:"type:date" json:"cheque_date"`
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

	Lines     []PaymentVoucherLine     `gorm:"foreignKey:PaymentVoucherID" json:"lines,omitempty"`
	Approvals []PaymentVoucherApproval `gorm:"foreignKey:PaymentVoucherID" json:"approvals,omitempty"`

	FinancialYear    *FinancialYear    `gorm:"foreignKey:FinancialYearID;references:ID" json:"financial_year,omitempty"`
	AccountingPeriod *AccountingPeriod `gorm:"foreignKey:AccountingPeriodID;references:ID" json:"accounting_period,omitempty"`
	PaidFromAccount  *ChartOfAccount   `gorm:"foreignKey:PaidFromAccountID;references:ID" json:"paid_from_account,omitempty"`
}
