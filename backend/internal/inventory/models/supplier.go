package models

import (
	"time"

	"gorm.io/gorm"
)

type Supplier struct {
	ID                    uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID             uint64         `gorm:"not null;index:idx_company_supplier_code,unique" json:"company_id"`
	SupplierCode          string         `gorm:"type:varchar(50);not null;index:idx_company_supplier_code,unique" json:"supplier_code"`
	SupplierName          string         `gorm:"type:varchar(150);not null" json:"supplier_name"`
	ContactPerson         string         `gorm:"type:varchar(150)" json:"contact_person"`
	ContactNumber         string         `gorm:"type:varchar(50)" json:"contact_number"`
	Email                 string         `gorm:"type:varchar(150)" json:"email"`
	Address               string         `gorm:"type:text" json:"address"`
	TaxRegistrationNumber string         `gorm:"type:varchar(100)" json:"tax_registration_number"`
	PaymentTermsDays      int            `gorm:"default:0" json:"payment_terms_days"`
	PayableAccountID      *uint64        `json:"payable_account_id"`
	Status                string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy             *uint64        `json:"created_by"`
	UpdatedBy             *uint64        `json:"updated_by"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}
