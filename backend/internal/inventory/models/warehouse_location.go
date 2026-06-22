package models

import (
	"time"

	"gorm.io/gorm"
)

type WarehouseLocation struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID        uint64         `gorm:"not null;index:idx_company_warehouse_loc_code,unique" json:"company_id"`
	WarehouseID      uint64         `gorm:"not null;index:idx_company_warehouse_loc_code,unique" json:"warehouse_id"`
	LocationCode     string         `gorm:"type:varchar(50);not null;index:idx_company_warehouse_loc_code,unique" json:"location_code"`
	LocationName     string         `gorm:"type:varchar(150)" json:"location_name"`
	Rack             string         `gorm:"type:varchar(50)" json:"rack"`
	Shelf            string         `gorm:"type:varchar(50)" json:"shelf"`
	Bin              string         `gorm:"type:varchar(50)" json:"bin"`
	StorageCondition string         `gorm:"type:varchar(50)" json:"storage_condition"`
	Status           string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy        *uint64        `json:"created_by"`
	UpdatedBy        *uint64        `json:"updated_by"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
