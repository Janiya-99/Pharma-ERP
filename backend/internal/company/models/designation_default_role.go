package models

import (
	"time"
)

// DesignationDefaultRole suggests roles when a specific designation is selected.
type DesignationDefaultRole struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID     uint64 `gorm:"not null;uniqueIndex:idx_desig_role" json:"company_id"`
	DesignationID uint64 `gorm:"not null;uniqueIndex:idx_desig_role" json:"designation_id"`
	RoleID        uint64 `gorm:"not null;uniqueIndex:idx_desig_role" json:"role_id"`

	IsDefault bool `gorm:"default:true" json:"is_default"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Company     Company     `gorm:"foreignKey:CompanyID" json:"-"`
	Designation Designation `gorm:"foreignKey:DesignationID" json:"-"`
	Role        Role        `gorm:"foreignKey:RoleID" json:"role,omitempty"`
}

func (DesignationDefaultRole) TableName() string {
	return "designation_default_roles"
}
