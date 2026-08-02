package models

import (
	"time"
)

type SalesInvoiceLine struct {
	ID                  uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SalesInvoiceID      uint64    `gorm:"not null;index" json:"sales_invoice_id"`
	SalesOrderLineID    *uint64   `gorm:"index" json:"sales_order_line_id"`
	WarehouseLocationID *uint64   `gorm:"index" json:"warehouse_location_id"`
	ProductID           uint64    `gorm:"not null;index" json:"product_id"`
	ProductBatchID      *uint64   `gorm:"index" json:"product_batch_id"`
	Quantity            float64   `gorm:"type:decimal(18,3);not null;default:0" json:"quantity"`
	UnitPrice           float64   `gorm:"type:decimal(18,2);default:0" json:"unit_price"`
	DiscountAmount      float64   `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount           float64   `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	LineTotal           float64   `gorm:"type:decimal(18,2);default:0" json:"line_total"`
	StockUnitCost       float64   `gorm:"type:decimal(18,2);default:0" json:"stock_unit_cost"`
	StockTotalCost      float64   `gorm:"type:decimal(18,2);default:0" json:"stock_total_cost"`
	LineRemarks         string    `gorm:"type:text" json:"line_remarks"`
	LineOrder           int       `gorm:"default:1" json:"line_order"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`

	SalesOrderLine *SalesOrderLine `gorm:"foreignKey:SalesOrderLineID" json:"sales_order_line,omitempty"`
}

func (SalesInvoiceLine) TableName() string {
	return "sales_invoice_lines"
}
