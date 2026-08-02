package model

import (
	"encoding/json"
	"time"
)

// AuditLog records all sensitive actions for compliance and traceability.
// This is an append-only table — audit logs are NEVER updated or deleted.
type AuditLog struct {
	ID         uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     uint64          `gorm:"not null;index" json:"user_id"`
	CompanyID  uint64          `gorm:"not null;index" json:"company_id"`
	BranchID   uint64          `gorm:"not null" json:"branch_id"`
	Module     string          `gorm:"size:50;not null;index" json:"module"`       // e.g., "finance", "auth"
	Action     string          `gorm:"size:50;not null;index" json:"action"`       // e.g., "create", "update", "delete", "approve", "login"
	EntityType string          `gorm:"size:100;not null;index" json:"entity_type"` // e.g., "journal_entry", "user"
	EntityID   uint64          `gorm:"not null" json:"entity_id"`
	OldValues  json.RawMessage `gorm:"type:json" json:"old_values,omitempty"` // Previous state (for updates)
	NewValues  json.RawMessage `gorm:"type:json" json:"new_values,omitempty"` // New state
	IPAddress  string          `gorm:"size:45;not null" json:"ip_address"`
	UserAgent  string          `gorm:"size:500" json:"user_agent"`
	CreatedAt  time.Time       `gorm:"not null;index" json:"created_at"`
	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}
