package dto

type CreatePettyCashFundRequest struct {
	BranchID        uint64  `json:"branch_id" binding:"required"`
	FundName        string  `json:"fund_name" binding:"required"`
	FundCode        string  `json:"fund_code" binding:"required"`
	ChartAccountID  uint64  `json:"chart_account_id" binding:"required"`
	CustodianUserID *uint64 `json:"custodian_user_id"`
	OpeningBalance  float64 `json:"opening_balance"`
	FundLimit       float64 `json:"fund_limit"`
	Status          string  `json:"status" binding:"required"`
}

type UpdatePettyCashFundRequest struct {
	FundName        string  `json:"fund_name" binding:"required"`
	FundCode        string  `json:"fund_code" binding:"required"`
	ChartAccountID  uint64  `json:"chart_account_id" binding:"required"`
	CustodianUserID *uint64 `json:"custodian_user_id"`
	FundLimit       float64 `json:"fund_limit"`
	Status          string  `json:"status" binding:"required"`
}
