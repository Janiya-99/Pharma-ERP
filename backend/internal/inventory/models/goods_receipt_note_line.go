package models

import (
	"time"
)

// GoodsReceiptNoteLine stores the line items for a GRN
type GoodsReceiptNoteLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	GoodsReceiptNoteID uint64 `gorm:"not null;index" json:"goods_receipt_note_id"`

	WarehouseLocationID *uint64 `json:"warehouse_location_id"`

	ProductID      uint64  `gorm:"not null;index" json:"product_id"`
	ProductBatchID *uint64 `json:"product_batch_id"`

	BatchNumber     string     `gorm:"type:varchar(100)" json:"batch_number"`
	ManufactureDate *time.Time `gorm:"type:date" json:"manufacture_date"`
	ExpiryDate      *time.Time `gorm:"type:date" json:"expiry_date"`

	QuantityReceived   float64 `gorm:"type:decimal(18,3);not null;default:0" json:"quantity_received"`
	FreeQuantity       float64 `gorm:"type:decimal(18,3);default:0" json:"free_quantity"`
	TotalStockQuantity float64 `gorm:"type:decimal(18,3);default:0" json:"total_stock_quantity"`

	UnitCost       float64 `gorm:"type:decimal(18,2);default:0" json:"unit_cost"`
	DiscountAmount float64 `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount      float64 `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	LineTotal      float64 `gorm:"type:decimal(18,2);default:0" json:"line_total"`

	StockUnitCost float64 `gorm:"type:decimal(18,2);default:0" json:"stock_unit_cost"`

	SellingPrice float64 `gorm:"type:decimal(18,2);default:0" json:"selling_price"`
	MRP          float64 `gorm:"type:decimal(18,2);default:0" json:"mrp"`

	LineRemarks string `gorm:"type:text" json:"line_remarks"`

	LineOrder int `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Product           Product            `gorm:"foreignKey:ProductID" json:"product"`
	ProductBatch      *ProductBatch      `gorm:"foreignKey:ProductBatchID" json:"product_batch"`
	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location"`
}

// TableName overrides the table name used by GORM
func (GoodsReceiptNoteLine) TableName() string {
	return "goods_receipt_note_lines"
}
