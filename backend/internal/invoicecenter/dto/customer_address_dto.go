package dto

import "time"

type CreateCustomerAddressRequest struct {
	AddressType  string `json:"address_type" binding:"required"`
	AddressLine1 string `json:"address_line_1"`
	AddressLine2 string `json:"address_line_2"`
	City         string `json:"city"`
	District     string `json:"district"`
	Province     string `json:"province"`
	PostalCode   string `json:"postal_code"`
	Country      string `json:"country"`
	IsDefault    bool   `json:"is_default"`
	Status       string `json:"status" binding:"required"`
}

type UpdateCustomerAddressRequest struct {
	AddressType  string `json:"address_type" binding:"required"`
	AddressLine1 string `json:"address_line_1"`
	AddressLine2 string `json:"address_line_2"`
	City         string `json:"city"`
	District     string `json:"district"`
	Province     string `json:"province"`
	PostalCode   string `json:"postal_code"`
	Country      string `json:"country"`
	IsDefault    bool   `json:"is_default"`
	Status       string `json:"status" binding:"required"`
}

type CustomerAddressResponse struct {
	ID           uint64    `json:"id"`
	CustomerID   uint64    `json:"customer_id"`
	AddressType  string    `json:"address_type"`
	AddressLine1 string    `json:"address_line_1"`
	AddressLine2 string    `json:"address_line_2"`
	City         string    `json:"city"`
	District     string    `json:"district"`
	Province     string    `json:"province"`
	PostalCode   string    `json:"postal_code"`
	Country      string    `json:"country"`
	IsDefault    bool      `json:"is_default"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
