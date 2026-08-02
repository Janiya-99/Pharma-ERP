package models

import (
	"time"
)

// OpeningStockEntryLine stores product, batch, location, quantity, and value lines
type OpeningStockEntryLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	OpeningStockEntryID uint64 `gorm:"not null;index" json:"opening_stock_entry_id"`

	WarehouseLocationID *uint64 `json:"warehouse_location_id"`

	ProductID      uint64  `gorm:"not null;index" json:"product_id"`
	ProductBatchID *uint64 `gorm:"index" json:"product_batch_id"`

	Quantity float64 `gorm:"type:decimal(18,3);not null;default:0" json:"quantity"`

	UnitCost  float64 `gorm:"type:decimal(18,2);default:0" json:"unit_cost"`
	TotalCost float64 `gorm:"type:decimal(18,2);default:0" json:"total_cost"`

	ExpiryDate *time.Time `gorm:"type:date" json:"expiry_date"`

	LineRemarks string `gorm:"type:text" json:"line_remarks"`

	LineOrder int `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	OpeningStockEntry OpeningStockEntry  `gorm:"foreignKey:OpeningStockEntryID" json:"-"`
	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`
	Product           Product            `gorm:"foreignKey:ProductID" json:"product"`
	ProductBatch      *ProductBatch      `gorm:"foreignKey:ProductBatchID" json:"product_batch,omitempty"`
}

// TableName overrides the table name used by GORM
func (OpeningStockEntryLine) TableName() string {
	return "opening_stock_entry_lines"
}
