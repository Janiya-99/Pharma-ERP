package models

import (
	"time"
)

type AuditLog struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID    uint64    `gorm:"not null;index" json:"company_id"`
	BranchID     *uint64   `gorm:"index" json:"branch_id"`
	UserID       *uint64   `gorm:"index" json:"user_id"`
	SoftwareCode string    `gorm:"type:varchar(50)" json:"software_code"`
	Action       string    `gorm:"type:varchar(50);not null;index" json:"action"`
	EntityName   string    `gorm:"type:varchar(100);not null;index:idx_audit_logs_entity" json:"entity_name"`
	EntityID     *uint64   `gorm:"index:idx_audit_logs_entity" json:"entity_id"`
	OldValues    *string   `gorm:"type:json" json:"old_values"`
	NewValues    *string   `gorm:"type:json" json:"new_values"`
	IPAddress    string    `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent    string    `gorm:"type:varchar(255)" json:"user_agent"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}
