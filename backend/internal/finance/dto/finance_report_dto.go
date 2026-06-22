package dto

import "time"

// Account Ledger Report
type AccountLedgerReportRequest struct {
	AccountID          uint64     `form:"account_id" binding:"required"`
	BranchID           *uint64    `form:"branch_id"`
	DateFrom           *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo             *time.Time `form:"date_to" time_format:"2006-01-02"`
	FinancialYearID    *uint64    `form:"financial_year_id"`
	AccountingPeriodID *uint64    `form:"accounting_period_id"`
}

type AccountLedgerReportResponse struct {
	AccountDetails map[string]interface{}       `json:"account_details"`
	OpeningBalance float64                      `json:"opening_balance"`
	LedgerLines    []GeneralLedgerEntryResponse `json:"ledger_lines"`
	TotalDebit     float64                      `json:"total_debit"`
	TotalCredit    float64                      `json:"total_credit"`
	ClosingBalance float64                      `json:"closing_balance"`
}

// Trial Balance Report
type TrialBalanceReportRequest struct {
	FinancialYearID uint64     `form:"financial_year_id" binding:"required"`
	DateFrom        *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo          *time.Time `form:"date_to" time_format:"2006-01-02"`
	BranchID        *uint64    `form:"branch_id"`
}

type TrialBalanceLine struct {
	AccountCode   string  `json:"account_code"`
	AccountName   string  `json:"account_name"`
	OpeningDebit  float64 `json:"opening_debit"`
	OpeningCredit float64 `json:"opening_credit"`
	PeriodDebit   float64 `json:"period_debit"`
	PeriodCredit  float64 `json:"period_credit"`
	ClosingDebit  float64 `json:"closing_debit"`
	ClosingCredit float64 `json:"closing_credit"`
}

type TrialBalanceReportResponse struct {
	Lines              []TrialBalanceLine `json:"lines"`
	TotalOpeningDebit  float64            `json:"total_opening_debit"`
	TotalOpeningCredit float64            `json:"total_opening_credit"`
	TotalPeriodDebit   float64            `json:"total_period_debit"`
	TotalPeriodCredit  float64            `json:"total_period_credit"`
	TotalClosingDebit  float64            `json:"total_closing_debit"`
	TotalClosingCredit float64            `json:"total_closing_credit"`
}

// Profit and Loss Report
type ProfitLossReportRequest struct {
	FinancialYearID uint64     `form:"financial_year_id" binding:"required"`
	DateFrom        *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo          *time.Time `form:"date_to" time_format:"2006-01-02"`
	BranchID        *uint64    `form:"branch_id"`
}

type PLSection struct {
	Name  string             `json:"name"`
	Lines []TrialBalanceLine `json:"lines"`
	Total float64            `json:"total"`
}

type ProfitLossReportResponse struct {
	Revenue                PLSection `json:"revenue"`
	OtherIncome            PLSection `json:"other_income"`
	DirectExpenses         PLSection `json:"direct_expenses"`
	AdministrativeExpenses PLSection `json:"administrative_expenses"`
	SellingExpenses        PLSection `json:"selling_expenses"`
	FinanceExpenses        PLSection `json:"finance_expenses"`
	NetProfitLoss          float64   `json:"net_profit_loss"`
}

// Balance Sheet Report
type BalanceSheetReportRequest struct {
	FinancialYearID uint64     `form:"financial_year_id" binding:"required"`
	AsOfDate        *time.Time `form:"as_of_date" time_format:"2006-01-02"`
	BranchID        *uint64    `form:"branch_id"`
}

type BalanceSheetSection struct {
	Name  string             `json:"name"`
	Lines []TrialBalanceLine `json:"lines"`
	Total float64            `json:"total"`
}

type BalanceSheetReportResponse struct {
	Assets      BalanceSheetSection `json:"assets"`
	Liabilities BalanceSheetSection `json:"liabilities"`
	Equity      BalanceSheetSection `json:"equity"`
	NetIncome   float64             `json:"net_income"`
}

// Cash/Bank Book Report
type CashBankBookReportRequest struct {
	AccountID uint64     `form:"account_id" binding:"required"`
	BranchID  *uint64    `form:"branch_id"`
	DateFrom  *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo    *time.Time `form:"date_to" time_format:"2006-01-02"`
}

type CashBankBookReportResponse struct {
	AccountDetails map[string]interface{}       `json:"account_details"`
	OpeningBalance float64                      `json:"opening_balance"`
	Transactions   []GeneralLedgerEntryResponse `json:"transactions"`
	TotalReceipts  float64                      `json:"total_receipts"` // Deposits
	TotalPayments  float64                      `json:"total_payments"` // Withdrawals
	ClosingBalance float64                      `json:"closing_balance"`
}

// Day Book Report
type DayBookReportRequest struct {
	DateFrom   *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo     *time.Time `form:"date_to" time_format:"2006-01-02"`
	BranchID   *uint64    `form:"branch_id"`
	SourceType *string    `form:"source_type"`
}

type DayBookGroup struct {
	TransactionDate string                       `json:"transaction_date"`
	Entries         []GeneralLedgerEntryResponse `json:"entries"`
	TotalDebit      float64                      `json:"total_debit"`
	TotalCredit     float64                      `json:"total_credit"`
}

type DayBookReportResponse struct {
	Groups []DayBookGroup `json:"groups"`
}

// Registers Request
type RegisterReportRequest struct {
	FinancialYearID    *uint64    `form:"financial_year_id"`
	AccountingPeriodID *uint64    `form:"accounting_period_id"`
	ApprovalStatus     *string    `form:"approval_status"`
	PostedStatus       *string    `form:"posted_status"`
	DateFrom           *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo             *time.Time `form:"date_to" time_format:"2006-01-02"`
	Search             *string    `form:"search"`

	// Specific to Payment/Receipt
	PaymentType   *string `form:"payment_type"`
	PaymentMethod *string `form:"payment_method"`
	ReceiptType   *string `form:"receipt_type"`
	ReceiptMethod *string `form:"receipt_method"`
}
