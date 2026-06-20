package models

import (
	"time"
)

// PasswordResetToken handles password resets for a user.
type PasswordResetToken struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	UserID uint64 `gorm:"not null" json:"user_id"`
	Token  string `gorm:"type:varchar(255);not null" json:"token"`

	ExpiresAt time.Time  `gorm:"not null" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`

	CreatedAt time.Time `json:"created_at"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName overrides the default table name
func (PasswordResetToken) TableName() string {
	return "password_reset_tokens"
}
