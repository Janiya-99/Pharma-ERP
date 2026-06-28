package models

import "time"

type SalesOrderApproval struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SalesOrderID uint64    `gorm:"not null;index" json:"sales_order_id"`
	Action       string    `gorm:"type:varchar(30);not null" json:"action"`
	Remarks      string    `gorm:"type:text" json:"remarks"`
	ActionBy     uint64    `gorm:"not null" json:"action_by"`
	ActionAt     time.Time `gorm:"autoCreateTime" json:"action_at"`
}

func (SalesOrderApproval) TableName() string {
	return "sales_order_approvals"
}
