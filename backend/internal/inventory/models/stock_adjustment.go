package models

import (
	"time"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type StockAdjustment struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64                 `gorm:"index;not null" json:"company_id"`
	Company   *companyModels.Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	BranchID  uint64                 `gorm:"index;not null" json:"branch_id"`
	Branch    *companyModels.Branch  `gorm:"foreignKey:BranchID" json:"branch,omitempty"`

	WarehouseID uint64     `gorm:"index;not null" json:"warehouse_id"`
	Warehouse   *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`

	FinancialYearID    *uint64                        `gorm:"index" json:"financial_year_id,omitempty"`
	AccountingPeriodID *uint64                        `gorm:"index" json:"accounting_period_id,omitempty"`

	AdjustmentNumber string    `gorm:"type:varchar(50);uniqueIndex:idx_company_adjustment_no;not null" json:"adjustment_number"`
	AdjustmentDate   time.Time `gorm:"type:date;index;not null" json:"adjustment_date"`

	AdjustmentType string `gorm:"type:varchar(50);index;not null" json:"adjustment_type"` // positive, negative, mixed, physical_count, damage, expiry, correction

	ReferenceNumber string `gorm:"type:varchar(100)" json:"reference_number"`
	Reason          string `gorm:"type:text" json:"reason"`
	Remarks         string `gorm:"type:text" json:"remarks"`

	TotalQuantityIn  float64 `gorm:"type:decimal(18,3);default:0" json:"total_quantity_in"`
	TotalQuantityOut float64 `gorm:"type:decimal(18,3);default:0" json:"total_quantity_out"`
	TotalStockValue  float64 `gorm:"type:decimal(18,2);default:0" json:"total_stock_value"`

	ApprovalStatus string `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"` // draft, pending, approved, rejected, cancelled
	ApprovedBy     *uint64 `gorm:"index" json:"approved_by,omitempty"`
	ApprovedByUser *companyModels.User `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	ApprovedAt     *time.Time `json:"approved_at,omitempty"`

	PostedStatus   string `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"` // unposted, posted
	PostedBy       *uint64 `gorm:"index" json:"posted_by,omitempty"`
	PostedByUser   *companyModels.User `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	PostedAt       *time.Time `json:"posted_at,omitempty"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Lines            []StockAdjustmentLine       `gorm:"foreignKey:StockAdjustmentID" json:"lines,omitempty"`
	ApprovalHistory  []StockAdjustmentApproval   `gorm:"foreignKey:StockAdjustmentID" json:"approval_history,omitempty"`
}
