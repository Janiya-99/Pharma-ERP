package models

import (
	"time"

	"gorm.io/gorm"
)

type ChequeBook struct {
	ID        uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64  `gorm:"not null;index" json:"company_id"`
	BranchID  *uint64 `gorm:"index" json:"branch_id"`

	BankAccountID uint64 `gorm:"not null;index" json:"bank_account_id"`

	ChequeBookNumber string `gorm:"type:varchar(100)" json:"cheque_book_number"`
	StartLeafNumber  string `gorm:"type:varchar(50);not null" json:"start_leaf_number"`
	EndLeafNumber    string `gorm:"type:varchar(50);not null" json:"end_leaf_number"`

	TotalLeaves     int `gorm:"default:0" json:"total_leaves"`
	UsedLeaves      int `gorm:"default:0" json:"used_leaves"`
	CancelledLeaves int `gorm:"default:0" json:"cancelled_leaves"`
	AvailableLeaves int `gorm:"default:0" json:"available_leaves"`

	IssuedDate *time.Time `gorm:"type:date" json:"issued_date"`
	Remarks    string     `gorm:"type:text" json:"remarks"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64        `json:"created_by"`
	UpdatedBy *uint64        `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	BankAccount  *BankAccount `gorm:"foreignKey:BankAccountID" json:"bank_account,omitempty"`
	ChequeLeaves []ChequeLeaf `gorm:"foreignKey:ChequeBookID" json:"cheque_leaves,omitempty"`
}

func (ChequeBook) TableName() string {
	return "cheque_books"
}
