package models

import (
	"time"

	"gorm.io/gorm"
)

// SecurityPolicy configures authentication, password rules, and session controls.
type SecurityPolicy struct {
	ID                        uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID                 uint64         `gorm:"not null;index:idx_sec_pol_comp,priority:1" json:"company_id"`
	BranchID                  *uint64        `gorm:"index:idx_sec_pol_comp,priority:2" json:"branch_id,omitempty"`
	MinPasswordLength         int            `gorm:"not null;default:8" json:"min_password_length"`
	RequireUppercase          bool           `gorm:"not null;default:true" json:"require_uppercase"`
	RequireLowercase          bool           `gorm:"not null;default:true" json:"require_lowercase"`
	RequireNumber             bool           `gorm:"not null;default:true" json:"require_number"`
	RequireSpecialChar        bool           `gorm:"not null;default:true" json:"require_special_char"`
	PasswordExpiryDays        int            `gorm:"not null;default:90" json:"password_expiry_days"` // 0 = never
	MaxFailedLoginAttempts    int            `gorm:"not null;default:5" json:"max_failed_login_attempts"`
	LockoutDurationMinutes    int            `gorm:"not null;default:30" json:"lockout_duration_minutes"`
	SessionIdleTimeoutMinutes int            `gorm:"not null;default:60" json:"session_idle_timeout_minutes"`
	MaxConcurrentSessions     int            `gorm:"not null;default:3" json:"max_concurrent_sessions"`
	RequireMFA                bool           `gorm:"not null;default:false" json:"require_mfa"`
	MFAPolicy                 string         `gorm:"size:30;not null;default:'optional'" json:"mfa_policy"`    // optional, required_all, required_admin, required_remote
	Status                    string         `gorm:"size:20;not null;default:'published';index" json:"status"` // draft, published, archived
	VersionNumber             int            `gorm:"not null;default:1" json:"version_number"`
	CreatedBy                 uint64         `gorm:"not null" json:"created_by"`
	UpdatedBy                 uint64         `gorm:"not null" json:"updated_by"`
	PublishedBy               *uint64        `json:"published_by,omitempty"`
	PublishedAt               *time.Time     `json:"published_at,omitempty"`
	CreatedAt                 time.Time      `gorm:"not null" json:"created_at"`
	UpdatedAt                 time.Time      `gorm:"not null" json:"updated_at"`
	DeletedAt                 gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (SecurityPolicy) TableName() string {
	return "security_policies"
}

// TrustedIPRule defines IP whitelisting or restriction policies.
type TrustedIPRule struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID  uint64    `gorm:"not null;index" json:"company_id"`
	BranchID   *uint64   `gorm:"index" json:"branch_id,omitempty"`
	RuleName   string    `gorm:"size:100;not null" json:"rule_name"`
	IPRange    string    `gorm:"size:100;not null" json:"ip_range"`                   // CIDR or exact IP e.g. "192.168.1.0/24"
	AccessType string    `gorm:"size:30;not null;default:'allow'" json:"access_type"` // allow, deny, require_mfa
	IsActive   bool      `gorm:"not null;default:true" json:"is_active"`
	CreatedAt  time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt  time.Time `gorm:"not null" json:"updated_at"`
}

func (TrustedIPRule) TableName() string {
	return "trusted_ip_rules"
}
