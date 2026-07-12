package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// BackupPolicy configures automated database back up schedules and retention rules.
type BackupPolicy struct {
	ID                 uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID          uint64          `gorm:"not null;index" json:"company_id"`
	Frequency          string          `gorm:"size:30;not null;default:'daily'" json:"frequency"` // daily, weekly, monthly, real_time_mirror
	TimeOfDay          string          `gorm:"size:10;not null;default:'02:00'" json:"time_of_day"`
	RetentionDays      int             `gorm:"not null;default:30" json:"retention_days"`
	StorageDestination string          `gorm:"size:30;not null;default:'local'" json:"storage_destination"` // local, s3, gcs, azure_blob
	StorageConfigJSON  json.RawMessage `gorm:"type:json" json:"storage_config_json,omitempty"`
	IsActive           bool            `gorm:"not null;default:true" json:"is_active"`
	CreatedAt          time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt          time.Time       `gorm:"not null" json:"updated_at"`
	DeletedAt          gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}

func (BackupPolicy) TableName() string {
	return "backup_policies"
}

// BackupExecutionLog records historical backup jobs and verification checksums.
type BackupExecutionLog struct {
	ID                uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID         uint64     `gorm:"not null;index" json:"company_id"`
	PolicyID          *uint64    `gorm:"index" json:"policy_id,omitempty"`
	BackupType        string     `gorm:"size:30;not null;default:'scheduled'" json:"backup_type"` // scheduled, manual
	Status            string     `gorm:"size:30;not null;default:'in_progress'" json:"status"`    // success, failed, in_progress
	FileSizeBytes     int64      `gorm:"not null;default:0" json:"file_size_bytes"`
	StoragePath       string     `gorm:"size:255;not null" json:"storage_path"`
	Checksum          string     `gorm:"size:100" json:"checksum,omitempty"`
	TriggeredByUserID *uint64    `gorm:"index" json:"triggered_by_user_id,omitempty"`
	StartedAt         time.Time  `gorm:"not null" json:"started_at"`
	CompletedAt       *time.Time `json:"completed_at,omitempty"`
	ErrorMessage      string     `gorm:"size:500" json:"error_message,omitempty"`
}

func (BackupExecutionLog) TableName() string {
	return "backup_execution_logs"
}
