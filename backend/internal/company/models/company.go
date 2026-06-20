package models

import (
	"time"

	"gorm.io/gorm"
)

// Company represents the core profile of the company in its own dedicated database.
type Company struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyCode string `gorm:"type:varchar(50);uniqueIndex:idx_companies_code;not null" json:"company_code"`
	CompanyName string `gorm:"type:varchar(150);not null" json:"company_name"`

	RegistrationNumber string `gorm:"type:varchar(100)" json:"registration_number"`
	TaxNumber          string `gorm:"type:varchar(100)" json:"tax_number"`

	Address string `gorm:"type:text" json:"address"`
	Phone   string `gorm:"type:varchar(50)" json:"phone"`
	Email   string `gorm:"type:varchar(150)" json:"email"`
	LogoURL string `gorm:"type:text" json:"logo_url"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

// TableName overrides the default table name
func (Company) TableName() string {
	return "companies"
}
