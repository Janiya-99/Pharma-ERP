package models

import (
	"time"

	"gorm.io/gorm"
)

type CreditNote struct {
	ID                 uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID          uint64    `gorm:"not null;index:idx_company_credit_note_number,unique" json:"company_id"`
	BranchID           uint64    `gorm:"not null;index" json:"branch_id"`
	CustomerID         uint64    `gorm:"not null;index" json:"customer_id"`
	SalesInvoiceID     *uint64   `gorm:"index" json:"sales_invoice_id"`
	FinancialYearID    *uint64   `gorm:"index" json:"financial_year_id"`
	AccountingPeriodID *uint64   `gorm:"index" json:"accounting_period_id"`
	CreditNoteNumber   string    `gorm:"type:varchar(50);not null;index:idx_company_credit_note_number,unique" json:"credit_note_number"`
	CreditNoteDate     time.Time `gorm:"type:date;not null;index" json:"credit_note_date"`
	CreditNoteType     string    `gorm:"type:varchar(50);default:'sales_return';index" json:"credit_note_type"`
	ReferenceNumber    string    `gorm:"type:varchar(100)" json:"reference_number"`
	Reason             string    `gorm:"type:text" json:"reason"`
	Remarks            string    `gorm:"type:text" json:"remarks"`
	SubtotalAmount     float64   `gorm:"type:decimal(18,2);default:0" json:"subtotal_amount"`
	DiscountAmount     float64   `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount          float64   `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	TotalAmount        float64   `gorm:"type:decimal(18,4);not null" json:"total_amount"`
	AllocatedValue     float64   `gorm:"type:decimal(18,4);default:0" json:"allocated_value"`

	FinancePostStatus      string     `gorm:"type:varchar(30);default:'unposted'" json:"finance_post_status"`
	FinanceReferenceNumber *string    `gorm:"type:varchar(100)" json:"finance_reference_number,omitempty"`
	FinancePostedBy        *uint64    `json:"finance_posted_by,omitempty"`
	FinancePostedAt        *time.Time `json:"finance_posted_at,omitempty"`

	ApprovalStatus string         `gorm:"type:varchar(30);default:'draft'" json:"approval_status"`
	ApprovedBy     *uint64        `json:"approved_by"`
	ApprovedAt     *time.Time     `json:"approved_at"`
	PostedStatus   string         `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"`
	PostedBy       *uint64        `json:"posted_by"`
	PostedAt       *time.Time     `json:"posted_at"`
	CancelledBy    *uint64        `json:"cancelled_by"`
	CancelledAt    *time.Time     `json:"cancelled_at"`
	CancelReason   string         `gorm:"type:text" json:"cancel_reason"`
	Status         string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy      *uint64        `json:"created_by"`
	UpdatedBy      *uint64        `json:"updated_by"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	Customer     Customer             `gorm:"foreignKey:CustomerID" json:"customer"`
	SalesInvoice *SalesInvoice        `gorm:"foreignKey:SalesInvoiceID" json:"sales_invoice,omitempty"`
	Lines        []CreditNoteLine     `gorm:"foreignKey:CreditNoteID" json:"lines,omitempty"`
	Approvals    []CreditNoteApproval `gorm:"foreignKey:CreditNoteID" json:"approvals,omitempty"`
}

func (CreditNote) TableName() string {
	return "credit_notes"
}
