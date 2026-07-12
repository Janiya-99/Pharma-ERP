package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// SystemSettingGroup represents a logical categorization of settings (e.g., General, Fiscal, Localization, Notifications).
type SystemSettingGroup struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID   uint64         `gorm:"not null;index" json:"company_id"`
	GroupCode   string         `gorm:"size:50;not null;index" json:"group_code"`
	GroupName   string         `gorm:"size:100;not null" json:"group_name"`
	Description string         `gorm:"size:255" json:"description"`
	CreatedAt   time.Time      `gorm:"not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (SystemSettingGroup) TableName() string {
	return "system_setting_groups"
}

// SystemSetting represents a configurable setting item.
type SystemSetting struct {
	ID               uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID        uint64          `gorm:"not null;index:idx_setting_comp_key,priority:1" json:"company_id"`
	BranchID         *uint64         `gorm:"index" json:"branch_id,omitempty"`
	SettingGroup     string          `gorm:"size:50;not null;index" json:"setting_group"`
	SettingKey       string          `gorm:"size:100;not null;index:idx_setting_comp_key,priority:2" json:"setting_key"`
	SettingValueJSON json.RawMessage `gorm:"type:json;not null" json:"setting_value_json"`
	Status           string          `gorm:"size:20;not null;default:'published';index" json:"status"` // draft, published, archived
	VersionNumber    int             `gorm:"not null;default:1" json:"version_number"`
	EffectiveFrom    *time.Time      `json:"effective_from,omitempty"`
	EffectiveTo      *time.Time      `json:"effective_to,omitempty"`
	IsSystemDefault  bool            `gorm:"not null;default:false" json:"is_system_default"`
	CreatedBy        uint64          `gorm:"not null" json:"created_by"`
	UpdatedBy        uint64          `gorm:"not null" json:"updated_by"`
	PublishedBy      *uint64         `json:"published_by,omitempty"`
	PublishedAt      *time.Time      `json:"published_at,omitempty"`
	CreatedAt        time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt        time.Time       `gorm:"not null" json:"updated_at"`
	DeletedAt        gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}

func (SystemSetting) TableName() string {
	return "system_settings"
}

// SystemSettingVersion tracks historical versions of published settings.
type SystemSettingVersion struct {
	ID               uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	SettingID        uint64          `gorm:"not null;index" json:"setting_id"`
	CompanyID        uint64          `gorm:"not null;index" json:"company_id"`
	BranchID         *uint64         `gorm:"index" json:"branch_id,omitempty"`
	SettingGroup     string          `gorm:"size:50;not null" json:"setting_group"`
	SettingKey       string          `gorm:"size:100;not null;index" json:"setting_key"`
	SettingValueJSON json.RawMessage `gorm:"type:json;not null" json:"setting_value_json"`
	VersionNumber    int             `gorm:"not null" json:"version_number"`
	EffectiveFrom    *time.Time      `json:"effective_from,omitempty"`
	EffectiveTo      *time.Time      `json:"effective_to,omitempty"`
	PublishedBy      *uint64         `json:"published_by,omitempty"`
	PublishedAt      *time.Time      `json:"published_at,omitempty"`
	CreatedAt        time.Time       `gorm:"not null" json:"created_at"`
}

func (SystemSettingVersion) TableName() string {
	return "system_setting_versions"
}

// BranchSettingOverride specifically stores branch-level overrides for company settings.
type BranchSettingOverride struct {
	ID               uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID        uint64          `gorm:"not null;index:idx_branch_override,priority:1" json:"company_id"`
	BranchID         uint64          `gorm:"not null;index:idx_branch_override,priority:2" json:"branch_id"`
	SettingKey       string          `gorm:"size:100;not null;index:idx_branch_override,priority:3" json:"setting_key"`
	SettingValueJSON json.RawMessage `gorm:"type:json;not null" json:"setting_value_json"`
	Status           string          `gorm:"size:20;not null;default:'published'" json:"status"`
	VersionNumber    int             `gorm:"not null;default:1" json:"version_number"`
	UpdatedBy        uint64          `gorm:"not null" json:"updated_by"`
	CreatedAt        time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt        time.Time       `gorm:"not null" json:"updated_at"`
}

func (BranchSettingOverride) TableName() string {
	return "branch_setting_overrides"
}
