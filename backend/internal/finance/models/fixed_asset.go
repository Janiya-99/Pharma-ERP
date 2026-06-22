package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type FixedAsset struct {
	ID        uint64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64                 `gorm:"not null;index:idx_fa_company_code,unique" json:"company_id"`
	Company   *companyModels.Company `gorm:"foreignKey:CompanyID;references:ID" json:"company,omitempty"`
	BranchID  uint64                 `gorm:"not null;index" json:"branch_id"`
	Branch    *companyModels.Branch  `gorm:"foreignKey:BranchID;references:ID" json:"branch,omitempty"`

	FixedAssetCategoryID uint64              `gorm:"not null;index" json:"fixed_asset_category_id"`
	FixedAssetCategory   *FixedAssetCategory `gorm:"foreignKey:FixedAssetCategoryID" json:"fixed_asset_category,omitempty"`

	AssetCode   string `gorm:"type:varchar(50);not null;index:idx_fa_company_code,unique" json:"asset_code"`
	AssetName   string `gorm:"type:varchar(150);not null" json:"asset_name"`
	Description string `gorm:"type:text" json:"description"`

	SerialNumber string `gorm:"type:varchar(100)" json:"serial_number"`
	ModelNumber  string `gorm:"type:varchar(100)" json:"model_number"`
	Manufacturer string `gorm:"type:varchar(150)" json:"manufacturer"`

	PurchaseDate    *time.Time `gorm:"type:date;not null" json:"purchase_date"`
	AcquisitionDate *time.Time `gorm:"type:date;not null" json:"acquisition_date"`
	SupplierName    string     `gorm:"type:varchar(150)" json:"supplier_name"`
	InvoiceNumber   string     `gorm:"type:varchar(100)" json:"invoice_number"`

	AcquisitionCost   float64 `gorm:"type:decimal(18,2);not null;default:0" json:"acquisition_cost"`
	ResidualValue     float64 `gorm:"type:decimal(18,2);default:0" json:"residual_value"`
	DepreciableAmount float64 `gorm:"type:decimal(18,2);default:0" json:"depreciable_amount"`

	UsefulLifeMonths   int    `gorm:"not null;default:0" json:"useful_life_months"`
	DepreciationMethod string `gorm:"type:varchar(50);default:'straight_line'" json:"depreciation_method"`

	DepreciationStartDate *time.Time `gorm:"type:date;not null" json:"depreciation_start_date"`

	AssetAccountID                   uint64          `gorm:"not null" json:"asset_account_id"`
	AssetAccount                     *ChartOfAccount `gorm:"foreignKey:AssetAccountID" json:"asset_account,omitempty"`
	AccumulatedDepreciationAccountID uint64          `gorm:"not null" json:"accumulated_depreciation_account_id"`
	AccumulatedDepreciationAccount   *ChartOfAccount `gorm:"foreignKey:AccumulatedDepreciationAccountID" json:"accumulated_depreciation_account,omitempty"`
	DepreciationExpenseAccountID     uint64          `gorm:"not null" json:"depreciation_expense_account_id"`
	DepreciationExpenseAccount       *ChartOfAccount `gorm:"foreignKey:DepreciationExpenseAccountID" json:"depreciation_expense_account,omitempty"`
	GainOnDisposalAccountID          *uint64         `json:"gain_on_disposal_account_id"`
	GainOnDisposalAccount            *ChartOfAccount `gorm:"foreignKey:GainOnDisposalAccountID" json:"gain_on_disposal_account,omitempty"`
	LossOnDisposalAccountID          *uint64         `json:"loss_on_disposal_account_id"`
	LossOnDisposalAccount            *ChartOfAccount `gorm:"foreignKey:LossOnDisposalAccountID" json:"loss_on_disposal_account,omitempty"`

	AccumulatedDepreciation float64 `gorm:"type:decimal(18,2);default:0" json:"accumulated_depreciation"`
	NetBookValue            float64 `gorm:"type:decimal(18,2);default:0" json:"net_book_value"`

	LastDepreciationDate *time.Time `gorm:"type:date" json:"last_depreciation_date"`

	AssetStatus string `gorm:"type:varchar(30);default:'active';index" json:"asset_status"` // active, fully_depreciated, disposed, written_off, inactive
	Status      string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy     *uint64             `json:"created_by"`
	CreatedByUser *companyModels.User `gorm:"-;references:ID" json:"created_by_user,omitempty"`
	UpdatedBy     *uint64             `json:"updated_by"`
	UpdatedByUser *companyModels.User `gorm:"-;references:ID" json:"updated_by_user,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
