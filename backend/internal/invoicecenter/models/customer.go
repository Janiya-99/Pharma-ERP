package models

import (
	"time"

	"gorm.io/gorm"
)

type Customer struct {
	ID                         uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID                  uint64         `gorm:"not null;index:idx_company_customer_code,unique" json:"company_id"`
	CustomerCategoryID         *uint64        `gorm:"index" json:"customer_category_id"`
	CustomerCode               string         `gorm:"type:varchar(50);not null;index:idx_company_customer_code,unique" json:"customer_code"`
	CustomerName               string         `gorm:"type:varchar(255);not null" json:"customer_name"`
	CustomerType               string         `gorm:"type:varchar(50);default:'pharmacy';index" json:"customer_type"`
	BusinessRegistrationNumber string         `gorm:"type:varchar(100)" json:"business_registration_number"`
	TaxRegistrationNumber      string         `gorm:"type:varchar(100)" json:"tax_registration_number"`
	PrimaryContactPerson       string         `gorm:"type:varchar(255)" json:"primary_contact_person"`
	PrimaryContactNumber       string         `gorm:"type:varchar(50)" json:"primary_contact_number"`
	PrimaryEmail               string         `gorm:"type:varchar(255)" json:"primary_email"`
	BillingAddress             string         `gorm:"type:text" json:"billing_address"`
	ShippingAddress            string         `gorm:"type:text" json:"shipping_address"`
	CreditLimit                float64        `gorm:"type:decimal(18,2);default:0" json:"credit_limit"`
	CreditDays                 int            `gorm:"default:0" json:"credit_days"`
	ReceivableAccountID        *uint64        `gorm:"index" json:"receivable_account_id"`
	CurrentBalance             float64        `gorm:"type:decimal(18,2);default:0" json:"current_balance"`
	Status                     string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy                  *uint64        `json:"created_by"`
	UpdatedBy                  *uint64        `json:"updated_by"`
	CreatedAt                  time.Time      `json:"created_at"`
	UpdatedAt                  time.Time      `json:"updated_at"`
	DeletedAt                  gorm.DeletedAt `gorm:"index" json:"-"`

	Category  *CustomerCategory `gorm:"foreignKey:CustomerCategoryID" json:"category,omitempty"`
	Addresses []CustomerAddress `gorm:"foreignKey:CustomerID" json:"addresses,omitempty"`
	Contacts  []CustomerContact `gorm:"foreignKey:CustomerID" json:"contacts,omitempty"`
}

func (Customer) TableName() string {
	return "customers"
}
