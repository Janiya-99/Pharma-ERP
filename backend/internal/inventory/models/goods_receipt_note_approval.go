package models

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/model"
)

// GoodsReceiptNoteApproval stores the approval history for a GRN
type GoodsReceiptNoteApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	GoodsReceiptNoteID uint64 `gorm:"not null;index" json:"goods_receipt_note_id"`

	Action  string `gorm:"type:varchar(30);not null" json:"action"`
	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy uint64     `gorm:"not null" json:"action_by"`
	ActionAt *time.Time `json:"action_at"`

	// Relationships
	User model.User `gorm:"foreignKey:ActionBy" json:"user"`
}

// TableName overrides the table name used by GORM
func (GoodsReceiptNoteApproval) TableName() string {
	return "goods_receipt_note_approvals"
}
