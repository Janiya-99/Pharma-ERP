package models

import (
	"time"

	"gorm.io/gorm"
)

type SalesReturn struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID          uint64  `gorm:"not null;index:idx_company_sales_return_number,unique" json:"company_id"`
	BranchID           uint64  `gorm:"not null;index" json:"branch_id"`
	WarehouseID        uint64  `gorm:"not null;index" json:"warehouse_id"`
	CustomerID         *uint64 `gorm:"index" json:"customer_id"`
	SalesInvoiceID     *uint64 `gorm:"index" json:"sales_invoice_id"`
	CreditNoteID       *uint64 `gorm:"index" json:"credit_note_id"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	SalesReturnNumber string    `gorm:"type:varchar(50);not null;index:idx_company_sales_return_number,unique" json:"sales_return_number"`
	SalesReturnDate   time.Time `gorm:"type:date;not null;index" json:"sales_return_date"`

	CustomerName             string `gorm:"type:varchar(255)" json:"customer_name"`
	CustomerContactNumber    string `gorm:"type:varchar(50)" json:"customer_contact_number"`
	SalesInvoiceNumber       string `gorm:"type:varchar(100)" json:"sales_invoice_number"`
	CustomerCreditNoteNumber string `gorm:"type:varchar(100)" json:"customer_credit_note_number"`
	ReferenceNumber          string `gorm:"type:varchar(100)" json:"reference_number"`

	ReturnReason    string `gorm:"type:varchar(100)" json:"return_reason"`
	ReturnCondition string `gorm:"type:varchar(50)" json:"return_condition"`

	Remarks string `gorm:"type:text" json:"remarks"`

	TotalQuantity  float64 `gorm:"type:decimal(18,3);default:0" json:"total_quantity"`
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

	Warehouse Warehouse             `gorm:"foreignKey:WarehouseID" json:"warehouse"`
	Lines     []SalesReturnLine     `gorm:"foreignKey:SalesReturnID" json:"lines"`
	Approvals []SalesReturnApproval `gorm:"foreignKey:SalesReturnID" json:"approvals"`
}

func (SalesReturn) TableName() string {
	return "sales_returns"
}
