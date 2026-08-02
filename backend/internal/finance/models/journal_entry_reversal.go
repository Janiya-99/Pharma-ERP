package models

import "time"

type JournalEntryReversal struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	OriginalJournalEntryID uint64 `gorm:"not null;index" json:"original_journal_entry_id"`
	ReversalJournalEntryID uint64 `gorm:"not null;index" json:"reversal_journal_entry_id"`

	ReversalDate time.Time `gorm:"type:date;not null" json:"reversal_date"`
	Reason       string    `gorm:"type:text" json:"reason"`

	CreatedBy *uint64   `json:"created_by,omitempty"`
	CreatedAt time.Time `json:"created_at"`

	OriginalJournal *JournalEntry `gorm:"foreignKey:OriginalJournalEntryID" json:"original_journal,omitempty"`
	ReversalJournal *JournalEntry `gorm:"foreignKey:ReversalJournalEntryID" json:"reversal_journal,omitempty"`
}

func (JournalEntryReversal) TableName() string {
	return "journal_entry_reversals"
}
