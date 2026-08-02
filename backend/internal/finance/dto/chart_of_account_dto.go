package dto

import "time"

type CreateChartOfAccountRequest struct {
	BranchID                *uint64 `json:"branch_id"`
	AccountCode             string  `json:"account_code" binding:"required"`
	AccountName             string  `json:"account_name" binding:"required"`
	AccountClassificationID uint64  `json:"account_classification_id" binding:"required"`
	ParentAccountID         *uint64 `json:"parent_account_id"`
	AccountLevel            int     `json:"account_level"`
	AccountType             string  `json:"account_type"`
	NormalBalance           string  `json:"normal_balance"`
	IsControlAccount        bool    `json:"is_control_account"`
	IsBankAccount           bool    `json:"is_bank_account"`
	IsCashAccount           bool    `json:"is_cash_account"`
	OpeningBalance          float64 `json:"opening_balance"`
	Status                  string  `json:"status" binding:"required"`
}

type UpdateChartOfAccountRequest struct {
	BranchID                *uint64 `json:"branch_id"`
	AccountCode             string  `json:"account_code" binding:"required"`
	AccountName             string  `json:"account_name" binding:"required"`
	AccountClassificationID uint64  `json:"account_classification_id" binding:"required"`
	ParentAccountID         *uint64 `json:"parent_account_id"`
	AccountLevel            int     `json:"account_level"`
	AccountType             string  `json:"account_type"`
	NormalBalance           string  `json:"normal_balance"`
	IsControlAccount        bool    `json:"is_control_account"`
	IsBankAccount           bool    `json:"is_bank_account"`
	IsCashAccount           bool    `json:"is_cash_account"`
	Status                  string  `json:"status" binding:"required"`
}

type ChartOfAccountResponse struct {
	ID                      uint64                         `json:"id"`
	CompanyID               uint64                         `json:"company_id"`
	BranchID                *uint64                        `json:"branch_id"`
	AccountCode             string                         `json:"account_code"`
	AccountName             string                         `json:"account_name"`
	AccountClassificationID uint64                         `json:"account_classification_id"`
	ParentAccountID         *uint64                        `json:"parent_account_id"`
	AccountLevel            int                            `json:"account_level"`
	AccountType             string                         `json:"account_type"`
	NormalBalance           string                         `json:"normal_balance"`
	IsControlAccount        bool                           `json:"is_control_account"`
	IsBankAccount           bool                           `json:"is_bank_account"`
	IsCashAccount           bool                           `json:"is_cash_account"`
	OpeningBalance          float64                        `json:"opening_balance"`
	CurrentBalance          float64                        `json:"current_balance"`
	Status                  string                         `json:"status"`
	CreatedAt               time.Time                      `json:"created_at"`
	Classification          *AccountClassificationResponse `json:"classification,omitempty"`
}
