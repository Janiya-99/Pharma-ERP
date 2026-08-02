package models

import (
	"time"

	"gorm.io/gorm"
)

// GoodsReceiptNote stores the GRN document header
type GoodsReceiptNote struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID          uint64  `gorm:"not null;index:idx_company_grn_number,unique" json:"company_id"`
	BranchID           uint64  `gorm:"not null;index" json:"branch_id"`
	SupplierID         uint64  `gorm:"not null;index" json:"supplier_id"`
	WarehouseID        uint64  `gorm:"not null;index" json:"warehouse_id"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	GRNNumber string    `gorm:"type:varchar(50);not null;index:idx_company_grn_number,unique" json:"grn_number"`
	GRNDate   time.Time `gorm:"type:date;not null;index" json:"grn_date"`

	SupplierInvoiceNumber string     `gorm:"type:varchar(100)" json:"supplier_invoice_number"`
	SupplierInvoiceDate   *time.Time `gorm:"type:date" json:"supplier_invoice_date"`

	PurchaseOrderNumber string `gorm:"type:varchar(100)" json:"purchase_order_number"`
	ReferenceNumber     string `gorm:"type:varchar(100)" json:"reference_number"`

	Remarks string `gorm:"type:text" json:"remarks"`

	TotalQuantity      float64 `gorm:"type:decimal(18,3);default:0" json:"total_quantity"`
	TotalFreeQuantity  float64 `gorm:"type:decimal(18,3);default:0" json:"total_free_quantity"`
	TotalStockQuantity float64 `gorm:"type:decimal(18,3);default:0" json:"total_stock_quantity"`

	SubtotalAmount float64 `gorm:"type:decimal(18,2);default:0" json:"subtotal_amount"`
	DiscountAmount float64 `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
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

	Warehouse Warehouse                  `gorm:"foreignKey:WarehouseID" json:"warehouse"`
	Supplier  Supplier                   `gorm:"foreignKey:SupplierID" json:"supplier"`
	Lines     []GoodsReceiptNoteLine     `gorm:"foreignKey:GoodsReceiptNoteID" json:"lines"`
	Approvals []GoodsReceiptNoteApproval `gorm:"foreignKey:GoodsReceiptNoteID" json:"approvals"`
}

// TableName overrides the table name used by GORM
func (GoodsReceiptNote) TableName() string {
	return "goods_receipt_notes"
}
