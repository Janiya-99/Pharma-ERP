package models

import (
	"time"
)

type FixedAssetDepreciationLine struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	FixedAssetDepreciationRunID uint64                     `gorm:"not null;index:idx_fadl_run_asset,unique" json:"fixed_asset_depreciation_run_id"`
	FixedAssetDepreciationRun   *FixedAssetDepreciationRun `gorm:"foreignKey:FixedAssetDepreciationRunID" json:"fixed_asset_depreciation_run,omitempty"`

	FixedAssetID uint64      `gorm:"not null;index:idx_fadl_run_asset,unique" json:"fixed_asset_id"`
	FixedAsset   *FixedAsset `gorm:"foreignKey:FixedAssetID" json:"fixed_asset,omitempty"`

	AssetCode string `gorm:"type:varchar(50)" json:"asset_code"`
	AssetName string `gorm:"type:varchar(150)" json:"asset_name"`

	DepreciationAmount float64 `gorm:"type:decimal(18,2);default:0" json:"depreciation_amount"`

	AccumulatedDepreciationBefore float64 `gorm:"type:decimal(18,2);default:0" json:"accumulated_depreciation_before"`
	AccumulatedDepreciationAfter  float64 `gorm:"type:decimal(18,2);default:0" json:"accumulated_depreciation_after"`

	NetBookValueBefore float64 `gorm:"type:decimal(18,2);default:0" json:"net_book_value_before"`
	NetBookValueAfter  float64 `gorm:"type:decimal(18,2);default:0" json:"net_book_value_after"`

	DepreciationExpenseAccountID     uint64          `gorm:"not null" json:"depreciation_expense_account_id"`
	DepreciationExpenseAccount       *ChartOfAccount `gorm:"foreignKey:DepreciationExpenseAccountID" json:"depreciation_expense_account,omitempty"`
	AccumulatedDepreciationAccountID uint64          `gorm:"not null" json:"accumulated_depreciation_account_id"`
	AccumulatedDepreciationAccount   *ChartOfAccount `gorm:"foreignKey:AccumulatedDepreciationAccountID" json:"accumulated_depreciation_account,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
