package dto

import "time"

type CreateCustomerContactRequest struct {
	ContactName   string `json:"contact_name" binding:"required"`
	Designation   string `json:"designation"`
	ContactNumber string `json:"contact_number"`
	Email         string `json:"email" binding:"omitempty,email"`
	IsPrimary     bool   `json:"is_primary"`
	Status        string `json:"status" binding:"required"`
}

type UpdateCustomerContactRequest struct {
	ContactName   string `json:"contact_name" binding:"required"`
	Designation   string `json:"designation"`
	ContactNumber string `json:"contact_number"`
	Email         string `json:"email" binding:"omitempty,email"`
	IsPrimary     bool   `json:"is_primary"`
	Status        string `json:"status" binding:"required"`
}

type CustomerContactResponse struct {
	ID            uint64    `json:"id"`
	CustomerID    uint64    `json:"customer_id"`
	ContactName   string    `json:"contact_name"`
	Designation   string    `json:"designation"`
	ContactNumber string    `json:"contact_number"`
	Email         string    `json:"email"`
	IsPrimary     bool      `json:"is_primary"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
