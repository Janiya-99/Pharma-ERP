package model

import "time"

// ProductBatch represents a specific batch of a product stored in a warehouse.
type ProductBatch struct {
	BaseModel
	ProductID    uint64    `gorm:"not null;index" json:"product_id"`
	BatchNo      string    `gorm:"size:100;not null" json:"batch_no"`
	MfgDate      time.Time `gorm:"type:date" json:"mfg_date"`
	ExpiryDate   time.Time `gorm:"type:date" json:"expiry_date"`
	WarehouseID  uint64    `gorm:"not null;index" json:"warehouse_id"`
	BinLocation  string    `gorm:"size:100" json:"bin_location"`
	AvailableQty int       `gorm:"default:0" json:"available_qty"`
	ReservedQty  int       `gorm:"default:0" json:"reserved_qty"`
	UnitCost     float64   `gorm:"type:decimal(15,2);default:0" json:"unit_cost"`
	Status       string    `gorm:"type:enum('Available', 'Near Expiry', 'Expired', 'On Hold');default:'Available'" json:"status"`

	// Relationships
	Product   *Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Warehouse *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
}
