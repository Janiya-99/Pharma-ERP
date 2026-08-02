package models

import (
	"time"
)

type CustomerAddress struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerID   uint64    `gorm:"not null;index" json:"customer_id"`
	AddressType  string    `gorm:"type:varchar(50);not null;index" json:"address_type"`
	AddressLine1 string    `gorm:"type:varchar(255)" json:"address_line_1"`
	AddressLine2 string    `gorm:"type:varchar(255)" json:"address_line_2"`
	City         string    `gorm:"type:varchar(100)" json:"city"`
	District     string    `gorm:"type:varchar(100)" json:"district"`
	Province     string    `gorm:"type:varchar(100)" json:"province"`
	PostalCode   string    `gorm:"type:varchar(50)" json:"postal_code"`
	Country      string    `gorm:"type:varchar(100);default:'Sri Lanka'" json:"country"`
	IsDefault    bool      `gorm:"default:false" json:"is_default"`
	Status       string    `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (CustomerAddress) TableName() string {
	return "customer_addresses"
}
