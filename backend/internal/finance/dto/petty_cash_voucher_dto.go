package dto

type PettyCashVoucherLineDTO struct {
	AccountID       uint64  `json:"account_id" binding:"required"`
	LineDescription string  `json:"line_description"`
	Amount          float64 `json:"amount" binding:"required,gt=0"`
}

type CreatePettyCashVoucherRequest struct {
	BranchID           uint64                    `json:"branch_id" binding:"required"`
	PettyCashFundID    uint64                    `json:"petty_cash_fund_id" binding:"required"`
	FinancialYearID    uint64                    `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64                    `json:"accounting_period_id" binding:"required"`
	VoucherDate        string                    `json:"voucher_date" binding:"required"`
	VoucherType        string                    `json:"voucher_type" binding:"required"` // expense, advance, refund, adjustment
	PayeeName          string                    `json:"payee_name"`
	ReferenceNumber    string                    `json:"reference_number"`
	Description        string                    `json:"description"`
	Lines              []PettyCashVoucherLineDTO `json:"lines" binding:"required,min=1"`
}

type UpdatePettyCashVoucherRequest struct {
	VoucherDate     string                    `json:"voucher_date" binding:"required"`
	VoucherType     string                    `json:"voucher_type" binding:"required"`
	PayeeName       string                    `json:"payee_name"`
	ReferenceNumber string                    `json:"reference_number"`
	Description     string                    `json:"description"`
	Lines           []PettyCashVoucherLineDTO `json:"lines" binding:"required,min=1"`
}

type ActionPettyCashVoucherRequest struct {
	Remarks string `json:"remarks"`
}
