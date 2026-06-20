package models

import (
	"time"
)

// SoftwareCatalog represents an available software/module in the ERP platform.
//
// Examples: Control Center, Finance, Inventory, Invoice Center, Compliance Center.
type SoftwareCatalog struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`

	SoftwareCode string `gorm:"type:varchar(50);uniqueIndex:idx_software_catalog_code;not null" json:"software_code"`
	SoftwareName string `gorm:"type:varchar(150);not null" json:"software_name"`
	Description  string `gorm:"type:text" json:"description"`
	IconName     string `gorm:"type:varchar(100)" json:"icon_name"`
	RoutePath    string `gorm:"type:varchar(150)" json:"route_path"`
	DisplayOrder int    `gorm:"default:0" json:"display_order"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Associations
	Subscriptions []CompanySoftwareSubscription `gorm:"foreignKey:SoftwareID" json:"subscriptions,omitempty"`
}

// TableName overrides the default table name.
func (SoftwareCatalog) TableName() string {
	return "software_catalog"
}
