package dto

import "time"

type CreateOpeningBalanceRequest struct {
	BranchID        *uint64 `json:"branch_id"`
	FinancialYearID uint64  `json:"financial_year_id" binding:"required"`
	AccountID       uint64  `json:"account_id" binding:"required"`
	DebitAmount     float64 `json:"debit_amount"`
	CreditAmount    float64 `json:"credit_amount"`
	Remarks         string  `json:"remarks"`
	Status          string  `json:"status" binding:"required"`
}

type UpdateOpeningBalanceRequest struct {
	DebitAmount  float64 `json:"debit_amount"`
	CreditAmount float64 `json:"credit_amount"`
	Remarks      string  `json:"remarks"`
	Status       string  `json:"status" binding:"required"`
}

type OpeningBalanceResponse struct {
	ID              uint64                  `json:"id"`
	CompanyID       uint64                  `json:"company_id"`
	BranchID        *uint64                 `json:"branch_id"`
	FinancialYearID uint64                  `json:"financial_year_id"`
	AccountID       uint64                  `json:"account_id"`
	DebitAmount     float64                 `json:"debit_amount"`
	CreditAmount    float64                 `json:"credit_amount"`
	Remarks         string                  `json:"remarks"`
	Status          string                  `json:"status"`
	CreatedAt       time.Time               `json:"created_at"`
	FinancialYear   *FinancialYearResponse  `json:"financial_year,omitempty"`
	ChartOfAccount  *ChartOfAccountResponse `json:"account,omitempty"`
}
