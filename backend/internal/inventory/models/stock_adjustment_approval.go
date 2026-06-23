package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
)

type StockAdjustmentApproval struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	StockAdjustmentID uint64           `gorm:"index;not null" json:"stock_adjustment_id"`
	StockAdjustment   *StockAdjustment `gorm:"foreignKey:StockAdjustmentID" json:"-"`

	Action  string `gorm:"type:varchar(30);not null" json:"action"` // submitted, approved, rejected, cancelled, posted
	Remarks string `gorm:"type:text" json:"remarks"`

	ActionBy     uint64              `gorm:"index;not null" json:"action_by"`
	ActionByUser *companyModels.User `gorm:"foreignKey:ActionBy" json:"action_by_user,omitempty"`

	ActionAt time.Time `json:"action_at"`
}
