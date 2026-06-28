package models

import (
	"time"

	"gorm.io/gorm"
)

// PlatformCompany represents a registered ERP client company
// stored in the platform database (erp_platform) as tenant_companies.
type PlatformCompany struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyCode string `gorm:"type:varchar(50);uniqueIndex:idx_tenant_companies_code;not null" json:"company_code"`
	CompanyName string `gorm:"type:varchar(150);not null" json:"company_name"`

	LegalName          string `gorm:"type:varchar(200)" json:"legal_name"`
	RegistrationNumber string `gorm:"type:varchar(100)" json:"registration_number"`
	TaxNumber          string `gorm:"type:varchar(100)" json:"tax_number"`
	Industry           string `gorm:"type:varchar(100)" json:"industry"`
	CompanyEmail       string `gorm:"type:varchar(150)" json:"company_email"`
	CompanyPhone       string `gorm:"type:varchar(50)" json:"company_phone"`
	Country            string `gorm:"type:varchar(100)" json:"country"`
	Timezone           string `gorm:"type:varchar(100)" json:"timezone"`

	// Keeping fields for legacy compatibility
	ContactPerson string `gorm:"type:varchar(150)" json:"contact_person"`
	Email         string `gorm:"type:varchar(150)" json:"email"`
	Phone         string `gorm:"type:varchar(50)" json:"phone"`

	DatabaseName        string `gorm:"type:varchar(100);uniqueIndex:idx_tenant_companies_dbname;not null" json:"database_name"`
	DatabaseHost        string `gorm:"type:varchar(100);default:localhost" json:"database_host"`
	DatabasePort        int    `gorm:"default:3306" json:"database_port"`
	DatabaseUser        string `gorm:"type:varchar(100)" json:"database_user"`
	DatabasePasswordKey string `gorm:"type:varchar(150)" json:"database_password_key"`

	SubscriptionStatus string `gorm:"type:varchar(50);default:active" json:"subscription_status"`
	Status             string `gorm:"type:varchar(30);default:active" json:"status"` // draft, active, suspended, expired, cancelled

	LicenseStartDate *time.Time `json:"license_start_date"`
	LicenseEndDate   *time.Time `json:"license_end_date"`
	CreatedBy        uint       `json:"created_by"`
	UpdatedBy        uint       `json:"updated_by"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	// Associations
	Subscriptions []CompanySoftwareSubscription `gorm:"foreignKey:PlatformCompanyID" json:"subscriptions,omitempty"`
}

// TableName overrides the default table name.
func (PlatformCompany) TableName() string {
	return "tenant_companies"
}
