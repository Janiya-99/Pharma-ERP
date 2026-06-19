package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type GlTransactionStatus int

const (
	GlTransactionDraft    GlTransactionStatus = 1
	GlTransactionPosted   GlTransactionStatus = 2
	GlTransactionReversed GlTransactionStatus = 3
)

// GlTransaction represents an entry in the general ledger (replacing LedgerEntry).
type GlTransaction struct {
	ID                  uint64              `gorm:"primaryKey;autoIncrement" json:"id"`
	GlID                uint64              `gorm:"column:gl_id;not null;index:idx_gl_trans_composite_gl,priority:1" json:"gl_id"`
	BranchID            uint64              `gorm:"column:branch_id;not null;index:idx_gl_trans_composite_branch,priority:1" json:"branch_id"`
	ReferenceNo         string              `gorm:"column:reference_no;size:50;not null" json:"reference_no"`
	ReferenceType       string              `gorm:"column:reference_type;size:100;not null;index:idx_gl_trans_polymorphic,priority:1" json:"reference_type"`
	ReferenceID         uint64              `gorm:"column:reference_id;not null;index:idx_gl_trans_polymorphic,priority:2" json:"reference_id"`
	TransactionType     string              `gorm:"column:transaction_type;type:enum('CR','DR');not null" json:"transaction_type"` // CR or DR
	TransactionCategory *string             `gorm:"column:transaction_category;size:100" json:"transaction_category,omitempty"`
	TransactionAmount   decimal.Decimal     `gorm:"column:transaction_amount;type:decimal(15,2);not null" json:"transaction_amount"`
	TransactionDate     time.Time           `gorm:"column:transaction_date;type:date;not null;index:idx_gl_trans_composite_branch,priority:2;index:idx_gl_trans_composite_gl,priority:2" json:"transaction_date"`
	Status              GlTransactionStatus `gorm:"column:status;type:tinyint;default:1" json:"status"`
	Reconciled          bool                `gorm:"column:reconciled;default:false;not null" json:"reconciled"`
	Description         *string             `gorm:"column:description;size:255" json:"description,omitempty"`
	ChequeNo            *string             `gorm:"column:cheque_no;size:50" json:"cheque_no,omitempty"`
	CreatedAt           time.Time           `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt           time.Time           `gorm:"column:updated_at;not null" json:"updated_at"`

	// Relationships
	Account *ChartOfAccounts `gorm:"foreignKey:GlID" json:"account,omitempty"`
	Branch  *Branch          `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
}

func (GlTransaction) TableName() string {
	return "finance_gl_transactions"
}
