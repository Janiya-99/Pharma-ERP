package models

import (
	"time"

	"gorm.io/gorm"
)

type Warehouse struct {
	ID            uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID     uint64         `gorm:"not null;index:idx_company_warehouse_code,unique" json:"company_id"`
	BranchID      uint64         `gorm:"not null;index" json:"branch_id"`
	WarehouseCode string         `gorm:"type:varchar(50);not null;index:idx_company_warehouse_code,unique" json:"warehouse_code"`
	WarehouseName string         `gorm:"type:varchar(150);not null" json:"warehouse_name"`
	WarehouseType string         `gorm:"type:varchar(50);default:'main'" json:"warehouse_type"`
	Address       string         `gorm:"type:text" json:"address"`
	ContactPerson string         `gorm:"type:varchar(150)" json:"contact_person"`
	ContactNumber string         `gorm:"type:varchar(50)" json:"contact_number"`
	IsDefault     bool           `gorm:"default:false" json:"is_default"`
	Status        string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy     *uint64        `json:"created_by"`
	UpdatedBy     *uint64        `json:"updated_by"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
