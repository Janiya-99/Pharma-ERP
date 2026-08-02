package models

import (
	"time"

	"gorm.io/gorm"
)

type ProductUnit struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID   uint64         `gorm:"not null;index:idx_company_unit_code,unique" json:"company_id"`
	UnitCode    string         `gorm:"type:varchar(50);not null;index:idx_company_unit_code,unique" json:"unit_code"`
	UnitName    string         `gorm:"type:varchar(100);not null" json:"unit_name"`
	Description string         `gorm:"type:text" json:"description"`
	Status      string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy   *uint64        `json:"created_by"`
	UpdatedBy   *uint64        `json:"updated_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
