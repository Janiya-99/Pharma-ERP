package models

import (
	"time"
)

type CustomerReceiptApproval struct {
	ID                uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerReceiptID uint64    `gorm:"not null;index" json:"customer_receipt_id"`
	Action            string    `gorm:"type:varchar(30);not null;index" json:"action"`
	Remarks           string    `gorm:"type:text" json:"remarks"`
	ActionBy          uint64    `gorm:"not null;index" json:"action_by"`
	ActionAt          time.Time `gorm:"not null;index" json:"action_at"`
}

func (CustomerReceiptApproval) TableName() string {
	return "customer_receipt_approvals"
}
