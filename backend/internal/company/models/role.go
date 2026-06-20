package models

import (
	"time"

	"gorm.io/gorm"
)

// Role represents a user role scoped to a specific software module.
type Role struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	SoftwareID uint64 `gorm:"not null;uniqueIndex:idx_roles_software_name;uniqueIndex:idx_roles_software_code" json:"software_id"`

	RoleName    string `gorm:"type:varchar(100);not null;uniqueIndex:idx_roles_software_name" json:"role_name"`
	RoleCode    string `gorm:"type:varchar(100);uniqueIndex:idx_roles_software_code" json:"role_code"`
	Description string `gorm:"type:text" json:"description"`

	IsSystemRole bool   `gorm:"default:false" json:"is_system_role"`
	Status       string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by"`
	UpdatedBy *uint64 `json:"updated_by"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Software SoftwareModule `gorm:"foreignKey:SoftwareID" json:"software,omitempty"`
}

// TableName overrides the default table name
func (Role) TableName() string {
	return "roles"
}
