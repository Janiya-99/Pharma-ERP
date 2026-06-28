package models

import (
	"time"
)

type CreditNoteLine struct {
	ID                 uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CreditNoteID       uint64    `gorm:"not null;index" json:"credit_note_id"`
	SalesInvoiceLineID *uint64   `gorm:"index" json:"sales_invoice_line_id"`
	ProductID          *uint64   `gorm:"index" json:"product_id"`
	Description        string    `gorm:"type:text" json:"description"`
	Quantity           float64   `gorm:"type:decimal(18,3);default:0" json:"quantity"`
	UnitPrice          float64   `gorm:"type:decimal(18,2);default:0" json:"unit_price"`
	DiscountAmount     float64   `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount          float64   `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	LineTotal          float64   `gorm:"type:decimal(18,2);default:0" json:"line_total"`
	LineOrder          int       `gorm:"default:1" json:"line_order"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	SalesInvoiceLine *SalesInvoiceLine `gorm:"foreignKey:SalesInvoiceLineID" json:"sales_invoice_line,omitempty"`
}

func (CreditNoteLine) TableName() string {
	return "credit_note_lines"
}
