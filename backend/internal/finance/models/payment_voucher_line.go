package models

import (
	"time"
)

type PaymentVoucherLine struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PaymentVoucherID uint64    `gorm:"not null;index" json:"payment_voucher_id"`
	AccountID        uint64    `gorm:"not null;index" json:"account_id"`
	LineDescription  string    `gorm:"type:text" json:"line_description"`
	Amount           float64   `gorm:"type:decimal(18,2);not null;default:0" json:"amount"`
	LineOrder        int       `gorm:"default:1" json:"line_order"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	Account *ChartOfAccount `gorm:"foreignKey:AccountID" json:"account,omitempty"`
}
