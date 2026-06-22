package models

import (
	"time"
)

type StockTransferLine struct {
	ID                      uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	StockTransferID         uint64  `gorm:"not null;index" json:"stock_transfer_id"`
	FromWarehouseLocationID *uint64 `json:"from_warehouse_location_id"`
	ToWarehouseLocationID   *uint64 `json:"to_warehouse_location_id"`
	ProductID               uint64  `gorm:"not null;index" json:"product_id"`
	ProductBatchID          *uint64 `json:"product_batch_id"`

	Quantity float64 `gorm:"type:decimal(18,3);not null;default:0" json:"quantity"`

	UnitCost  float64 `gorm:"type:decimal(18,2);default:0" json:"unit_cost"`
	TotalCost float64 `gorm:"type:decimal(18,2);default:0" json:"total_cost"`

	LineRemarks string `gorm:"type:text" json:"line_remarks"`
	LineOrder   int    `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	FromWarehouseLocation *WarehouseLocation `gorm:"foreignKey:FromWarehouseLocationID" json:"from_warehouse_location,omitempty"`
	ToWarehouseLocation   *WarehouseLocation `gorm:"foreignKey:ToWarehouseLocationID" json:"to_warehouse_location,omitempty"`
	Product               *Product           `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	ProductBatch          *ProductBatch      `gorm:"foreignKey:ProductBatchID" json:"product_batch,omitempty"`
}
