package model

import "time"

// JournalEntryApproval represents an approval audit record for a journal entry.
type JournalEntryApproval struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	JournalEntryID uint64    `gorm:"column:journal_entry_id;not null;index" json:"journal_entry_id"`
	UserID         uint64    `gorm:"column:user_id;not null" json:"user_id"`
	ApprovedStatus int       `gorm:"column:approved_status;type:tinyint;not null" json:"approved_status"` // 0-Rejected, 1-Approved
	Approval       int       `gorm:"column:approval;type:tinyint;not null" json:"approval"`               // 1-First Approval, 2-Final Approval
	Comment        *string   `gorm:"column:comment;size:255" json:"comment,omitempty"`
	CreatedAt      time.Time `gorm:"column:created_at;not null" json:"created_at"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (JournalEntryApproval) TableName() string {
	return "finance_journal_entry_approvals"
}
