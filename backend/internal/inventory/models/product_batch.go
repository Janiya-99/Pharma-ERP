package models

import (
	"time"

	"gorm.io/gorm"
)

type ProductBatch struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID       uint64         `gorm:"not null;index:idx_company_product_batch,unique" json:"company_id"`
	ProductID       uint64         `gorm:"not null;index:idx_company_product_batch,unique" json:"product_id"`
	BatchNumber     string         `gorm:"type:varchar(100);not null;index:idx_company_product_batch,unique" json:"batch_number"`
	ManufactureDate *time.Time     `json:"manufacture_date"`
	ExpiryDate      *time.Time     `gorm:"index" json:"expiry_date"`
	SupplierID      *uint64        `json:"supplier_id"`
	ManufacturerID  *uint64        `json:"manufacturer_id"`
	PurchaseRate    float64        `gorm:"type:decimal(18,2);default:0" json:"purchase_rate"`
	SellingPrice    float64        `gorm:"type:decimal(18,2);default:0" json:"selling_price"`
	MRP             float64        `gorm:"type:decimal(18,2);default:0" json:"mrp"`
	BatchStatus     string         `gorm:"type:varchar(30);default:'active';index" json:"batch_status"`
	IsBlocked       bool           `gorm:"default:false" json:"is_blocked"`
	BlockReason     string         `gorm:"type:text" json:"block_reason"`
	CreatedBy       *uint64        `json:"created_by"`
	UpdatedBy       *uint64        `json:"updated_by"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
