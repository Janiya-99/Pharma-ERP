package models

import (
	"time"
)

// Permission represents an access right or action within a software module.
type Permission struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	SoftwareID uint64 `gorm:"not null" json:"software_id"`

	PermissionGroup string `gorm:"type:varchar(100);not null" json:"permission_group"`
	PermissionKey   string `gorm:"type:varchar(150);not null;uniqueIndex" json:"permission_key"`
	PermissionName  string `gorm:"type:varchar(150);not null" json:"permission_name"`
	Description     string `gorm:"type:text" json:"description"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Software SoftwareModule `gorm:"foreignKey:SoftwareID" json:"software,omitempty"`
}

// TableName overrides the default table name
func (Permission) TableName() string {
	return "permissions"
}
