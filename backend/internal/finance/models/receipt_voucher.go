package models

import (
	"time"

	"gorm.io/gorm"
)

type ReceiptVoucher struct {
	ID                  uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID           uint64         `gorm:"not null;index:idx_company_rv_number,unique" json:"company_id"`
	BranchID            uint64         `gorm:"not null;index" json:"branch_id"`
	FinancialYearID     uint64         `gorm:"not null;index" json:"financial_year_id"`
	AccountingPeriodID  uint64         `gorm:"not null;index" json:"accounting_period_id"`
	ReceiptNumber       string         `gorm:"type:varchar(50);not null;index:idx_company_rv_number,unique" json:"receipt_number"`
	ReceiptDate         time.Time      `gorm:"type:date;not null" json:"receipt_date"`
	ReceiptType         string         `gorm:"type:varchar(50);not null;index" json:"receipt_type"`
	ReceiptMethod       string         `gorm:"type:varchar(50);not null" json:"receipt_method"`
	CustomerID          *uint64        `json:"customer_id"`
	SupplierID          *uint64        `json:"supplier_id"`
	ReceivedToAccountID uint64         `gorm:"not null" json:"received_to_account_id"`
	ChequeNumber        string         `gorm:"type:varchar(100)" json:"cheque_number"`
	ChequeDate          *time.Time     `gorm:"type:date" json:"cheque_date"`
	ReferenceNumber     string         `gorm:"type:varchar(100)" json:"reference_number"`
	Description         string         `gorm:"type:text" json:"description"`
	TotalAmount         float64        `gorm:"type:decimal(18,2);default:0" json:"total_amount"`
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

	Lines     []ReceiptVoucherLine     `gorm:"foreignKey:ReceiptVoucherID" json:"lines,omitempty"`
	Approvals []ReceiptVoucherApproval `gorm:"foreignKey:ReceiptVoucherID" json:"approvals,omitempty"`

	FinancialYear     *FinancialYear    `gorm:"foreignKey:FinancialYearID" json:"financial_year,omitempty"`
	AccountingPeriod  *AccountingPeriod `gorm:"foreignKey:AccountingPeriodID" json:"accounting_period,omitempty"`
	ReceivedToAccount *ChartOfAccount   `gorm:"foreignKey:ReceivedToAccountID" json:"received_to_account,omitempty"`
}
