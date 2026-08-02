package models

import (
	"time"
)

// UserBranchRole represents the User Access Matrix.
// It answers: Which user? Which branch? Which role?
type UserBranchRole struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	UserID   uint64 `gorm:"not null;uniqueIndex:idx_user_branch_role" json:"user_id"`
	BranchID uint64 `gorm:"not null;uniqueIndex:idx_user_branch_role" json:"branch_id"`
	RoleID   uint64 `gorm:"not null;uniqueIndex:idx_user_branch_role" json:"role_id"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User   User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Branch Branch `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Role   Role   `gorm:"foreignKey:RoleID" json:"role,omitempty"`
}

// TableName overrides the default table name
func (UserBranchRole) TableName() string {
	return "user_branch_roles"
}
