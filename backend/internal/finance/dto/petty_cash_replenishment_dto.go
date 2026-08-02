package dto

type CreatePettyCashReplenishmentRequest struct {
	BranchID           uint64  `json:"branch_id" binding:"required"`
	PettyCashFundID    uint64  `json:"petty_cash_fund_id" binding:"required"`
	FinancialYearID    uint64  `json:"financial_year_id" binding:"required"`
	AccountingPeriodID uint64  `json:"accounting_period_id" binding:"required"`
	ReplenishmentDate  string  `json:"replenishment_date" binding:"required"`
	PaidFromAccountID  uint64  `json:"paid_from_account_id" binding:"required"`
	ReferenceNumber    string  `json:"reference_number"`
	Description        string  `json:"description"`
	Amount             float64 `json:"amount" binding:"required,gt=0"`
}

type UpdatePettyCashReplenishmentRequest struct {
	ReplenishmentDate string  `json:"replenishment_date" binding:"required"`
	PaidFromAccountID uint64  `json:"paid_from_account_id" binding:"required"`
	ReferenceNumber   string  `json:"reference_number"`
	Description       string  `json:"description"`
	Amount            float64 `json:"amount" binding:"required,gt=0"`
}

type ActionPettyCashReplenishmentRequest struct {
	Remarks string `json:"remarks"`
}
