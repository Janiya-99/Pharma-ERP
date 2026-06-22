package models

import (
	"time"
)

type StockBalance struct {
	ID                  uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID           uint64     `gorm:"not null;index:idx_stock_balance_unique,unique" json:"company_id"`
	BranchID            uint64     `gorm:"not null;index:idx_stock_balance_unique,unique" json:"branch_id"`
	WarehouseID         uint64     `gorm:"not null;index:idx_stock_balance_unique,unique" json:"warehouse_id"`
	WarehouseLocationID *uint64    `gorm:"index:idx_stock_balance_unique,unique" json:"warehouse_location_id"`
	ProductID           uint64     `gorm:"not null;index:idx_stock_balance_unique,unique" json:"product_id"`
	ProductBatchID      *uint64    `gorm:"index:idx_stock_balance_unique,unique" json:"product_batch_id"`
	QuantityOnHand      float64    `gorm:"type:decimal(18,3);default:0" json:"quantity_on_hand"`
	QuantityAllocated   float64    `gorm:"type:decimal(18,3);default:0" json:"quantity_allocated"`
	QuantityAvailable   float64    `gorm:"type:decimal(18,3);default:0" json:"quantity_available"`
	AverageCost         float64    `gorm:"type:decimal(18,2);default:0" json:"average_cost"`
	StockValue          float64    `gorm:"type:decimal(18,2);default:0" json:"stock_value"`
	LastMovementDate    *time.Time `json:"last_movement_date"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}
