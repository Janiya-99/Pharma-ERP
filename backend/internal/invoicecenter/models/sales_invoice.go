package models

import (
	"time"

	"gorm.io/gorm"
)

type SalesInvoice struct {
	ID                      uint64             `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID               uint64             `gorm:"not null;index:idx_company_invoice_number,unique" json:"company_id"`
	BranchID                uint64             `gorm:"not null;index" json:"branch_id"`
	CustomerID              uint64             `gorm:"not null;index" json:"customer_id"`
	SalesOrderID            *uint64            `gorm:"index" json:"sales_order_id"`
	WarehouseID             uint64             `gorm:"not null;index" json:"warehouse_id"`
	FinancialYearID         *uint64            `gorm:"index" json:"financial_year_id"`
	AccountingPeriodID      *uint64            `gorm:"index" json:"accounting_period_id"`
	InvoiceNumber           string             `gorm:"type:varchar(50);not null;index:idx_company_invoice_number,unique" json:"invoice_number"`
	InvoiceDate             time.Time          `gorm:"type:date;not null;index" json:"invoice_date"`
	DueDate                 *time.Time         `gorm:"type:date" json:"due_date"`
	CustomerReferenceNumber string             `gorm:"type:varchar(100)" json:"customer_reference_number"`
	Remarks                 string             `gorm:"type:text" json:"remarks"`
	SubtotalAmount          float64            `gorm:"type:decimal(18,2);default:0" json:"subtotal_amount"`
	DiscountAmount          float64            `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount               float64            `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	TotalAmount             float64            `gorm:"type:decimal(18,2);default:0" json:"total_amount"`
	PaidAmount              float64            `gorm:"type:decimal(18,2);default:0" json:"paid_amount"`
	BalanceAmount           float64            `gorm:"type:decimal(18,2);default:0" json:"balance_amount"`
	ApprovalStatus          string             `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"`
	ApprovedBy              *uint64            `json:"approved_by"`
	ApprovedAt              *time.Time         `json:"approved_at"`
	PostedStatus            string             `gorm:"type:varchar(30);default:'unposted';index" json:"posted_status"`
	PostedBy                *uint64            `json:"posted_by"`
	PostedAt                *time.Time         `json:"posted_at"`
	PaymentStatus           string             `gorm:"type:varchar(30);default:'unpaid';index" json:"payment_status"`
	Status                  string             `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy               *uint64            `json:"created_by"`
	UpdatedBy               *uint64            `json:"updated_by"`
	CreatedAt               time.Time          `json:"created_at"`
	UpdatedAt               time.Time          `json:"updated_at"`
	DeletedAt               gorm.DeletedAt     `gorm:"index" json:"-"`

	Customer                Customer           `gorm:"foreignKey:CustomerID" json:"customer"`
	SalesOrder              *SalesOrder        `gorm:"foreignKey:SalesOrderID" json:"sales_order,omitempty"`
	Lines                   []SalesInvoiceLine `gorm:"foreignKey:SalesInvoiceID" json:"lines,omitempty"`
}

func (SalesInvoice) TableName() string {
	return "sales_invoices"
}
