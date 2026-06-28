package dto

import "time"

type CustomerReceiptAllocationRequest struct {
	SalesInvoiceID  uint64  `json:"sales_invoice_id" binding:"required"`
	AllocatedAmount float64 `json:"allocated_amount" binding:"required,gt=0"`
	Remarks         string  `json:"remarks"`
}

type CreateCustomerReceiptRequest struct {
	BranchID             uint64                             `json:"branch_id" binding:"required"`
	CustomerID           uint64                             `json:"customer_id" binding:"required"`
	FinancialYearID      *uint64                            `json:"financial_year_id"`
	AccountingPeriodID   *uint64                            `json:"accounting_period_id"`
	ReceiptDate          string                             `json:"receipt_date" binding:"required"` // Format: YYYY-MM-DD
	PaymentMethod        string                             `json:"payment_method" binding:"required"`
	ReferenceNumber      string                             `json:"reference_number"`
	BankReferenceNumber  string                             `json:"bank_reference_number"`
	ChequeNumber         string                             `json:"cheque_number"`
	ChequeDate           *string                            `json:"cheque_date"`
	Remarks              string                             `json:"remarks"`
	ReceiptAmount        float64                            `json:"receipt_amount" binding:"required,gt=0"`
	Allocations          []CustomerReceiptAllocationRequest `json:"allocations"`
}

type UpdateCustomerReceiptRequest struct {
	ReceiptDate          string                             `json:"receipt_date" binding:"required"` // Format: YYYY-MM-DD
	PaymentMethod        string                             `json:"payment_method" binding:"required"`
	ReferenceNumber      string                             `json:"reference_number"`
	BankReferenceNumber  string                             `json:"bank_reference_number"`
	ChequeNumber         string                             `json:"cheque_number"`
	ChequeDate           *string                            `json:"cheque_date"`
	Remarks              string                             `json:"remarks"`
	ReceiptAmount        float64                            `json:"receipt_amount" binding:"required,gt=0"`
	Allocations          []CustomerReceiptAllocationRequest `json:"allocations"`
}

type CustomerReceiptActionRequest struct {
	Remarks string `json:"remarks"`
}

type CustomerReceiptResponse struct {
	ID                 uint64                              `json:"id"`
	ReceiptNumber      string                              `json:"receipt_number"`
	ReceiptDate        time.Time                           `json:"receipt_date"`
	BranchID           uint64                              `json:"branch_id"`
	CustomerID         uint64                              `json:"customer_id"`
	PaymentMethod      string                              `json:"payment_method"`
	ReferenceNumber    string                              `json:"reference_number"`
	BankReferenceNumber string                             `json:"bank_reference_number"`
	ChequeNumber       string                              `json:"cheque_number"`
	ReceiptAmount      float64                             `json:"receipt_amount"`
	AllocatedAmount    float64                             `json:"allocated_amount"`
	UnallocatedAmount  float64                             `json:"unallocated_amount"`
	ApprovalStatus     string                              `json:"approval_status"`
	PostedStatus       string                              `json:"posted_status"`
	ReceiptStatus      string                              `json:"receipt_status"`
	CreatedBy          *uint64                             `json:"created_by"`
	CreatedAt          time.Time                           `json:"created_at"`
	CustomerCode       string                              `json:"customer_code"`
	CustomerName       string                              `json:"customer_name"`
	BranchSummary      interface{}                         `json:"branch_summary,omitempty"`
	ActionsMetadata    map[string]bool                     `json:"actions_metadata,omitempty"`
}

type CustomerReceiptDetailResponse struct {
	CustomerReceiptResponse
	CustomerBalanceImpact interface{}                               `json:"customer_balance_impact,omitempty"`
	AllocationSummary     interface{}                               `json:"allocation_summary,omitempty"`
	Allocations           []CustomerReceiptAllocationDetailResponse `json:"allocations"`
	ApprovalHistory       []CustomerReceiptApprovalResponse         `json:"approval_history"`
}

type CustomerReceiptAllocationDetailResponse struct {
	ID                 uint64      `json:"id"`
	SalesInvoiceID     uint64      `json:"sales_invoice_id"`
	AllocatedAmount    float64     `json:"allocated_amount"`
	Remarks            string      `json:"remarks"`
	SalesInvoiceDetail interface{} `json:"sales_invoice_detail,omitempty"`
}

type CustomerReceiptApprovalResponse struct {
	Action   string    `json:"action"`
	Remarks  string    `json:"remarks"`
	ActionBy uint64    `json:"action_by"`
	ActionAt time.Time `json:"action_at"`
}
