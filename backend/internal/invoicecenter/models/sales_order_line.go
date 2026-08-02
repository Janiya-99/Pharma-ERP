package models

import (
	"time"
)

type SalesOrderLine struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SalesOrderID     uint64    `gorm:"not null;index" json:"sales_order_id"`
	ProductID        uint64    `gorm:"not null;index" json:"product_id"`
	ProductBatchID   *uint64   `gorm:"index" json:"product_batch_id"`
	Quantity         float64   `gorm:"type:decimal(18,3);not null;default:0" json:"quantity"`
	InvoicedQuantity float64   `gorm:"type:decimal(18,3);default:0" json:"invoiced_quantity"`
	PendingQuantity  float64   `gorm:"type:decimal(18,3);default:0" json:"pending_quantity"`
	UnitPrice        float64   `gorm:"type:decimal(18,2);default:0" json:"unit_price"`
	DiscountAmount   float64   `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount        float64   `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	LineTotal        float64   `gorm:"type:decimal(18,2);default:0" json:"line_total"`
	LineRemarks      string    `gorm:"type:text" json:"line_remarks"`
	LineOrder        int       `gorm:"default:1" json:"line_order"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (SalesOrderLine) TableName() string {
	return "sales_order_lines"
}
