package dto

type CreateBankAccountRequest struct {
	BranchID       *uint64 `json:"branch_id"`
	ChartAccountID uint64  `json:"chart_account_id" binding:"required"`
	BankName       string  `json:"bank_name" binding:"required"`
	BankBranchName string  `json:"bank_branch_name"`
	AccountName    string  `json:"account_name" binding:"required"`
	AccountNumber  string  `json:"account_number" binding:"required"`
	SwiftCode      string  `json:"swift_code"`
	BankCode       string  `json:"bank_code"`
	BranchCode     string  `json:"branch_code"`
	OpeningBalance float64 `json:"opening_balance"`
	IsDefault      bool    `json:"is_default"`
	Status         string  `json:"status"`
}

type UpdateBankAccountRequest struct {
	BranchID       *uint64 `json:"branch_id"`
	ChartAccountID uint64  `json:"chart_account_id" binding:"required"`
	BankName       string  `json:"bank_name" binding:"required"`
	BankBranchName string  `json:"bank_branch_name"`
	AccountName    string  `json:"account_name" binding:"required"`
	AccountNumber  string  `json:"account_number" binding:"required"`
	SwiftCode      string  `json:"swift_code"`
	BankCode       string  `json:"bank_code"`
	BranchCode     string  `json:"branch_code"`
	IsDefault      bool    `json:"is_default"`
	Status         string  `json:"status"`
}
