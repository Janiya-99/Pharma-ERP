package models

import (
	"time"
)

type StockTransferApproval struct {
	ID              uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	StockTransferID uint64 `gorm:"not null;index" json:"stock_transfer_id"`

	Action  string `gorm:"type:varchar(30);not null" json:"action"`
	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy uint64    `gorm:"not null" json:"action_by"`
	ActionAt time.Time `json:"action_at"`

	// Optional relations for nested responses if needed
	// ActionByUser *User `gorm:"foreignKey:ActionBy" json:"action_by_user,omitempty"`
}
