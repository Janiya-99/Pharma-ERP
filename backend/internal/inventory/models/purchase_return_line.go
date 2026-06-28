package models

import (
	"time"
)

type PurchaseReturnLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	PurchaseReturnID       uint64  `gorm:"not null;index" json:"purchase_return_id"`
	GoodsReceiptNoteLineID *uint64 `json:"goods_receipt_note_line_id"`

	WarehouseLocationID *uint64 `json:"warehouse_location_id"`

	ProductID      uint64  `gorm:"not null;index" json:"product_id"`
	ProductBatchID *uint64 `json:"product_batch_id"`

	ReturnQuantity float64 `gorm:"type:decimal(18,3);not null;default:0" json:"return_quantity"`

	UnitCost  float64 `gorm:"type:decimal(18,2);default:0" json:"unit_cost"`
	TaxAmount float64 `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	LineTotal float64 `gorm:"type:decimal(18,2);default:0" json:"line_total"`

	ReturnReason string `gorm:"type:varchar(255)" json:"return_reason"`
	LineRemarks  string `gorm:"type:text" json:"line_remarks"`

	LineOrder int `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Product              Product               `gorm:"foreignKey:ProductID" json:"product"`
	ProductBatch         *ProductBatch         `gorm:"foreignKey:ProductBatchID" json:"product_batch"`
	WarehouseLocation    *WarehouseLocation    `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location"`
	GoodsReceiptNoteLine *GoodsReceiptNoteLine `gorm:"foreignKey:GoodsReceiptNoteLineID" json:"goods_receipt_note_line"`
}

func (PurchaseReturnLine) TableName() string {
	return "purchase_return_lines"
}
