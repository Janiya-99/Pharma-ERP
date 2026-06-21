package dto

type ReceiptVoucherLineRequest struct {
	AccountID       uint64  `json:"account_id" binding:"required"`
	LineDescription string  `json:"line_description"`
	Amount          float64 `json:"amount" binding:"required,gt=0"`
}

type CreateReceiptVoucherRequest struct {
	BranchID           uint64                      `json:"branch_id" binding:"required"`
	FinancialYearID    uint64                      `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                      `json:"accounting_period_id" binding:"required"`
	ReceiptDate        string                      `json:"receipt_date" binding:"required"`
	ReceiptType        string                      `json:"receipt_type" binding:"required,oneof=customer_receipt supplier_refund other_receipt"`
	ReceiptMethod      string                      `json:"receipt_method" binding:"required,oneof=cash bank_transfer cheque online_transfer card"`
	CustomerID         *uint64                     `json:"customer_id"`
	SupplierID         *uint64                     `json:"supplier_id"`
	ReceivedToAccountID uint64                     `json:"received_to_account_id" binding:"required"`
	ChequeNumber       string                      `json:"cheque_number"`
	ChequeDate         *string                     `json:"cheque_date"`
	ReferenceNumber    string                      `json:"reference_number"`
	Description        string                      `json:"description"`
	Lines              []ReceiptVoucherLineRequest `json:"lines" binding:"required,min=1"`
}

type UpdateReceiptVoucherRequest struct {
	BranchID           uint64                      `json:"branch_id" binding:"required"`
	FinancialYearID    uint64                      `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                      `json:"accounting_period_id" binding:"required"`
	ReceiptDate        string                      `json:"receipt_date" binding:"required"`
	ReceiptType        string                      `json:"receipt_type" binding:"required,oneof=customer_receipt supplier_refund other_receipt"`
	ReceiptMethod      string                      `json:"receipt_method" binding:"required,oneof=cash bank_transfer cheque online_transfer card"`
	CustomerID         *uint64                     `json:"customer_id"`
	SupplierID         *uint64                     `json:"supplier_id"`
	ReceivedToAccountID uint64                     `json:"received_to_account_id" binding:"required"`
	ChequeNumber       string                      `json:"cheque_number"`
	ChequeDate         *string                     `json:"cheque_date"`
	ReferenceNumber    string                      `json:"reference_number"`
	Description        string                      `json:"description"`
	Lines              []ReceiptVoucherLineRequest `json:"lines" binding:"required,min=1"`
}

type ReceiptActionRequest struct {
	Remarks string `json:"remarks"`
}
