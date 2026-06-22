package models

import (
	"time"
)

type StockLedgerEntry struct {
	ID                  uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID           uint64    `gorm:"not null;index" json:"company_id"`
	BranchID            uint64    `gorm:"not null;index" json:"branch_id"`
	WarehouseID         uint64    `gorm:"not null;index" json:"warehouse_id"`
	WarehouseLocationID *uint64   `json:"warehouse_location_id"`
	ProductID           uint64    `gorm:"not null;index" json:"product_id"`
	ProductBatchID      *uint64   `gorm:"index" json:"product_batch_id"`
	TransactionDate     time.Time `gorm:"not null;index" json:"transaction_date"`
	SourceType          string    `gorm:"type:varchar(80);not null" json:"source_type"`
	SourceID            *uint64   `json:"source_id"`
	SourceNumber        string    `gorm:"type:varchar(100)" json:"source_number"`
	MovementType        string    `gorm:"type:varchar(30);not null" json:"movement_type"`
	QuantityIn          float64   `gorm:"type:decimal(18,3);default:0" json:"quantity_in"`
	QuantityOut         float64   `gorm:"type:decimal(18,3);default:0" json:"quantity_out"`
	BalanceQuantity     float64   `gorm:"type:decimal(18,3);default:0" json:"balance_quantity"`
	UnitCost            float64   `gorm:"type:decimal(18,2);default:0" json:"unit_cost"`
	TotalCost           float64   `gorm:"type:decimal(18,2);default:0" json:"total_cost"`
	Remarks             string    `gorm:"type:text" json:"remarks"`
	CreatedBy           *uint64   `json:"created_by"`
	CreatedAt           time.Time `json:"created_at"`
}
