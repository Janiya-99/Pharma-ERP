package dto

import "time"

type CreateSalesOrderLineRequest struct {
	ProductID      uint64  `json:"product_id" binding:"required"`
	ProductBatchID *uint64 `json:"product_batch_id"`
	Quantity       float64 `json:"quantity" binding:"required,gt=0"`
	UnitPrice      float64 `json:"unit_price" binding:"min=0"`
	DiscountAmount float64 `json:"discount_amount" binding:"min=0"`
	TaxAmount      float64 `json:"tax_amount" binding:"min=0"`
	LineRemarks    string  `json:"line_remarks"`
}

type CreateSalesOrderRequest struct {
	BranchID                uint64                        `json:"branch_id" binding:"required"`
	CustomerID              uint64                        `json:"customer_id" binding:"required"`
	FinancialYearID         *uint64                       `json:"financial_year_id"`
	AccountingPeriodID      *uint64                       `json:"accounting_period_id"`
	SalesOrderDate          string                        `json:"sales_order_date" binding:"required"`
	ExpectedDeliveryDate    string                        `json:"expected_delivery_date"`
	CustomerReferenceNumber string                        `json:"customer_reference_number"`
	Remarks                 string                        `json:"remarks"`
	Lines                   []CreateSalesOrderLineRequest `json:"lines" binding:"required,min=1"`
}

type ActionSalesOrderRequest struct {
	Remarks string `json:"remarks"`
}

type SalesOrderListItemResponse struct {
	ID                      uint64                 `json:"id"`
	SalesOrderNumber        string                 `json:"sales_order_number"`
	SalesOrderDate          string                 `json:"sales_order_date"`
	ExpectedDeliveryDate    *string                `json:"expected_delivery_date,omitempty"`
	Branch                  map[string]interface{} `json:"branch"`
	CustomerCode            string                 `json:"customer_code"`
	CustomerName            string                 `json:"customer_name"`
	CustomerReferenceNumber string                 `json:"customer_reference_number"`
	SubtotalAmount          float64                `json:"subtotal_amount"`
	DiscountAmount          float64                `json:"discount_amount"`
	TaxAmount               float64                `json:"tax_amount"`
	TotalAmount             float64                `json:"total_amount"`
	ApprovalStatus          string                 `json:"approval_status"`
	OrderStatus             string                 `json:"order_status"`
	CreatedBy               *uint64                `json:"created_by"`
	CreatedAt               time.Time              `json:"created_at"`
	ActionsMetadata         map[string]bool        `json:"actions_metadata"`
}

type SalesOrderLineResponse struct {
	ID               uint64                 `json:"id"`
	ProductID        uint64                 `json:"product_id"`
	Product          map[string]interface{} `json:"product"`
	ProductBatchID   *uint64                `json:"product_batch_id"`
	Batch            map[string]interface{} `json:"batch,omitempty"`
	Quantity         float64                `json:"quantity"`
	InvoicedQuantity float64                `json:"invoiced_quantity"`
	PendingQuantity  float64                `json:"pending_quantity"`
	UnitPrice        float64                `json:"unit_price"`
	DiscountAmount   float64                `json:"discount_amount"`
	TaxAmount        float64                `json:"tax_amount"`
	LineTotal        float64                `json:"line_total"`
	LineRemarks      string                 `json:"line_remarks"`
}

type InvoicingSummaryPlaceholder struct {
	TotalInvoicedAmount float64 `json:"total_invoiced_amount"`
	TotalPendingAmount  float64 `json:"total_pending_amount"`
	InvoiceCount        int64   `json:"invoice_count"`
}

type SalesOrderApprovalResponse struct {
	ID       uint64    `json:"id"`
	Action   string    `json:"action"`
	Remarks  string    `json:"remarks"`
	ActionBy uint64    `json:"action_by"`
	ActionAt time.Time `json:"action_at"`
}

type SalesOrderDetailResponse struct {
	ID                      uint64                       `json:"id"`
	CompanyID               uint64                       `json:"company_id"`
	BranchID                uint64                       `json:"branch_id"`
	Branch                  map[string]interface{}       `json:"branch"`
	CustomerID              uint64                       `json:"customer_id"`
	Customer                map[string]interface{}       `json:"customer"`
	FinancialYearID         *uint64                      `json:"financial_year_id"`
	FinancialYear           map[string]interface{}       `json:"financial_year,omitempty"`
	AccountingPeriodID      *uint64                      `json:"accounting_period_id"`
	AccountingPeriod        map[string]interface{}       `json:"accounting_period,omitempty"`
	SalesOrderNumber        string                       `json:"sales_order_number"`
	SalesOrderDate          string                       `json:"sales_order_date"`
	ExpectedDeliveryDate    *string                      `json:"expected_delivery_date,omitempty"`
	CustomerReferenceNumber string                       `json:"customer_reference_number"`
	Remarks                 string                       `json:"remarks"`
	SubtotalAmount          float64                      `json:"subtotal_amount"`
	DiscountAmount          float64                      `json:"discount_amount"`
	TaxAmount               float64                      `json:"tax_amount"`
	TotalAmount             float64                      `json:"total_amount"`
	ApprovalStatus          string                       `json:"approval_status"`
	OrderStatus             string                       `json:"order_status"`
	Status                  string                       `json:"status"`
	CreatedBy               *uint64                      `json:"created_by"`
	UpdatedBy               *uint64                      `json:"updated_by"`
	CreatedAt               time.Time                    `json:"created_at"`
	UpdatedAt               time.Time                    `json:"updated_at"`
	Lines                   []SalesOrderLineResponse     `json:"lines"`
	Approvals               []SalesOrderApprovalResponse `json:"approvals"`
	InvoicingSummary        InvoicingSummaryPlaceholder  `json:"invoicing_summary"`
	ActionsMetadata         map[string]bool              `json:"actions_metadata"`
}
