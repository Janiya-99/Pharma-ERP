package models

import (
	"time"
)

// RolePermission assigns a specific permission to a role.
type RolePermission struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	RoleID       uint64 `gorm:"not null;uniqueIndex:idx_role_permissions" json:"role_id"`
	PermissionID uint64 `gorm:"not null;uniqueIndex:idx_role_permissions" json:"permission_id"`

	CreatedBy *uint64 `json:"created_by"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Role       Role       `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Permission Permission `gorm:"foreignKey:PermissionID" json:"permission,omitempty"`
}

// TableName overrides the default table name
func (RolePermission) TableName() string {
	return "role_permissions"
}
