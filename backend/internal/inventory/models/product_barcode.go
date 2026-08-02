package models

import (
	"time"

	"gorm.io/gorm"
)

type ProductBarcode struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID   uint64         `gorm:"not null;index:idx_company_barcode,unique" json:"company_id"`
	ProductID   uint64         `gorm:"not null;index" json:"product_id"`
	Barcode     string         `gorm:"type:varchar(100);not null;index:idx_company_barcode,unique" json:"barcode"`
	BarcodeType string         `gorm:"type:varchar(50);default:'primary'" json:"barcode_type"`
	Status      string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy   *uint64        `json:"created_by"`
	UpdatedBy   *uint64        `json:"updated_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
