package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
)

type FixedAssetDisposalApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	FixedAssetDisposalID uint64              `gorm:"not null;index" json:"fixed_asset_disposal_id"`
	FixedAssetDisposal   *FixedAssetDisposal `gorm:"foreignKey:FixedAssetDisposalID" json:"fixed_asset_disposal,omitempty"`

	Action string `gorm:"type:varchar(30);not null" json:"action"` // submitted, approved, rejected, cancelled, posted

	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy     uint64              `gorm:"not null" json:"action_by"`
	ActionByUser *companyModels.User `gorm:"foreignKey:ActionBy" json:"user,omitempty"`

	ActionAt time.Time `gorm:"autoCreateTime" json:"action_at"`

	CreatedAt time.Time `json:"created_at"`
}
