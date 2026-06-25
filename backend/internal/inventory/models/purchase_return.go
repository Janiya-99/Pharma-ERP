package models

import (
	"time"

	"gorm.io/gorm"
)

type PurchaseReturn struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID          uint64  `gorm:"not null;index:idx_company_return_number,unique" json:"company_id"`
	BranchID           uint64  `gorm:"not null;index" json:"branch_id"`
	SupplierID         uint64  `gorm:"not null;index" json:"supplier_id"`
	WarehouseID        uint64  `gorm:"not null;index" json:"warehouse_id"`
	GoodsReceiptNoteID *uint64 `gorm:"index" json:"goods_receipt_note_id"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	ReturnNumber string    `gorm:"type:varchar(50);not null;index:idx_company_return_number,unique" json:"return_number"`
	ReturnDate   time.Time `gorm:"type:date;not null;index" json:"return_date"`

	ReferenceNumber string `gorm:"type:varchar(100)" json:"reference_number"`
	Remarks         string `gorm:"type:text" json:"remarks"`

	TotalQuantity float64 `gorm:"type:decimal(18,3);default:0" json:"total_quantity"`

	SubtotalAmount float64 `gorm:"type:decimal(18,2);default:0" json:"subtotal_amount"`
	TaxAmount      float64 `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	TotalAmount    float64 `gorm:"type:decimal(18,2);default:0" json:"total_amount"`

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

	Warehouse        Warehouse                `gorm:"foreignKey:WarehouseID" json:"warehouse"`
	Supplier         Supplier                 `gorm:"foreignKey:SupplierID" json:"supplier"`
	GoodsReceiptNote *GoodsReceiptNote        `gorm:"foreignKey:GoodsReceiptNoteID" json:"goods_receipt_note"`
	Lines            []PurchaseReturnLine     `gorm:"foreignKey:PurchaseReturnID" json:"lines"`
	Approvals        []PurchaseReturnApproval `gorm:"foreignKey:PurchaseReturnID" json:"approvals"`
}

func (PurchaseReturn) TableName() string {
	return "purchase_returns"
}
