package models

import (
	"time"
)

// OpeningStockEntryApproval stores opening stock approval/rejection/posting history
type OpeningStockEntryApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	OpeningStockEntryID uint64 `gorm:"not null;index" json:"opening_stock_entry_id"`

	Action  string `gorm:"type:varchar(30);not null" json:"action"`
	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy uint64    `gorm:"not null" json:"action_by"`
	ActionAt time.Time `json:"action_at"`

	// Relationships
	OpeningStockEntry OpeningStockEntry `gorm:"foreignKey:OpeningStockEntryID" json:"-"`
}

// TableName overrides the table name used by GORM
func (OpeningStockEntryApproval) TableName() string {
	return "opening_stock_entry_approvals"
}
