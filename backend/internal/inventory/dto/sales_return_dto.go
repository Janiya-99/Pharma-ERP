package dto

import "time"

type CreateSalesReturnRequest struct {
	BranchID                 uint64                   `json:"branch_id" validate:"required"`
	WarehouseID              uint64                   `json:"warehouse_id" validate:"required"`
	FinancialYearID          *uint64                  `json:"financial_year_id"`
	AccountingPeriodID       *uint64                  `json:"accounting_period_id"`
	SalesReturnDate          string                   `json:"sales_return_date" validate:"required"`
	CustomerName             string                   `json:"customer_name"`
	CustomerContactNumber    string                   `json:"customer_contact_number"`
	SalesInvoiceNumber       string                   `json:"sales_invoice_number"`
	CustomerCreditNoteNumber string                   `json:"customer_credit_note_number"`
	ReferenceNumber          string                   `json:"reference_number"`
	ReturnReason             string                   `json:"return_reason" validate:"required"`
	ReturnCondition          string                   `json:"return_condition" validate:"required"`
	Remarks                  string                   `json:"remarks"`
	Lines                    []SalesReturnLineRequest `json:"lines" validate:"required,min=1"`
}

type UpdateSalesReturnRequest struct {
	SalesReturnDate          string                   `json:"sales_return_date" validate:"required"`
	CustomerName             string                   `json:"customer_name"`
	CustomerContactNumber    string                   `json:"customer_contact_number"`
	SalesInvoiceNumber       string                   `json:"sales_invoice_number"`
	CustomerCreditNoteNumber string                   `json:"customer_credit_note_number"`
	ReferenceNumber          string                   `json:"reference_number"`
	ReturnReason             string                   `json:"return_reason" validate:"required"`
	ReturnCondition          string                   `json:"return_condition" validate:"required"`
	Remarks                  string                   `json:"remarks"`
	Lines                    []SalesReturnLineRequest `json:"lines" validate:"required,min=1"`
}

type SalesReturnLineRequest struct {
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	ProductID           uint64  `json:"product_id" validate:"required"`
	ProductBatchID      *uint64 `json:"product_batch_id"`
	ReturnQuantity      float64 `json:"return_quantity" validate:"required,gt=0"`
	UnitPrice           float64 `json:"unit_price" validate:"gte=0"`
	DiscountAmount      float64 `json:"discount_amount" validate:"gte=0"`
	TaxAmount           float64 `json:"tax_amount" validate:"gte=0"`
	StockUnitCost       float64 `json:"stock_unit_cost" validate:"gte=0"`
	ReturnReason        string  `json:"return_reason"`
	ReturnCondition     string  `json:"return_condition"`
	LineRemarks         string  `json:"line_remarks"`
}

type SalesReturnActionRequest struct {
	Remarks string `json:"remarks"`
}

type SalesReturnFilter struct {
	BranchID           *uint64
	WarehouseID        *uint64
	FinancialYearID    *uint64
	AccountingPeriodID *uint64
	ApprovalStatus     *string
	PostedStatus       *string
	ReturnReason       *string
	ReturnCondition    *string
	DateFrom           *time.Time
	DateTo             *time.Time
	Search             string
	Page               int
	Limit              int
}
