package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type FixedAssetCategory struct {
	ID        uint64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64                 `gorm:"not null;index:idx_fac_company_code,unique" json:"company_id"`
	Company   *companyModels.Company `gorm:"foreignKey:CompanyID;references:ID" json:"company,omitempty"`

	CategoryCode string `gorm:"type:varchar(50);not null;index:idx_fac_company_code,unique" json:"category_code"`
	CategoryName string `gorm:"type:varchar(150);not null" json:"category_name"`
	Description  string `gorm:"type:text" json:"description"`

	DefaultAssetAccountID                   uint64          `gorm:"not null" json:"default_asset_account_id"`
	DefaultAssetAccount                     *ChartOfAccount `gorm:"foreignKey:DefaultAssetAccountID" json:"default_asset_account,omitempty"`
	DefaultAccumulatedDepreciationAccountID uint64          `gorm:"not null" json:"default_accumulated_depreciation_account_id"`
	DefaultAccumulatedDepreciationAccount   *ChartOfAccount `gorm:"foreignKey:DefaultAccumulatedDepreciationAccountID" json:"default_accumulated_depreciation_account,omitempty"`
	DefaultDepreciationExpenseAccountID     uint64          `gorm:"not null" json:"default_depreciation_expense_account_id"`
	DefaultDepreciationExpenseAccount       *ChartOfAccount `gorm:"foreignKey:DefaultDepreciationExpenseAccountID" json:"default_depreciation_expense_account,omitempty"`
	DefaultGainOnDisposalAccountID          *uint64         `json:"default_gain_on_disposal_account_id"`
	DefaultGainOnDisposalAccount            *ChartOfAccount `gorm:"foreignKey:DefaultGainOnDisposalAccountID" json:"default_gain_on_disposal_account,omitempty"`
	DefaultLossOnDisposalAccountID          *uint64         `json:"default_loss_on_disposal_account_id"`
	DefaultLossOnDisposalAccount            *ChartOfAccount `gorm:"foreignKey:DefaultLossOnDisposalAccountID" json:"default_loss_on_disposal_account,omitempty"`

	DefaultUsefulLifeMonths   int    `gorm:"default:0" json:"default_useful_life_months"`
	DefaultDepreciationMethod string `gorm:"type:varchar(50);default:'straight_line'" json:"default_depreciation_method"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy     *uint64             `json:"created_by"`
	CreatedByUser *companyModels.User `gorm:"-;references:ID" json:"created_by_user,omitempty"`
	UpdatedBy     *uint64             `json:"updated_by"`
	UpdatedByUser *companyModels.User `gorm:"-;references:ID" json:"updated_by_user,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
