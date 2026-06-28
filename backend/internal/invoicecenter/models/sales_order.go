package models

import (
	"time"

	"gorm.io/gorm"
)

type SalesOrder struct {
	ID                      uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID               uint64         `gorm:"not null;index:idx_company_sales_order_number,unique" json:"company_id"`
	BranchID                uint64         `gorm:"not null;index" json:"branch_id"`
	CustomerID              uint64         `gorm:"not null;index" json:"customer_id"`
	FinancialYearID         *uint64        `gorm:"index" json:"financial_year_id"`
	AccountingPeriodID      *uint64        `gorm:"index" json:"accounting_period_id"`
	SalesOrderNumber        string         `gorm:"type:varchar(50);not null;index:idx_company_sales_order_number,unique" json:"sales_order_number"`
	SalesOrderDate          time.Time      `gorm:"type:date;not null;index" json:"sales_order_date"`
	ExpectedDeliveryDate    *time.Time     `gorm:"type:date" json:"expected_delivery_date"`
	CustomerReferenceNumber string         `gorm:"type:varchar(100)" json:"customer_reference_number"`
	Remarks                 string         `gorm:"type:text" json:"remarks"`
	SubtotalAmount          float64        `gorm:"type:decimal(18,2);default:0" json:"subtotal_amount"`
	DiscountAmount          float64        `gorm:"type:decimal(18,2);default:0" json:"discount_amount"`
	TaxAmount               float64        `gorm:"type:decimal(18,2);default:0" json:"tax_amount"`
	TotalAmount             float64        `gorm:"type:decimal(18,2);default:0" json:"total_amount"`
	ApprovalStatus          string         `gorm:"type:varchar(30);default:'draft';index" json:"approval_status"`
	OrderStatus             string         `gorm:"type:varchar(30);default:'open';index" json:"order_status"`
	Status                  string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	ApprovedBy              *uint64        `json:"approved_by"`
	ApprovedAt              *time.Time     `json:"approved_at"`
	ClosedBy                *uint64        `json:"closed_by"`
	ClosedAt                *time.Time     `json:"closed_at"`
	CancelledBy             *uint64        `json:"cancelled_by"`
	CancelledAt             *time.Time     `json:"cancelled_at"`
	CreatedBy               *uint64        `json:"created_by"`
	UpdatedBy               *uint64        `json:"updated_by"`
	CreatedAt               time.Time      `json:"created_at"`
	UpdatedAt               time.Time      `json:"updated_at"`
	DeletedAt               gorm.DeletedAt `gorm:"index" json:"-"`

	Customer  Customer             `gorm:"foreignKey:CustomerID" json:"customer"`
	Lines     []SalesOrderLine     `gorm:"foreignKey:SalesOrderID" json:"lines,omitempty"`
	Approvals []SalesOrderApproval `gorm:"foreignKey:SalesOrderID" json:"approvals,omitempty"`
}

func (SalesOrder) TableName() string {
	return "sales_orders"
}
