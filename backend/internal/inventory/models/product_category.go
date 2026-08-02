package models

import (
	"time"

	"gorm.io/gorm"
)

type ProductCategory struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID    uint64         `gorm:"not null;index:idx_company_category_code,unique" json:"company_id"`
	CategoryCode string         `gorm:"type:varchar(50);not null;index:idx_company_category_code,unique" json:"category_code"`
	CategoryName string         `gorm:"type:varchar(150);not null" json:"category_name"`
	ParentID     *uint64        `json:"parent_id"`
	Level        int            `gorm:"default:1" json:"level"`
	Description  string         `gorm:"type:text" json:"description"`
	Status       string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy    *uint64        `json:"created_by"`
	UpdatedBy    *uint64        `json:"updated_by"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
