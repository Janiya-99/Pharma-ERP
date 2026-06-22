package model

import (
	"time"
)

// Session represents an active user session with refresh token support.
// Supports refresh token rotation for security.
type Session struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint64    `gorm:"not null;index" json:"user_id"`
	AccessTokenID string    `gorm:"size:255;uniqueIndex;not null" json:"-"` // JWT jti claim
	RefreshToken  string    `gorm:"size:255;uniqueIndex;not null" json:"-"` // Never expose
	IPAddress     string    `gorm:"size:45;not null" json:"ip_address"`
	UserAgent     string    `gorm:"size:500" json:"user_agent"`
	ExpiresAt     time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt     time.Time `gorm:"not null" json:"created_at"`
	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Session) TableName() string {
	return "sessions"
}

// IsExpired checks if the session has expired.
func (s *Session) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}
