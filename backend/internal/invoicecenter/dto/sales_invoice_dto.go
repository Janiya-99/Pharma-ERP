package dto

import "time"

type CreateSalesInvoiceLineRequest struct {
	SalesOrderLineID    *uint64 `json:"sales_order_line_id"`
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	ProductID           uint64  `json:"product_id" binding:"required"`
	ProductBatchID      *uint64 `json:"product_batch_id"`
	Quantity            float64 `json:"quantity" binding:"required,gt=0"`
	UnitPrice           float64 `json:"unit_price" binding:"min=0"`
	DiscountAmount      float64 `json:"discount_amount" binding:"min=0"`
	TaxAmount           float64 `json:"tax_amount" binding:"min=0"`
	LineRemarks         string  `json:"line_remarks"`
}

type CreateSalesInvoiceRequest struct {
	BranchID                uint64                          `json:"branch_id" binding:"required"`
	CustomerID              uint64                          `json:"customer_id" binding:"required"`
	SalesOrderID            *uint64                         `json:"sales_order_id"`
	WarehouseID             uint64                          `json:"warehouse_id" binding:"required"`
	FinancialYearID         *uint64                         `json:"financial_year_id"`
	AccountingPeriodID      *uint64                         `json:"accounting_period_id"`
	InvoiceDate             string                          `json:"invoice_date" binding:"required"`
	DueDate                 string                          `json:"due_date"`
	CustomerReferenceNumber string                          `json:"customer_reference_number"`
	Remarks                 string                          `json:"remarks"`
	Lines                   []CreateSalesInvoiceLineRequest `json:"lines" binding:"required,min=1"`
}

type ActionSalesInvoiceRequest struct {
	Remarks string `json:"remarks"`
}

type SalesInvoiceListItemResponse struct {
	ID                      uint64                 `json:"id"`
	InvoiceNumber           string                 `json:"invoice_number"`
	InvoiceDate             string                 `json:"invoice_date"`
	DueDate                 *string                `json:"due_date,omitempty"`
	Branch                  map[string]interface{} `json:"branch"`
	CustomerCode            string                 `json:"customer_code"`
	CustomerName            string                 `json:"customer_name"`
	SalesOrder              map[string]interface{} `json:"sales_order,omitempty"`
	Warehouse               map[string]interface{} `json:"warehouse"`
	CustomerReferenceNumber string                 `json:"customer_reference_number"`
	SubtotalAmount          float64                `json:"subtotal_amount"`
	DiscountAmount          float64                `json:"discount_amount"`
	TaxAmount               float64                `json:"tax_amount"`
	TotalAmount             float64                `json:"total_amount"`
	PaidAmount              float64                `json:"paid_amount"`
	BalanceAmount           float64                `json:"balance_amount"`
	ApprovalStatus          string                 `json:"approval_status"`
	PostedStatus            string                 `json:"posted_status"`
	PaymentStatus           string                 `json:"payment_status"`
	CreatedBy               *uint64                `json:"created_by"`
	CreatedAt               time.Time              `json:"created_at"`
	ActionsMetadata         map[string]bool        `json:"actions_metadata"`
}

type SalesInvoiceLineResponse struct {
	ID                  uint64                 `json:"id"`
	SalesOrderLineID    *uint64                `json:"sales_order_line_id"`
	WarehouseLocationID *uint64                `json:"warehouse_location_id"`
	WarehouseLocation   map[string]interface{} `json:"warehouse_location,omitempty"`
	ProductID           uint64                 `json:"product_id"`
	Product             map[string]interface{} `json:"product"`
	ProductBatchID      *uint64                `json:"product_batch_id"`
	Batch               map[string]interface{} `json:"batch,omitempty"`
	Quantity            float64                `json:"quantity"`
	UnitPrice           float64                `json:"unit_price"`
	DiscountAmount      float64                `json:"discount_amount"`
	TaxAmount           float64                `json:"tax_amount"`
	LineTotal           float64                `json:"line_total"`
	StockUnitCost       float64                `json:"stock_unit_cost"`
	StockTotalCost      float64                `json:"stock_total_cost"`
	LineRemarks         string                 `json:"line_remarks"`
}

type SalesInvoiceApprovalResponse struct {
	ID       uint64    `json:"id"`
	Action   string    `json:"action"`
	Remarks  string    `json:"remarks"`
	ActionBy uint64    `json:"action_by"`
	ActionAt time.Time `json:"action_at"`
}

type SalesInvoiceDetailResponse struct {
	ID                      uint64                         `json:"id"`
	CompanyID               uint64                         `json:"company_id"`
	BranchID                uint64                         `json:"branch_id"`
	Branch                  map[string]interface{}         `json:"branch"`
	CustomerID              uint64                         `json:"customer_id"`
	Customer                map[string]interface{}         `json:"customer"`
	SalesOrderID            *uint64                        `json:"sales_order_id"`
	SalesOrder              map[string]interface{}         `json:"sales_order,omitempty"`
	WarehouseID             uint64                         `json:"warehouse_id"`
	Warehouse               map[string]interface{}         `json:"warehouse"`
	FinancialYearID         *uint64                        `json:"financial_year_id"`
	FinancialYear           map[string]interface{}         `json:"financial_year,omitempty"`
	AccountingPeriodID      *uint64                        `json:"accounting_period_id"`
	AccountingPeriod        map[string]interface{}         `json:"accounting_period,omitempty"`
	InvoiceNumber           string                         `json:"invoice_number"`
	InvoiceDate             string                         `json:"invoice_date"`
	DueDate                 *string                        `json:"due_date,omitempty"`
	CustomerReferenceNumber string                         `json:"customer_reference_number"`
	Remarks                 string                         `json:"remarks"`
	SubtotalAmount          float64                        `json:"subtotal_amount"`
	DiscountAmount          float64                        `json:"discount_amount"`
	TaxAmount               float64                        `json:"tax_amount"`
	TotalAmount             float64                        `json:"total_amount"`
	PaidAmount              float64                        `json:"paid_amount"`
	BalanceAmount           float64                        `json:"balance_amount"`
	ApprovalStatus          string                         `json:"approval_status"`
	PostedStatus            string                         `json:"posted_status"`
	PaymentStatus           string                         `json:"payment_status"`
	Status                  string                         `json:"status"`
	ApprovedBy              *uint64                        `json:"approved_by"`
	ApprovedAt              *time.Time                     `json:"approved_at"`
	PostedBy                *uint64                        `json:"posted_by"`
	PostedAt                *time.Time                     `json:"posted_at"`
	CancelledBy             *uint64                        `json:"cancelled_by"`
	CancelledAt             *time.Time                     `json:"cancelled_at"`
	CancelReason            string                         `json:"cancel_reason"`
	CreatedBy               *uint64                        `json:"created_by"`
	UpdatedBy               *uint64                        `json:"updated_by"`
	CreatedAt               time.Time                      `json:"created_at"`
	UpdatedAt               time.Time                      `json:"updated_at"`
	Lines                   []SalesInvoiceLineResponse     `json:"lines"`
	Approvals               []SalesInvoiceApprovalResponse `json:"approvals"`
	StockPostingSummary     map[string]interface{}         `json:"stock_posting_summary"`
	PaymentSummary          map[string]interface{}         `json:"payment_summary"`
	ActionsMetadata         map[string]bool                `json:"actions_metadata"`
}
