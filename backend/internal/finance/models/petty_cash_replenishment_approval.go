package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
)

type PettyCashReplenishmentApproval struct {
	ID                       uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PettyCashReplenishmentID uint64    `gorm:"not null;index" json:"petty_cash_replenishment_id"`
	Action                   string    `gorm:"type:varchar(30);not null" json:"action"`
	Remarks                  string    `gorm:"type:text" json:"remarks"`
	ActionBy                 uint64    `gorm:"not null" json:"action_by"`
	ActionAt                 time.Time `json:"action_at"`

	// Relationships
	PettyCashReplenishment *PettyCashReplenishment `gorm:"foreignKey:PettyCashReplenishmentID" json:"petty_cash_replenishment,omitempty"`
	ActionUser             *companyModels.User     `gorm:"foreignKey:ActionBy" json:"action_user,omitempty"`
}

func (PettyCashReplenishmentApproval) TableName() string {
	return "petty_cash_replenishment_approvals"
}
