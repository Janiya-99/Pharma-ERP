package model

import "github.com/shopspring/decimal"

// JournalEntryDetail represents a single line detail of a journal entry.
type JournalEntryDetail struct {
	ID             uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	JournalEntryID uint64          `gorm:"column:journal_entry_id;not null;index" json:"journal_entry_id"`
	GlID           uint64          `gorm:"column:gl_id;not null;index" json:"gl_id"`
	BranchID       uint64          `gorm:"column:branch_id;not null" json:"branch_id"`
	CreditAmount   decimal.Decimal `gorm:"column:credit_amount;type:decimal(15,2);not null;default:0" json:"credit_amount"`
	DebitAmount    decimal.Decimal `gorm:"column:debit_amount;type:decimal(15,2);not null;default:0" json:"debit_amount"`
	Remarks        string          `gorm:"column:remarks;size:255" json:"remarks,omitempty"`

	// Relationships
	Account *ChartOfAccounts `gorm:"foreignKey:GlID" json:"account,omitempty"`
}

func (JournalEntryDetail) TableName() string {
	return "finance_journal_entries_details"
}
