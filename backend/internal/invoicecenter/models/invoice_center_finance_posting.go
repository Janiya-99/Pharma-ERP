package models

import (
	"time"

	"gorm.io/gorm"
)

// InvoiceCenterFinancePosting tracks which Invoice Center documents have already been posted to Finance.
type InvoiceCenterFinancePosting struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;index:uq_invoice_center_finance_posting_doc,unique" json:"company_id"`
	BranchID  uint64 `gorm:"not null" json:"branch_id"`

	DocumentType   string `gorm:"type:varchar(50);not null;index:uq_invoice_center_finance_posting_doc,unique" json:"document_type"`
	DocumentID     uint64 `gorm:"not null;index:uq_invoice_center_finance_posting_doc,unique" json:"document_id"`
	DocumentNumber string `gorm:"type:varchar(100);not null" json:"document_number"`

	FinanceReferenceNumber string `gorm:"type:varchar(100);not null" json:"finance_reference_number"`

	DebitTotal  float64 `gorm:"type:decimal(18,4);default:0" json:"debit_total"`
	CreditTotal float64 `gorm:"type:decimal(18,4);default:0" json:"credit_total"`

	PostingStatus string `gorm:"type:varchar(30);default:'posted'" json:"posting_status"`

	PostedBy uint64    `gorm:"not null" json:"posted_by"`
	PostedAt time.Time `gorm:"not null" json:"posted_at"`

	Remarks *string `gorm:"type:text" json:"remarks"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index:uq_invoice_center_finance_posting_doc,unique" json:"-"`
}
