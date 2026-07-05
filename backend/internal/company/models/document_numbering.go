package models

import (
	"time"

	"gorm.io/gorm"
)

// DocumentNumberingRule represents a configuration rule for formatting document sequences.
type DocumentNumberingRule struct {
	ID             uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID      uint64         `gorm:"not null;index:idx_doc_rule_comp_mod,priority:1" json:"company_id"`
	BranchID       *uint64        `gorm:"index:idx_doc_rule_comp_mod,priority:2" json:"branch_id,omitempty"`
	Module         string         `gorm:"size:50;not null;index:idx_doc_rule_comp_mod,priority:3" json:"module"`
	DocumentType   string         `gorm:"size:50;not null;index:idx_doc_rule_comp_mod,priority:4" json:"document_type"`
	Prefix         string         `gorm:"size:30;not null" json:"prefix"`
	Suffix         string         `gorm:"size:30" json:"suffix"`
	Padding        int            `gorm:"not null;default:6" json:"padding"`
	ResetFrequency string         `gorm:"size:30;not null;default:'never'" json:"reset_frequency"` // never, monthly, yearly, financial_year, daily
	Status         string         `gorm:"size:20;not null;default:'published';index" json:"status"` // draft, published, archived
	VersionNumber  int            `gorm:"not null;default:1" json:"version_number"`
	IsDefault      bool           `gorm:"not null;default:false" json:"is_default"`
	CreatedBy      uint64         `gorm:"not null" json:"created_by"`
	UpdatedBy      uint64         `gorm:"not null" json:"updated_by"`
	PublishedBy    *uint64        `json:"published_by,omitempty"`
	PublishedAt    *time.Time     `json:"published_at,omitempty"`
	CreatedAt      time.Time      `gorm:"not null" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"not null" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (DocumentNumberingRule) TableName() string {
	return "document_numbering_rules"
}

// DocumentNumberSequence tracks the current running sequence for a rule and period.
type DocumentNumberSequence struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID       uint64    `gorm:"not null;index:idx_seq_lookup,priority:1" json:"company_id"`
	BranchID        uint64    `gorm:"not null;index:idx_seq_lookup,priority:2" json:"branch_id"`
	RuleID          uint64    `gorm:"not null;index:idx_seq_lookup,priority:3" json:"rule_id"`
	Module          string    `gorm:"size:50;not null" json:"module"`
	DocumentType    string    `gorm:"size:50;not null;index:idx_seq_lookup,priority:4" json:"document_type"`
	PeriodKey       string    `gorm:"size:30;not null;default:'ALL';index:idx_seq_lookup,priority:5" json:"period_key"` // e.g. "2026", "2026-07", "FY2026", "ALL"
	CurrentNumber   int64     `gorm:"not null;default:0" json:"current_number"`
	LastGeneratedAt time.Time `gorm:"not null" json:"last_generated_at"`
	UpdatedAt       time.Time `gorm:"not null" json:"updated_at"`
}

func (DocumentNumberSequence) TableName() string {
	return "document_number_sequences"
}
