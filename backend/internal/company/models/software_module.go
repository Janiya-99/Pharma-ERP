package models

import (
	"time"
)

// SoftwareModule represents the software modules available inside the company database.
type SoftwareModule struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	SoftwareCode string `gorm:"type:varchar(50);not null;uniqueIndex:idx_software_modules_code" json:"software_code"`
	SoftwareName string `gorm:"type:varchar(150);not null" json:"software_name"`

	Description  string `gorm:"type:text" json:"description"`
	IconName     string `gorm:"type:varchar(100)" json:"icon_name"`
	RoutePath    string `gorm:"type:varchar(150)" json:"route_path"`
	DisplayOrder int    `gorm:"default:0" json:"display_order"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName overrides the default table name
func (SoftwareModule) TableName() string {
	return "software_modules"
}
