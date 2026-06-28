package dto

import "time"

type CreateCustomerCategoryRequest struct {
	CategoryCode string  `json:"category_code" binding:"required"`
	CategoryName string  `json:"category_name" binding:"required"`
	Description  string  `json:"description"`
	CreditLimit  float64 `json:"credit_limit" binding:"min=0"`
	CreditDays   int     `json:"credit_days" binding:"min=0"`
	Status       string  `json:"status" binding:"required"`
}

type UpdateCustomerCategoryRequest struct {
	CategoryCode string  `json:"category_code" binding:"required"`
	CategoryName string  `json:"category_name" binding:"required"`
	Description  string  `json:"description"`
	CreditLimit  float64 `json:"credit_limit" binding:"min=0"`
	CreditDays   int     `json:"credit_days" binding:"min=0"`
	Status       string  `json:"status" binding:"required"`
}

type CustomerCategoryResponse struct {
	ID            uint64    `json:"id"`
	CompanyID     uint64    `json:"company_id"`
	CategoryCode  string    `json:"category_code"`
	CategoryName  string    `json:"category_name"`
	Description   string    `json:"description"`
	CreditLimit   float64   `json:"credit_limit"`
	CreditDays    int       `json:"credit_days"`
	Status        string    `json:"status"`
	CreatedBy     *uint64   `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	CustomerCount int64     `json:"customer_count,omitempty"`
}
