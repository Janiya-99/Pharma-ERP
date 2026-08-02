package dto

import "time"

type CreateFinancialYearRequest struct {
	YearName  string `json:"year_name" binding:"required"`
	StartDate string `json:"start_date" binding:"required"`
	EndDate   string `json:"end_date" binding:"required"`
	IsActive  *bool  `json:"is_active" binding:"required"`
	Status    string `json:"status" binding:"required"`
}

type UpdateFinancialYearRequest struct {
	YearName  string `json:"year_name" binding:"required"`
	StartDate string `json:"start_date" binding:"required"`
	EndDate   string `json:"end_date" binding:"required"`
	IsActive  *bool  `json:"is_active" binding:"required"`
	Status    string `json:"status" binding:"required"`
}

type FinancialYearResponse struct {
	ID        uint64    `json:"id"`
	CompanyID uint64    `json:"company_id"`
	YearName  string    `json:"year_name"`
	StartDate string    `json:"start_date"`
	EndDate   string    `json:"end_date"`
	IsActive  bool      `json:"is_active"`
	IsClosed  bool      `json:"is_closed"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
