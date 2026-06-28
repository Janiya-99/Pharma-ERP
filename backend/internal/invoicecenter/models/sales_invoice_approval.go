package models

import "time"

type SalesInvoiceApproval struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SalesInvoiceID uint64    `gorm:"not null;index" json:"sales_invoice_id"`
	Action         string    `gorm:"type:varchar(30);not null" json:"action"`
	Remarks        string    `gorm:"type:text" json:"remarks"`
	ActionBy       uint64    `gorm:"not null" json:"action_by"`
	ActionAt       time.Time `gorm:"autoCreateTime" json:"action_at"`
}

func (SalesInvoiceApproval) TableName() string {
	return "sales_invoice_approvals"
}
