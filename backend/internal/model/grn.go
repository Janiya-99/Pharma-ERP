package model

import (
	"time"

	"github.com/shopspring/decimal"
)

// GRN represents a Good Receipt Note for receiving inventory.
type GRN struct {
	BaseModel
	RefNo      string          `gorm:"size:100;not null;unique" json:"ref_no"`
	Date       time.Time       `gorm:"type:date;not null" json:"date"`
	SupplierID uint64          `gorm:"not null;index" json:"supplier_id"`
	PORef      string          `gorm:"size:100" json:"po_ref"`
	ReceivedBy string          `gorm:"size:255" json:"received_by"`
	TotalCost  decimal.Decimal `gorm:"type:decimal(15,2);default:0.00" json:"total_cost"`
	Status     string          `gorm:"type:enum('Draft', 'Posted', 'Cancelled');default:'Draft'" json:"status"`

	// Relationships
	Supplier *InventorySupplier `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	Items    []GRNItem          `gorm:"foreignKey:GRNID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}

// GRNItem represents a line item in a Good Receipt Note.
type GRNItem struct {
	BaseModel
	GRNID       uint64          `gorm:"not null;index" json:"grn_id"`
	ProductID   uint64          `gorm:"not null;index" json:"product_id"`
	BatchNo     string          `gorm:"size:100;not null" json:"batch_no"`
	MfgDate     time.Time       `gorm:"type:date" json:"mfg_date"`
	ExpiryDate  time.Time       `gorm:"type:date" json:"expiry_date"`
	WarehouseID uint64          `gorm:"not null;index" json:"warehouse_id"`
	BinLocation string          `gorm:"size:100" json:"bin_location"`
	Qty         int             `gorm:"not null" json:"qty"`
	UnitCost    decimal.Decimal `gorm:"type:decimal(15,2);not null" json:"unit_cost"`
	TotalCost   decimal.Decimal `gorm:"type:decimal(15,2);not null" json:"total_cost"`

	// Relationships
	Product   *Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Warehouse *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
}
