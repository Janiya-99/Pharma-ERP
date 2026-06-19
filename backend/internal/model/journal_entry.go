package model

import (
	"time"

	"github.com/shopspring/decimal"
)

// FirstApproveStatus represents the approval state of a journal entry.
type FirstApproveStatus int

const (
	FirstApprovePending  FirstApproveStatus = 0
	FirstApproveApproved FirstApproveStatus = 1
	FirstApproveRejected FirstApproveStatus = 2
)

// JournalEntry represents a General Ledger Journal Entry header.
type JournalEntry struct {
	ID                 uint64             `gorm:"primaryKey;autoIncrement" json:"id"`
	BranchID           uint64             `gorm:"column:branch_id;not null;index:idx_je_branch_date,priority:1" json:"branch_id"`
	RefNo              string             `gorm:"column:ref_no;size:50;uniqueIndex;not null" json:"ref_no"`
	TotalAmount        decimal.Decimal    `gorm:"column:total_amount;type:decimal(15,2);not null" json:"total_amount"`
	Description        string             `gorm:"column:description;type:text" json:"description"`
	FirstApproveStatus FirstApproveStatus `gorm:"column:first_approve_status;type:tinyint;default:0" json:"first_approve_status"`
	RejectReason       *string            `gorm:"column:reject_reason;size:255" json:"reject_reason,omitempty"`
	CreatedAt          time.Time          `gorm:"column:created_at;not null;index:idx_je_branch_date,priority:2" json:"created_at"`
	UpdatedAt          time.Time          `gorm:"column:updated_at;not null" json:"updated_at"`

	// Relationships
	Details   []JournalEntryDetail   `gorm:"foreignKey:JournalEntryID" json:"details,omitempty"`
	Branch    *Branch                `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Approvals []JournalEntryApproval `gorm:"foreignKey:JournalEntryID" json:"approvals,omitempty"`
}

func (JournalEntry) TableName() string {
	return "finance_journal_entries_header"
}
