package dto

import "time"

type CreateAccountingPeriodRequest struct {
	FinancialYearID uint64 `json:"financial_year_id" binding:"required"`
	PeriodName      string `json:"period_name" binding:"required"`
	StartDate       string `json:"start_date" binding:"required"`
	EndDate         string `json:"end_date" binding:"required"`
	Status          string `json:"status" binding:"required"`
}

type UpdateAccountingPeriodRequest struct {
	PeriodName string `json:"period_name" binding:"required"`
	StartDate  string `json:"start_date" binding:"required"`
	EndDate    string `json:"end_date" binding:"required"`
	Status     string `json:"status" binding:"required"`
}

type AccountingPeriodResponse struct {
	ID              uint64                 `json:"id"`
	CompanyID       uint64                 `json:"company_id"`
	FinancialYearID uint64                 `json:"financial_year_id"`
	PeriodName      string                 `json:"period_name"`
	StartDate       string                 `json:"start_date"`
	EndDate         string                 `json:"end_date"`
	IsClosed        bool                   `json:"is_closed"`
	Status          string                 `json:"status"`
	CreatedAt       time.Time              `json:"created_at"`
	FinancialYear   *FinancialYearResponse `json:"financial_year,omitempty"`
}
