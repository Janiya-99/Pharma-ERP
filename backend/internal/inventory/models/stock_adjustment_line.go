package models

import (
	"time"
)

type StockAdjustmentLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	StockAdjustmentID uint64           `gorm:"index;not null" json:"stock_adjustment_id"`
	StockAdjustment   *StockAdjustment `gorm:"foreignKey:StockAdjustmentID" json:"stock_adjustment,omitempty"`

	WarehouseLocationID *uint64            `gorm:"index" json:"warehouse_location_id,omitempty"`
	WarehouseLocation   *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`

	ProductID uint64   `gorm:"index;not null" json:"product_id"`
	Product   *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`

	ProductBatchID *uint64       `gorm:"index" json:"product_batch_id,omitempty"`
	ProductBatch   *ProductBatch `gorm:"foreignKey:ProductBatchID" json:"product_batch,omitempty"`

	AdjustmentDirection string `gorm:"type:varchar(20);not null" json:"adjustment_direction"` // in, out

	Quantity float64 `gorm:"type:decimal(18,3);not null;default:0" json:"quantity"`

	UnitCost  float64 `gorm:"type:decimal(18,2);default:0" json:"unit_cost"`
	TotalCost float64 `gorm:"type:decimal(18,2);default:0" json:"total_cost"`

	SystemQuantity   float64 `gorm:"type:decimal(18,3);default:0" json:"system_quantity"`
	PhysicalQuantity float64 `gorm:"type:decimal(18,3);default:0" json:"physical_quantity"`
	VarianceQuantity float64 `gorm:"type:decimal(18,3);default:0" json:"variance_quantity"`

	LineReason  string `gorm:"type:text" json:"line_reason"`
	LineRemarks string `gorm:"type:text" json:"line_remarks"`

	LineOrder int `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
