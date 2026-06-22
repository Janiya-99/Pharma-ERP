package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
)

type PettyCashVoucherApproval struct {
	ID                   uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PettyCashVoucherID   uint64    `gorm:"not null;index" json:"petty_cash_voucher_id"`
	Action               string    `gorm:"type:varchar(30);not null" json:"action"`
	Remarks              string    `gorm:"type:text" json:"remarks"`
	ActionBy             uint64    `gorm:"not null" json:"action_by"`
	ActionAt             time.Time `json:"action_at"`

	// Relationships
	PettyCashVoucher *PettyCashVoucher   `gorm:"foreignKey:PettyCashVoucherID" json:"petty_cash_voucher,omitempty"`
	ActionUser       *companyModels.User `gorm:"foreignKey:ActionBy" json:"action_user,omitempty"`
}

func (PettyCashVoucherApproval) TableName() string {
	return "petty_cash_voucher_approvals"
}
