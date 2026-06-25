package models

import (
	"time"
)

type SalesReturnLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	SalesReturnID       uint64  `gorm:"not null;index" json:"sales_return_id"`
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	ProductID           uint64  `gorm:"not null;index" json:"product_id"`
	ProductBatchID      *uint64 `json:"product_batch_id"`

	ReturnQuantity float64 `gorm:"type:decimal(18,3);not null;default:0" json:"return_quantity"`

	UnitPrice      float64 `gorm:"type:decimal(18,2);default:0" json:"unit_price"`
	DiscountAmount float64 `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount      float64 `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	LineTotal      float64 `gorm:"type:decimal(18,2);default:0" json:"line_total"`

	StockUnitCost float64 `gorm:"type:decimal(18,2);default:0" json:"stock_unit_cost"`

	ReturnReason    string `gorm:"type:varchar(100)" json:"return_reason"`
	ReturnCondition string `gorm:"type:varchar(50)" json:"return_condition"`

	LineRemarks string `gorm:"type:text" json:"line_remarks"`

	LineOrder int `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location"`
	Product           Product            `gorm:"foreignKey:ProductID" json:"product"`
	ProductBatch      *ProductBatch      `gorm:"foreignKey:ProductBatchID" json:"product_batch"`
}

func (SalesReturnLine) TableName() string {
	return "sales_return_lines"
}
