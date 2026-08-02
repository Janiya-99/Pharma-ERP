package models

import (
	"time"
)

// CompanySoftwareSubscription controls which company can access which software/module.
//
// Example: OMACX can use Control Center, Finance, Inventory, etc.
type CompanySoftwareSubscription struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`

	PlatformCompanyID uint `gorm:"not null;uniqueIndex:idx_company_software" json:"platform_company_id"`
	SoftwareID        uint `gorm:"not null;uniqueIndex:idx_company_software" json:"software_id"`

	SubscriptionPlan   string `gorm:"type:varchar(50)" json:"subscription_plan"`
	SubscriptionStatus string `gorm:"type:varchar(50);default:active" json:"subscription_status"`
	StartDate          string `gorm:"type:date" json:"start_date"`
	EndDate            string `gorm:"type:date" json:"end_date"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Associations
	PlatformCompany PlatformCompany `gorm:"foreignKey:PlatformCompanyID" json:"platform_company,omitempty"`
	Software        SoftwareCatalog `gorm:"foreignKey:SoftwareID" json:"software,omitempty"`
}

// TableName overrides the default table name.
func (CompanySoftwareSubscription) TableName() string {
	return "company_software_subscriptions"
}
