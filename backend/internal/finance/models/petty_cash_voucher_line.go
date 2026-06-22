package models

import (
	"time"
)

type PettyCashVoucherLine struct {
	ID                   uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PettyCashVoucherID   uint64    `gorm:"not null;index" json:"petty_cash_voucher_id"`
	AccountID            uint64    `gorm:"not null" json:"account_id"`
	LineDescription      string    `gorm:"type:text" json:"line_description"`
	Amount               float64   `gorm:"type:decimal(18,2);not null;default:0" json:"amount"`
	LineOrder            int       `gorm:"default:1" json:"line_order"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`

	// Relationships
	PettyCashVoucher *PettyCashVoucher `gorm:"foreignKey:PettyCashVoucherID" json:"petty_cash_voucher,omitempty"`
	Account          *ChartOfAccount   `gorm:"foreignKey:AccountID" json:"account,omitempty"`
}

func (PettyCashVoucherLine) TableName() string {
	return "petty_cash_voucher_lines"
}
