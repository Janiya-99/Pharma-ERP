package dto

type CreateBankReconciliationRequest struct {
	BranchID                *uint64  `json:"branch_id"`
	BankAccountID           uint64   `json:"bank_account_id" binding:"required"`
	StatementStartDate      string   `json:"statement_start_date" binding:"required"`
	StatementEndDate        string   `json:"statement_end_date" binding:"required"`
	StatementOpeningBalance float64  `json:"statement_opening_balance"`
	StatementClosingBalance float64  `json:"statement_closing_balance"`
	Remarks                 string   `json:"remarks"`
	TransactionIDs          []uint64 `json:"transaction_ids"`
}

type UpdateBankReconciliationRequest struct {
	StatementStartDate      string   `json:"statement_start_date" binding:"required"`
	StatementEndDate        string   `json:"statement_end_date" binding:"required"`
	StatementOpeningBalance float64  `json:"statement_opening_balance"`
	StatementClosingBalance float64  `json:"statement_closing_balance"`
	Remarks                 string   `json:"remarks"`
	TransactionIDs          []uint64 `json:"transaction_ids"`
}

type CancelBankReconciliationRequest struct {
	Remarks string `json:"remarks" binding:"required"`
}
