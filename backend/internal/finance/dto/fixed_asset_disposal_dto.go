package dto

type CreateFixedAssetDisposalRequest struct {
	BranchID                uint64  `json:"branch_id" binding:"required"`
	FixedAssetID            uint64  `json:"fixed_asset_id" binding:"required"`
	FinancialYearID         uint64  `json:"financial_year_id" binding:"required"`
	AccountingPeriodID      uint64  `json:"accounting_period_id" binding:"required"`
	DisposalDate            string  `json:"disposal_date" binding:"required"`
	DisposalType            string  `json:"disposal_type" binding:"required,oneof=sale write_off scrap lost damaged"`
	ProceedsAmount          float64 `json:"proceeds_amount" binding:"gte=0"`
	ReceivedToAccountID     *uint64 `json:"received_to_account_id"`
	GainOnDisposalAccountID *uint64 `json:"gain_on_disposal_account_id"`
	LossOnDisposalAccountID *uint64 `json:"loss_on_disposal_account_id"`
	Reason                  string  `json:"reason"`
}

type UpdateFixedAssetDisposalRequest struct {
	DisposalDate            string  `json:"disposal_date" binding:"required"`
	DisposalType            string  `json:"disposal_type" binding:"required,oneof=sale write_off scrap lost damaged"`
	ProceedsAmount          float64 `json:"proceeds_amount" binding:"gte=0"`
	ReceivedToAccountID     *uint64 `json:"received_to_account_id"`
	GainOnDisposalAccountID *uint64 `json:"gain_on_disposal_account_id"`
	LossOnDisposalAccountID *uint64 `json:"loss_on_disposal_account_id"`
	Reason                  string  `json:"reason"`
}

type ActionFixedAssetDisposalRequest struct {
	Remarks string `json:"remarks"`
}
