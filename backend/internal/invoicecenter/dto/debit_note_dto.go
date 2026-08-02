package dto

type DebitNoteLineReq struct {
	SalesInvoiceLineID *uint64 `json:"sales_invoice_line_id"`
	ProductID          *uint64 `json:"product_id"`
	Description        string  `json:"description"`
	Quantity           float64 `json:"quantity" validate:"min=0"`
	UnitPrice          float64 `json:"unit_price" validate:"min=0"`
	DiscountAmount     float64 `json:"discount_amount" validate:"min=0"`
	TaxAmount          float64 `json:"tax_amount" validate:"min=0"`
	LineOrder          int     `json:"line_order"`
}

type CreateDebitNoteReq struct {
	BranchID           uint64             `json:"branch_id" validate:"required"`
	CustomerID         uint64             `json:"customer_id" validate:"required"`
	SalesInvoiceID     *uint64            `json:"sales_invoice_id"`
	FinancialYearID    *uint64            `json:"financial_year_id"`
	AccountingPeriodID *uint64            `json:"accounting_period_id"`
	DebitNoteDate      string             `json:"debit_note_date" validate:"required"`
	DebitNoteType      string             `json:"debit_note_type" validate:"required"`
	ReferenceNumber    string             `json:"reference_number"`
	Reason             string             `json:"reason"`
	Remarks            string             `json:"remarks"`
	Lines              []DebitNoteLineReq `json:"lines" validate:"required,min=1,dive"`
}

type UpdateDebitNoteReq struct {
	BranchID           uint64             `json:"branch_id" validate:"required"`
	CustomerID         uint64             `json:"customer_id" validate:"required"`
	SalesInvoiceID     *uint64            `json:"sales_invoice_id"`
	FinancialYearID    *uint64            `json:"financial_year_id"`
	AccountingPeriodID *uint64            `json:"accounting_period_id"`
	DebitNoteDate      string             `json:"debit_note_date" validate:"required"`
	DebitNoteType      string             `json:"debit_note_type" validate:"required"`
	ReferenceNumber    string             `json:"reference_number"`
	Reason             string             `json:"reason"`
	Remarks            string             `json:"remarks"`
	Lines              []DebitNoteLineReq `json:"lines" validate:"required,min=1,dive"`
}

type ActionDebitNoteReq struct {
	Remarks string `json:"remarks"`
}
