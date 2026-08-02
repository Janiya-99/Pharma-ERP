package dto

type PreviewDepreciationRequest struct {
	BranchID             *uint64 `json:"branch_id"`
	FinancialYearID      uint64  `json:"financial_year_id" binding:"required"`
	AccountingPeriodID   uint64  `json:"accounting_period_id" binding:"required"`
	DepreciationFromDate string  `json:"depreciation_from_date" binding:"required"`
	DepreciationToDate   string  `json:"depreciation_to_date" binding:"required"`
}

type CreateDepreciationRunRequest struct {
	BranchID             *uint64 `json:"branch_id"`
	FinancialYearID      uint64  `json:"financial_year_id" binding:"required"`
	AccountingPeriodID   uint64  `json:"accounting_period_id" binding:"required"`
	RunDate              string  `json:"run_date" binding:"required"`
	DepreciationFromDate string  `json:"depreciation_from_date" binding:"required"`
	DepreciationToDate   string  `json:"depreciation_to_date" binding:"required"`
	Remarks              string  `json:"remarks"`
}
