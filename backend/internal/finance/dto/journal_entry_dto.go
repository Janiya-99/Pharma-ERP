package dto

type JournalEntryLineDTO struct {
	AccountID       uint64  `json:"account_id" binding:"required"`
	LineDescription string  `json:"line_description"`
	DebitAmount     float64 `json:"debit_amount"`
	CreditAmount    float64 `json:"credit_amount"`
}

type CreateJournalEntryRequest struct {
	BranchID           uint64                `json:"branch_id" binding:"required"`
	FinancialYearID    uint64                `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                `json:"accounting_period_id" binding:"required"`
	JournalDate        string                `json:"journal_date" binding:"required"` // Format: YYYY-MM-DD
	ReferenceNumber    string                `json:"reference_number"`
	Description        string                `json:"description"`
	Lines              []JournalEntryLineDTO `json:"lines" binding:"required,min=2"`
}

type UpdateJournalEntryRequest struct {
	BranchID           uint64                `json:"branch_id" binding:"required"`
	FinancialYearID    uint64                `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                `json:"accounting_period_id" binding:"required"`
	JournalDate        string                `json:"journal_date" binding:"required"`
	ReferenceNumber    string                `json:"reference_number"`
	Description        string                `json:"description"`
	Lines              []JournalEntryLineDTO `json:"lines" binding:"required,min=2"`
}

type JournalActionRequest struct {
	Remarks string `json:"remarks"`
}

type ReverseJournalRequest struct {
	ReversalDate string `json:"reversal_date" binding:"required"`
	Reason       string `json:"reason" binding:"required"`
}
