package models

import (
	"time"
)

type SalesReturnApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	SalesReturnID uint64 `gorm:"not null;index" json:"sales_return_id"`

	Action  string `gorm:"type:varchar(30);not null" json:"action"`
	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy uint64    `gorm:"not null" json:"action_by"`
	ActionAt time.Time `json:"action_at"`
}

func (SalesReturnApproval) TableName() string {
	return "sales_return_approvals"
}
