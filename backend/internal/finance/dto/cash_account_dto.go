package dto

type CreateCashAccountRequest struct {
	BranchID              uint64  `json:"branch_id" binding:"required"`
	CashAccountName       string  `json:"cash_account_name" binding:"required"`
	ResponsibleUserID     *uint64 `json:"responsible_user_id"`
	OpeningBalance        float64 `json:"opening_balance"`
	OpeningBalanceDate    string  `json:"opening_balance_date"`
	LinkedLedgerAccountID *uint64 `json:"linked_ledger_account_id"`
	AutoCreateLedger      bool    `json:"auto_create_ledger"`
	Status                string  `json:"status" binding:"required"`
	Description           string  `json:"description"`
}

type UpdateCashAccountRequest struct {
	BranchID              uint64  `json:"branch_id" binding:"required"`
	CashAccountName       string  `json:"cash_account_name" binding:"required"`
	ResponsibleUserID     *uint64 `json:"responsible_user_id"`
	OpeningBalanceDate    string  `json:"opening_balance_date"`
	LinkedLedgerAccountID *uint64 `json:"linked_ledger_account_id"`
	AutoCreateLedger      bool    `json:"auto_create_ledger"`
	Status                string  `json:"status" binding:"required"`
	Description           string  `json:"description"`
}
