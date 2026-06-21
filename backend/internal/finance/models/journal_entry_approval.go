package models

import "time"

type JournalEntryApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	JournalEntryID uint64 `gorm:"not null;index" json:"journal_entry_id"`
	Action         string `gorm:"type:varchar(30);not null" json:"action"`

	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy uint64     `gorm:"not null" json:"action_by"`
	ActionAt *time.Time `json:"action_at,omitempty"`
}

func (JournalEntryApproval) TableName() string {
	return "journal_entry_approvals"
}
