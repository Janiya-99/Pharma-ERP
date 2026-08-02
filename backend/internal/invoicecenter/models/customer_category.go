package models

import (
	"time"

	"gorm.io/gorm"
)

type CustomerCategory struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID    uint64         `gorm:"not null;index:idx_company_category_code,unique" json:"company_id"`
	CategoryCode string         `gorm:"type:varchar(50);not null;index:idx_company_category_code,unique" json:"category_code"`
	CategoryName string         `gorm:"type:varchar(255);not null" json:"category_name"`
	Description  string         `gorm:"type:text" json:"description"`
	CreditLimit  float64        `gorm:"type:decimal(18,2);default:0" json:"credit_limit"`
	CreditDays   int            `gorm:"default:0" json:"credit_days"`
	Status       string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy    *uint64        `json:"created_by"`
	UpdatedBy    *uint64        `json:"updated_by"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (CustomerCategory) TableName() string {
	return "customer_categories"
}
