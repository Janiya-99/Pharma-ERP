package dto

import "time"

type GetLedgerEntriesRequest struct {
	FinancialYearID     *uint64    `form:"financial_year_id"`
	AccountingPeriodID  *uint64    `form:"accounting_period_id"`
	BranchID            *uint64    `form:"branch_id"`
	AccountID           *uint64    `form:"account_id"`
	SourceType          *string    `form:"source_type"`
	TransactionDateFrom *time.Time `form:"transaction_date_from" time_format:"2006-01-02"`
	TransactionDateTo   *time.Time `form:"transaction_date_to" time_format:"2006-01-02"`
	Search              *string    `form:"search"`
	Page                int        `form:"page" binding:"omitempty,min=1"`
	Limit               int        `form:"limit" binding:"omitempty,min=1,max=100"`
}

type GeneralLedgerEntryResponse struct {
	ID              uint64  `json:"id"`
	TransactionDate string  `json:"transaction_date"`
	SourceType      string  `json:"source_type"`
	SourceNumber    string  `json:"source_number"`
	AccountCode     string  `json:"account_code"`
	AccountName     string  `json:"account_name"`
	Description     string  `json:"description"`
	DebitAmount     float64 `json:"debit_amount"`
	CreditAmount    float64 `json:"credit_amount"`
	RunningBalance  float64 `json:"running_balance"`
}

type RebuildLedgerRequest struct {
	FinancialYearID uint64 `json:"financial_year_id" binding:"required"`
}
