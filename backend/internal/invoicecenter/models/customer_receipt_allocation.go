package models

import (
	"time"
)

type CustomerReceiptAllocation struct {
	ID                uint64        `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerReceiptID uint64        `gorm:"not null;index" json:"customer_receipt_id"`
	AllocationType    string        `gorm:"type:varchar(50);not null;index" json:"allocation_type"`
	SalesInvoiceID    *uint64       `gorm:"index" json:"sales_invoice_id"`
	DebitNoteID       *uint64       `gorm:"index" json:"debit_note_id"`
	CreditNoteID      *uint64       `gorm:"index" json:"credit_note_id"`
	AllocatedAmount   float64       `gorm:"type:decimal(18,2);not null;default:0" json:"allocated_amount"`
	Remarks           string        `gorm:"type:text" json:"remarks"`
	CreatedAt         time.Time     `json:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at"`

	SalesInvoice      *SalesInvoice `gorm:"foreignKey:SalesInvoiceID" json:"sales_invoice,omitempty"`
	DebitNote         *DebitNote    `gorm:"foreignKey:DebitNoteID" json:"debit_note,omitempty"`
	CreditNote        *CreditNote   `gorm:"foreignKey:CreditNoteID" json:"credit_note,omitempty"`
}

func (CustomerReceiptAllocation) TableName() string {
	return "customer_receipt_allocations"
}
