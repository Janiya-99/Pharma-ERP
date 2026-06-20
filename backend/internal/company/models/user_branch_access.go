package models

import (
	"time"
)

// UserBranchAccess controls which branches a user has access to.
type UserBranchAccess struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	UserID   uint64 `gorm:"not null;uniqueIndex:idx_user_branch_access" json:"user_id"`
	BranchID uint64 `gorm:"not null;uniqueIndex:idx_user_branch_access" json:"branch_id"`

	IsDefault bool   `gorm:"default:false" json:"is_default"`
	Status    string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User   User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Branch Branch `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
}

// TableName overrides the default table name
func (UserBranchAccess) TableName() string {
	return "user_branch_access"
}
