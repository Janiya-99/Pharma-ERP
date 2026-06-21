package models

import (
	"time"

	"gorm.io/gorm"
)

type JournalEntry struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_je_company_journal;index:idx_je_company" json:"company_id"`
	BranchID  uint64 `gorm:"not null;index:idx_je_branch" json:"branch_id"`

	FinancialYearID    uint64 `gorm:"not null;index:idx_je_fy" json:"financial_year_id"`
	AccountingPeriodID uint64 `gorm:"not null;index:idx_je_ap" json:"accounting_period_id"`

	JournalNumber string    `gorm:"type:varchar(50);not null;uniqueIndex:idx_je_company_journal" json:"journal_number"`
	JournalDate   time.Time `gorm:"type:date;not null;index:idx_je_date" json:"journal_date"`

	ReferenceNumber string `gorm:"type:varchar(100)" json:"reference_number"`
	Description     string `gorm:"type:text" json:"description"`

	TotalDebit  float64 `gorm:"type:decimal(18,2);default:0" json:"total_debit"`
	TotalCredit float64 `gorm:"type:decimal(18,2);default:0" json:"total_credit"`

	ApprovalStatus string    `gorm:"type:varchar(30);default:draft;index:idx_je_approval" json:"approval_status"`
	ApprovedBy     *uint64   `json:"approved_by,omitempty"`
	ApprovedAt     *time.Time `json:"approved_at,omitempty"`

	PostedStatus string    `gorm:"type:varchar(30);default:unposted;index:idx_je_posted" json:"posted_status"`
	PostedBy     *uint64   `json:"posted_by,omitempty"`
	PostedAt     *time.Time `json:"posted_at,omitempty"`

	IsReversed        bool    `gorm:"default:false" json:"is_reversed"`
	ReversedJournalID *uint64 `json:"reversed_journal_id,omitempty"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Lines     []JournalEntryLine     `gorm:"foreignKey:JournalEntryID" json:"lines,omitempty"`
	Approvals []JournalEntryApproval `gorm:"foreignKey:JournalEntryID" json:"approvals,omitempty"`
	Reversals []JournalEntryReversal `gorm:"foreignKey:OriginalJournalEntryID" json:"reversal_info,omitempty"`
}

func (JournalEntry) TableName() string {
	return "journal_entries"
}
