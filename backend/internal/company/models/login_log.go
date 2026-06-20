package models

import (
	"time"
)

// LoginLog tracks login attempts and history for a user.
type LoginLog struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	UserID *uint64 `json:"user_id"`
	Email  string  `gorm:"type:varchar(150)" json:"email"`

	LoginStatus   string `gorm:"type:varchar(50)" json:"login_status"`
	FailureReason string `gorm:"type:text" json:"failure_reason"`

	IPAddress string `gorm:"type:varchar(100)" json:"ip_address"`
	UserAgent string `gorm:"type:text" json:"user_agent"`

	LoggedAt *time.Time `json:"logged_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName overrides the default table name
func (LoginLog) TableName() string {
	return "login_logs"
}
