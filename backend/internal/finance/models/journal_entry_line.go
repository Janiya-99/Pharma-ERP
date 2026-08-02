package models

import "time"

type JournalEntryLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	JournalEntryID uint64 `gorm:"not null;index" json:"journal_entry_id"`
	AccountID      uint64 `gorm:"not null;index" json:"account_id"`

	LineDescription string `gorm:"type:text" json:"line_description"`

	DebitAmount  float64 `gorm:"type:decimal(18,2);default:0" json:"debit_amount"`
	CreditAmount float64 `gorm:"type:decimal(18,2);default:0" json:"credit_amount"`

	LineOrder int `gorm:"default:1" json:"line_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Account ChartOfAccount `gorm:"foreignKey:AccountID" json:"account,omitempty"`
}

func (JournalEntryLine) TableName() string {
	return "journal_entry_lines"
}
