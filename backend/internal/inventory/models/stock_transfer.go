package models

import (
	"time"

	"gorm.io/gorm"
)

type StockTransfer struct {
	ID                 uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID          uint64         `gorm:"not null;index" json:"company_id"`
	BranchID           uint64         `gorm:"not null;index" json:"branch_id"`
	FromWarehouseID    uint64         `gorm:"not null;index" json:"from_warehouse_id"`
	ToWarehouseID      uint64         `gorm:"not null;index" json:"to_warehouse_id"`
	FinancialYearID    *uint64        `json:"financial_year_id"`
	AccountingPeriodID *uint64        `json:"accounting_period_id"`

	TransferNumber string    `gorm:"type:varchar(50);not null;uniqueIndex:idx_company_transfer_number" json:"transfer_number"`
	TransferDate   time.Time `gorm:"type:date;not null;index" json:"transfer_date"`

	ReferenceNumber string  `gorm:"type:varchar(100)" json:"reference_number"`
	Remarks         string  `gorm:"type:text" json:"remarks"`

	TotalQuantity   float64 `gorm:"type:decimal(18,3);default:0" json:"total_quantity"`
	TotalStockValue float64 `gorm:"type:decimal(18,2);default:0" json:"total_stock_value"`

	ApprovalStatus string     `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"`
	ApprovedBy     *uint64    `json:"approved_by"`
	ApprovedAt     *time.Time `json:"approved_at"`

	PostedStatus string     `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"`
	PostedBy     *uint64    `json:"posted_by"`
	PostedAt     *time.Time `json:"posted_at"`

	Status string `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy uint64         `json:"created_by"`
	UpdatedBy uint64         `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	FromWarehouse    *Warehouse              `gorm:"foreignKey:FromWarehouseID" json:"from_warehouse,omitempty"`
	ToWarehouse      *Warehouse              `gorm:"foreignKey:ToWarehouseID" json:"to_warehouse,omitempty"`
	Lines            []StockTransferLine     `gorm:"foreignKey:StockTransferID" json:"lines,omitempty"`
	Approvals        []StockTransferApproval `gorm:"foreignKey:StockTransferID" json:"approvals,omitempty"`
}
