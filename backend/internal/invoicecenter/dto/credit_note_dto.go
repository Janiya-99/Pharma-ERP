package dto

type CreditNoteLineReq struct {
	SalesInvoiceLineID *uint64 `json:"sales_invoice_line_id"`
	ProductID          *uint64 `json:"product_id"`
	Description        string  `json:"description"`
	Quantity           float64 `json:"quantity"`
	UnitPrice          float64 `json:"unit_price"`
	DiscountAmount     float64 `json:"discount_amount"`
	TaxAmount          float64 `json:"tax_amount"`
	LineOrder          int     `json:"line_order"`
}

type CreateCreditNoteReq struct {
	BranchID           uint64              `json:"branch_id" validate:"required"`
	CustomerID         uint64              `json:"customer_id" validate:"required"`
	SalesInvoiceID     *uint64             `json:"sales_invoice_id"`
	FinancialYearID    *uint64             `json:"financial_year_id"`
	AccountingPeriodID *uint64             `json:"accounting_period_id"`
	CreditNoteDate     string              `json:"credit_note_date" validate:"required"`
	CreditNoteType     string              `json:"credit_note_type" validate:"required"`
	ReferenceNumber    string              `json:"reference_number"`
	Reason             string              `json:"reason"`
	Remarks            string              `json:"remarks"`
	Lines              []CreditNoteLineReq `json:"lines" validate:"required,min=1,dive"`
}

type UpdateCreditNoteReq struct {
	BranchID           uint64              `json:"branch_id" validate:"required"`
	CustomerID         uint64              `json:"customer_id" validate:"required"`
	SalesInvoiceID     *uint64             `json:"sales_invoice_id"`
	FinancialYearID    *uint64             `json:"financial_year_id"`
	AccountingPeriodID *uint64             `json:"accounting_period_id"`
	CreditNoteDate     string              `json:"credit_note_date" validate:"required"`
	CreditNoteType     string              `json:"credit_note_type" validate:"required"`
	ReferenceNumber    string              `json:"reference_number"`
	Reason             string              `json:"reason"`
	Remarks            string              `json:"remarks"`
	Lines              []CreditNoteLineReq `json:"lines" validate:"required,min=1,dive"`
}

type ActionCreditNoteReq struct {
	Remarks string `json:"remarks"`
}
