package models

import (
	"time"
)

// UserSoftwareAccess controls which software modules a user has access to.
type UserSoftwareAccess struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	UserID     uint64 `gorm:"not null;uniqueIndex:idx_user_software_access" json:"user_id"`
	SoftwareID uint64 `gorm:"not null;uniqueIndex:idx_user_software_access" json:"software_id"`

	CanAccess bool   `gorm:"default:true" json:"can_access"`
	Status    string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User     User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Software SoftwareModule `gorm:"foreignKey:SoftwareID" json:"software,omitempty"`
}

// TableName overrides the default table name
func (UserSoftwareAccess) TableName() string {
	return "user_software_access"
}
