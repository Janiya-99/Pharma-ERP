package models

import (
	"time"
)

type CustomerContact struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerID    uint64    `gorm:"not null;index" json:"customer_id"`
	ContactName   string    `gorm:"type:varchar(255);not null" json:"contact_name"`
	Designation   string    `gorm:"type:varchar(100)" json:"designation"`
	ContactNumber string    `gorm:"type:varchar(50)" json:"contact_number"`
	Email         string    `gorm:"type:varchar(255)" json:"email"`
	IsPrimary     bool      `gorm:"default:false" json:"is_primary"`
	Status        string    `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (CustomerContact) TableName() string {
	return "customer_contacts"
}
