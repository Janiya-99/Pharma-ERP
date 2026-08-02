package models

import (
	"time"
)

type PurchaseReturnApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	PurchaseReturnID uint64 `gorm:"not null;index" json:"purchase_return_id"`
	ApproverID       uint64 `gorm:"not null" json:"approver_id"`

	Action       string    `gorm:"type:varchar(50);not null" json:"action"`
	Remarks      string    `gorm:"type:text" json:"remarks"`
	ApprovalDate time.Time `gorm:"not null" json:"approval_date"`
}

func (PurchaseReturnApproval) TableName() string {
	return "purchase_return_approvals"
}
