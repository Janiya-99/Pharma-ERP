package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// NotificationRule configures automated alerts for system events.
type NotificationRule struct {
	ID           uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID    uint64          `gorm:"not null;index:idx_notif_rule_comp_evt,priority:1" json:"company_id"`
	BranchID     *uint64         `gorm:"index" json:"branch_id,omitempty"`
	EventCode    string          `gorm:"size:100;not null;index:idx_notif_rule_comp_evt,priority:2" json:"event_code"` // e.g. "document.submitted", "document.approved", "stock.low"
	EventName    string          `gorm:"size:150;not null" json:"event_name"`
	Module       string          `gorm:"size:50;not null" json:"module"`
	ChannelsJSON json.RawMessage `gorm:"type:json;not null" json:"channels_json"` // ["in_app", "email"]
	TemplateTitle string         `gorm:"size:255;not null" json:"template_title"`
	TemplateBody string          `gorm:"type:text;not null" json:"template_body"`
	IsActive     bool            `gorm:"not null;default:true" json:"is_active"`
	CreatedAt    time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt    time.Time       `gorm:"not null" json:"updated_at"`
	DeletedAt    gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`

	Recipients []NotificationRecipient `gorm:"foreignKey:RuleID;constraint:OnDelete:CASCADE;" json:"recipients,omitempty"`
}

func (NotificationRule) TableName() string {
	return "notification_rules"
}

// NotificationRecipient identifies who receives notifications for a rule.
type NotificationRecipient struct {
	ID            uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	RuleID        uint64  `gorm:"not null;index" json:"rule_id"`
	RecipientType string  `gorm:"size:50;not null" json:"recipient_type"` // role, department, designation, specific_user, document_owner, branch_manager
	RoleID        *uint64 `gorm:"index" json:"role_id,omitempty"`
	DepartmentID  *uint64 `gorm:"index" json:"department_id,omitempty"`
	DesignationID *uint64 `gorm:"index" json:"designation_id,omitempty"`
	UserID        *uint64 `gorm:"index" json:"user_id,omitempty"`
	CreatedAt     time.Time `gorm:"not null" json:"created_at"`
}

func (NotificationRecipient) TableName() string {
	return "notification_recipients"
}

// NotificationLog tracks notifications sent by the system.
type NotificationLog struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64    `gorm:"not null;index" json:"company_id"`
	BranchID  *uint64   `gorm:"index" json:"branch_id,omitempty"`
	RuleID    *uint64   `gorm:"index" json:"rule_id,omitempty"`
	EventCode string    `gorm:"size:100;not null;index" json:"event_code"`
	Channel   string    `gorm:"size:30;not null" json:"channel"` // in_app, email, sms
	Recipient string    `gorm:"size:255;not null" json:"recipient"` // User ID or Email
	Title     string    `gorm:"size:255;not null" json:"title"`
	Body      string    `gorm:"type:text;not null" json:"body"`
	Status    string    `gorm:"size:30;not null;default:'sent'" json:"status"` // sent, failed
	ErrorMsg  string    `gorm:"size:500" json:"error_msg,omitempty"`
	SentAt    time.Time `gorm:"not null" json:"sent_at"`
}

func (NotificationLog) TableName() string {
	return "notification_logs"
}
