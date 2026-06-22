package models

import (
	"time"

	"gorm.io/gorm"
)

type Manufacturer struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID        uint64         `gorm:"not null;index:idx_company_manufacturer_code,unique" json:"company_id"`
	ManufacturerCode string         `gorm:"type:varchar(50);not null;index:idx_company_manufacturer_code,unique" json:"manufacturer_code"`
	ManufacturerName string         `gorm:"type:varchar(150);not null" json:"manufacturer_name"`
	Country          string         `gorm:"type:varchar(100)" json:"country"`
	ContactPerson    string         `gorm:"type:varchar(150)" json:"contact_person"`
	ContactNumber    string         `gorm:"type:varchar(50)" json:"contact_number"`
	Email            string         `gorm:"type:varchar(150)" json:"email"`
	Address          string         `gorm:"type:text" json:"address"`
	Status           string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy        *uint64        `json:"created_by"`
	UpdatedBy        *uint64        `json:"updated_by"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
