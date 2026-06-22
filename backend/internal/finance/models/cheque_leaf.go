package models

import (
	"time"
)

type ChequeLeaf struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_company_bank_leaf" json:"company_id"`
	BranchID  *uint64 `gorm:"index" json:"branch_id"`

	ChequeBookID  uint64 `gorm:"not null;index" json:"cheque_book_id"`
	BankAccountID uint64 `gorm:"not null;uniqueIndex:idx_company_bank_leaf" json:"bank_account_id"`

	ChequeNumber string `gorm:"type:varchar(50);not null;uniqueIndex:idx_company_bank_leaf" json:"cheque_number"`

	LeafStatus string `gorm:"type:varchar(30);default:'available'" json:"leaf_status"`

	UsedDate          *time.Time `gorm:"type:date" json:"used_date"`
	UsedReferenceType string     `gorm:"type:varchar(50)" json:"used_reference_type"`
	UsedReferenceID   *uint64    `json:"used_reference_id"`

	CancelledDate *time.Time `gorm:"type:date" json:"cancelled_date"`
	CancelReason  string     `gorm:"type:text" json:"cancel_reason"`

	CreatedBy *uint64 `json:"created_by"`
	UpdatedBy *uint64 `json:"updated_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	ChequeBook  *ChequeBook  `gorm:"foreignKey:ChequeBookID" json:"cheque_book,omitempty"`
	BankAccount *BankAccount `gorm:"foreignKey:BankAccountID" json:"bank_account,omitempty"`
}

func (ChequeLeaf) TableName() string {
	return "cheque_leaves"
}
