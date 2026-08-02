package dto

type PaymentVoucherLineRequest struct {
	AccountID       uint64  `json:"account_id" binding:"required"`
	LineDescription string  `json:"line_description"`
	Amount          float64 `json:"amount" binding:"required,gt=0"`
}

type CreatePaymentVoucherRequest struct {
	BranchID           uint64                      `json:"branch_id" binding:"required"`
	FinancialYearID    uint64                      `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                      `json:"accounting_period_id" binding:"required"`
	PaymentDate        string                      `json:"payment_date" binding:"required"`
	PaymentType        string                      `json:"payment_type" binding:"required,oneof=supplier_payment supplier_advance_payment other_payment payment_return"`
	PaymentMethod      string                      `json:"payment_method" binding:"required,oneof=cash bank_transfer cheque online_transfer card"`
	SupplierID         *uint64                     `json:"supplier_id"`
	CustomerID         *uint64                     `json:"customer_id"`
	PaidFromAccountID  uint64                      `json:"paid_from_account_id" binding:"required"`
	ChequeNumber       string                      `json:"cheque_number"`
	ChequeDate         *string                     `json:"cheque_date"`
	ReferenceNumber    string                      `json:"reference_number"`
	Description        string                      `json:"description"`
	Lines              []PaymentVoucherLineRequest `json:"lines" binding:"required,min=1"`
}

type UpdatePaymentVoucherRequest struct {
	BranchID           uint64                      `json:"branch_id" binding:"required"`
	FinancialYearID    uint64                      `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                      `json:"accounting_period_id" binding:"required"`
	PaymentDate        string                      `json:"payment_date" binding:"required"`
	PaymentType        string                      `json:"payment_type" binding:"required,oneof=supplier_payment supplier_advance_payment other_payment payment_return"`
	PaymentMethod      string                      `json:"payment_method" binding:"required,oneof=cash bank_transfer cheque online_transfer card"`
	SupplierID         *uint64                     `json:"supplier_id"`
	CustomerID         *uint64                     `json:"customer_id"`
	PaidFromAccountID  uint64                      `json:"paid_from_account_id" binding:"required"`
	ChequeNumber       string                      `json:"cheque_number"`
	ChequeDate         *string                     `json:"cheque_date"`
	ReferenceNumber    string                      `json:"reference_number"`
	Description        string                      `json:"description"`
	Lines              []PaymentVoucherLineRequest `json:"lines" binding:"required,min=1"`
}

type PaymentActionRequest struct {
	Remarks string `json:"remarks"`
}
