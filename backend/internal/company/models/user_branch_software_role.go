package models

import (
	"time"
)

// UserBranchSoftwareRole represents the User Access Matrix.
// It answers: Which user? Which branch? Which software? Which role?
type UserBranchSoftwareRole struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	UserID     uint64 `gorm:"not null;uniqueIndex:idx_user_branch_software_role" json:"user_id"`
	BranchID   uint64 `gorm:"not null;uniqueIndex:idx_user_branch_software_role" json:"branch_id"`
	SoftwareID uint64 `gorm:"not null;uniqueIndex:idx_user_branch_software_role" json:"software_id"`
	RoleID     uint64 `gorm:"not null;uniqueIndex:idx_user_branch_software_role" json:"role_id"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User     User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Branch   Branch         `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Software SoftwareModule `gorm:"foreignKey:SoftwareID" json:"software,omitempty"`
	Role     Role           `gorm:"foreignKey:RoleID" json:"role,omitempty"`
}

// TableName overrides the default table name
func (UserBranchSoftwareRole) TableName() string {
	return "user_branch_software_roles"
}
