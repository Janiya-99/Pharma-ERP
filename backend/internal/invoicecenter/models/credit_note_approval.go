package models

import "time"

type CreditNoteApproval struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CreditNoteID uint64    `gorm:"not null;index" json:"credit_note_id"`
	Action       string    `gorm:"type:varchar(30);not null" json:"action"`
	Remarks      string    `gorm:"type:text" json:"remarks"`
	ActionBy     uint64    `gorm:"not null" json:"action_by"`
	ActionAt     time.Time `gorm:"not null" json:"action_at"`
}

func (CreditNoteApproval) TableName() string {
	return "credit_note_approvals"
}
