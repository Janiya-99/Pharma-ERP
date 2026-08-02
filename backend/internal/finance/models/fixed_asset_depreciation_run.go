package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type FixedAssetDepreciationRun struct {
	ID        uint64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64                 `gorm:"not null;index:idx_fadr_company_run,unique" json:"company_id"`
	Company   *companyModels.Company `gorm:"foreignKey:CompanyID;references:ID" json:"company,omitempty"`
	BranchID  *uint64                `gorm:"index" json:"branch_id"`
	Branch    *companyModels.Branch  `gorm:"foreignKey:BranchID;references:ID" json:"branch,omitempty"`

	FinancialYearID uint64         `gorm:"not null;index" json:"financial_year_id"`
	FinancialYear   *FinancialYear `gorm:"foreignKey:FinancialYearID;references:ID" json:"financial_year,omitempty"`

	AccountingPeriodID uint64            `gorm:"not null;index" json:"accounting_period_id"`
	AccountingPeriod   *AccountingPeriod `gorm:"foreignKey:AccountingPeriodID;references:ID" json:"accounting_period,omitempty"`

	RunNumber string     `gorm:"type:varchar(50);not null;index:idx_fadr_company_run,unique" json:"run_number"`
	RunDate   *time.Time `gorm:"type:date;not null" json:"run_date"`

	DepreciationFromDate *time.Time `gorm:"type:date;not null" json:"depreciation_from_date"`
	DepreciationToDate   *time.Time `gorm:"type:date;not null" json:"depreciation_to_date"`

	TotalDepreciationAmount float64 `gorm:"type:decimal(18,2);default:0" json:"total_depreciation_amount"`

	PostedStatus string              `gorm:"type:varchar(30);default:'draft';index" json:"posted_status"` // draft, posted, cancelled
	PostedBy     *uint64             `json:"posted_by"`
	PostedByUser *companyModels.User `gorm:"-;references:ID" json:"posted_by_user,omitempty"`
	PostedAt     *time.Time          `json:"posted_at"`

	Remarks string `gorm:"type:text" json:"remarks"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy     *uint64             `json:"created_by"`
	CreatedByUser *companyModels.User `gorm:"-;references:ID" json:"created_by_user,omitempty"`
	UpdatedBy     *uint64             `json:"updated_by"`
	UpdatedByUser *companyModels.User `gorm:"-;references:ID" json:"updated_by_user,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Lines []FixedAssetDepreciationLine `gorm:"foreignKey:FixedAssetDepreciationRunID" json:"lines,omitempty"`
}
