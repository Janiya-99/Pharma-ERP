package models

import (
	"time"
)

type PaymentVoucherApproval struct {
	ID               uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	PaymentVoucherID uint64     `gorm:"not null;index" json:"payment_voucher_id"`
	Action           string     `gorm:"type:varchar(30);not null" json:"action"`
	Remarks          string     `gorm:"type:text" json:"remarks"`
	ActionBy         uint64     `gorm:"not null" json:"action_by"`
	ActionAt         *time.Time `json:"action_at"`
}
