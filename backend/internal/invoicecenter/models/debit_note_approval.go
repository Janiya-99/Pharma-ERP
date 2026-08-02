package models

import "time"

type DebitNoteApproval struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	DebitNoteID uint64    `gorm:"not null;index" json:"debit_note_id"`
	Action      string    `gorm:"type:varchar(30);not null" json:"action"`
	Remarks     string    `gorm:"type:text" json:"remarks"`
	ActionBy    uint64    `gorm:"not null" json:"action_by"`
	ActionAt    time.Time `gorm:"not null" json:"action_at"`
}

func (DebitNoteApproval) TableName() string {
	return "debit_note_approvals"
}
