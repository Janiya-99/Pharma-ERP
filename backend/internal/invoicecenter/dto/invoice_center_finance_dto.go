package dto

import "time"

type SaveFinanceSettingsRequest struct {
	BranchID                      *uint64 `json:"branch_id"`
	AccountsReceivableAccountID   uint64  `json:"accounts_receivable_account_id" validate:"required"`
	SalesRevenueAccountID         uint64  `json:"sales_revenue_account_id" validate:"required"`
	SalesDiscountAccountID        *uint64 `json:"sales_discount_account_id"`
	OutputTaxAccountID            *uint64 `json:"output_tax_account_id"`
	CreditNoteAdjustmentAccountID uint64  `json:"credit_note_adjustment_account_id" validate:"required"`
	DebitNoteIncomeAccountID      uint64  `json:"debit_note_income_account_id" validate:"required"`
	CashAccountID                 *uint64 `json:"cash_account_id"`
	BankTransferAccountID         *uint64 `json:"bank_transfer_account_id"`
	ChequeClearingAccountID       *uint64 `json:"cheque_clearing_account_id"`
	CardClearingAccountID         *uint64 `json:"card_clearing_account_id"`
	OnlinePaymentAccountID        *uint64 `json:"online_payment_account_id"`
	OtherReceiptAccountID         *uint64 `json:"other_receipt_account_id"`
	CustomerAdvanceAccountID      *uint64 `json:"customer_advance_account_id"`
}

type FinanceSettingsResponse struct {
	ID                            uint64  `json:"id"`
	BranchID                      *uint64 `json:"branch_id"`
	AccountsReceivableAccountID   uint64  `json:"accounts_receivable_account_id"`
	SalesRevenueAccountID         uint64  `json:"sales_revenue_account_id"`
	SalesDiscountAccountID        *uint64 `json:"sales_discount_account_id"`
	OutputTaxAccountID            *uint64 `json:"output_tax_account_id"`
	CreditNoteAdjustmentAccountID uint64  `json:"credit_note_adjustment_account_id"`
	DebitNoteIncomeAccountID      uint64  `json:"debit_note_income_account_id"`
	CashAccountID                 *uint64 `json:"cash_account_id"`
	BankTransferAccountID         *uint64 `json:"bank_transfer_account_id"`
	ChequeClearingAccountID       *uint64 `json:"cheque_clearing_account_id"`
	CardClearingAccountID         *uint64 `json:"card_clearing_account_id"`
	OnlinePaymentAccountID        *uint64 `json:"online_payment_account_id"`
	OtherReceiptAccountID         *uint64 `json:"other_receipt_account_id"`
	CustomerAdvanceAccountID      *uint64 `json:"customer_advance_account_id"`
}

type GetPendingFinancePostingsRequest struct {
	BranchID     *uint64 `query:"branch_id"`
	DocumentType *string `query:"document_type"`
	DateFrom     *string `query:"date_from"`
	DateTo       *string `query:"date_to"`
	Page         int     `query:"page"`
	Limit        int     `query:"limit"`
}

type PendingFinancePostingResponse struct {
	DocumentType        string  `json:"document_type"`
	DocumentID          uint64  `json:"document_id"`
	DocumentNumber      string  `json:"document_number"`
	DocumentDate        string  `json:"document_date"`
	BranchID            uint64  `json:"branch_id"`
	BranchName          string  `json:"branch_name"`
	CustomerID          uint64  `json:"customer_id"`
	CustomerName        string  `json:"customer_name"`
	TotalAmount         float64 `json:"total_amount"`
	ApprovalStatus      string  `json:"approval_status"`
	OperationalStatus   string  `json:"operational_posted_status"`
	FinancePostStatus   string  `json:"finance_post_status"`
	CreatedBy           uint64  `json:"created_by"`
	CreatedAt           string  `json:"created_at"`
}

type GetFinancePostingHistoryRequest struct {
	BranchID       *uint64 `query:"branch_id"`
	DocumentType   *string `query:"document_type"`
	DocumentNumber *string `query:"document_number"`
	DateFrom       *string `query:"date_from"`
	DateTo         *string `query:"date_to"`
	Page           int     `query:"page"`
	Limit          int     `query:"limit"`
}

type FinancePostingHistoryResponse struct {
	ID                     uint64    `json:"id"`
	DocumentType           string    `json:"document_type"`
	DocumentNumber         string    `json:"document_number"`
	FinanceReferenceNumber string    `json:"finance_reference_number"`
	DebitTotal             float64   `json:"debit_total"`
	CreditTotal            float64   `json:"credit_total"`
	PostedBy               uint64    `json:"posted_by"`
	PostedAt               time.Time `json:"posted_at"`
	Remarks                *string   `json:"remarks"`
}

type PostToFinanceResponse struct {
	FinanceReferenceNumber string  `json:"finance_reference_number"`
	DebitTotal             float64 `json:"debit_total"`
	CreditTotal            float64 `json:"credit_total"`
}
