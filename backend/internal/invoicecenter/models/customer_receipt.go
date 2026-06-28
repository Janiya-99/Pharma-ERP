package models

import (
	"time"

	"gorm.io/gorm"
)

type CustomerReceipt struct {
	ID                 uint64                      `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID          uint64                      `gorm:"not null;index:idx_company_receipt_number,unique" json:"company_id"`
	BranchID           uint64                      `gorm:"not null;index" json:"branch_id"`
	CustomerID         uint64                      `gorm:"not null;index" json:"customer_id"`
	FinancialYearID    *uint64                     `gorm:"index" json:"financial_year_id"`
	AccountingPeriodID *uint64                     `gorm:"index" json:"accounting_period_id"`
	ReceiptNumber      string                      `gorm:"type:varchar(50);not null;index:idx_company_receipt_number,unique" json:"receipt_number"`
	ReceiptDate        time.Time                   `gorm:"type:date;not null;index" json:"receipt_date"`
	PaymentMethod      string                      `gorm:"type:varchar(50);not null;index" json:"payment_method"`
	BankAccountID      *uint64                     `gorm:"index" json:"bank_account_id"`
	ChequeNumber       string                      `gorm:"type:varchar(100)" json:"cheque_number"`
	ChequeDate         *time.Time                  `gorm:"type:date" json:"cheque_date"`
	ReferenceNumber    string                      `gorm:"type:varchar(100)" json:"reference_number"`
	ReceivedAmount     float64                     `gorm:"type:decimal(18,2);default:0" json:"received_amount"`
	AllocatedAmount    float64                     `gorm:"type:decimal(18,2);default:0" json:"allocated_amount"`
	UnallocatedAmount  float64                     `gorm:"type:decimal(18,2);default:0" json:"unallocated_amount"`
	Remarks            string                      `gorm:"type:text" json:"remarks"`
	ApprovalStatus     string                      `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"`
	ApprovedBy         *uint64                     `json:"approved_by"`
	ApprovedAt         *time.Time                  `json:"approved_at"`
	PostedStatus       string                      `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"`
	PostedBy           *uint64                     `json:"posted_by"`
	PostedAt           *time.Time                  `json:"posted_at"`
	Status             string                      `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy          *uint64                     `json:"created_by"`
	UpdatedBy          *uint64                     `json:"updated_by"`
	CreatedAt          time.Time                   `json:"created_at"`
	UpdatedAt          time.Time                   `json:"updated_at"`
	DeletedAt          gorm.DeletedAt              `gorm:"index" json:"-"`

	Customer           Customer                    `gorm:"foreignKey:CustomerID" json:"customer"`
	Allocations        []CustomerReceiptAllocation `gorm:"foreignKey:CustomerReceiptID" json:"allocations,omitempty"`
}

func (CustomerReceipt) TableName() string {
	return "customer_receipts"
}
