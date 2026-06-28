package dto

import "time"

type CreateCustomerRequest struct {
	CustomerCategoryID         *uint64                        `json:"customer_category_id"`
	CustomerCode               string                         `json:"customer_code"`
	CustomerName               string                         `json:"customer_name" binding:"required"`
	CustomerType               string                         `json:"customer_type" binding:"required"`
	BusinessRegistrationNumber string                         `json:"business_registration_number"`
	TaxRegistrationNumber      string                         `json:"tax_registration_number"`
	PrimaryContactPerson       string                         `json:"primary_contact_person"`
	PrimaryContactNumber       string                         `json:"primary_contact_number"`
	PrimaryEmail               string                         `json:"primary_email" binding:"omitempty,email"`
	BillingAddress             string                         `json:"billing_address"`
	ShippingAddress            string                         `json:"shipping_address"`
	CreditLimit                float64                        `json:"credit_limit" binding:"min=0"`
	CreditDays                 int                            `json:"credit_days" binding:"min=0"`
	ReceivableAccountID        *uint64                        `json:"receivable_account_id"`
	Status                     string                         `json:"status" binding:"required"`
	Addresses                  []CreateCustomerAddressRequest `json:"addresses"`
	Contacts                   []CreateCustomerContactRequest `json:"contacts"`
}

type UpdateCustomerRequest struct {
	CustomerCategoryID         *uint64 `json:"customer_category_id"`
	CustomerCode               string  `json:"customer_code" binding:"required"`
	CustomerName               string  `json:"customer_name" binding:"required"`
	CustomerType               string  `json:"customer_type" binding:"required"`
	BusinessRegistrationNumber string  `json:"business_registration_number"`
	TaxRegistrationNumber      string  `json:"tax_registration_number"`
	PrimaryContactPerson       string  `json:"primary_contact_person"`
	PrimaryContactNumber       string  `json:"primary_contact_number"`
	PrimaryEmail               string  `json:"primary_email" binding:"omitempty,email"`
	BillingAddress             string  `json:"billing_address"`
	ShippingAddress            string  `json:"shipping_address"`
	CreditLimit                float64 `json:"credit_limit" binding:"min=0"`
	CreditDays                 int     `json:"credit_days" binding:"min=0"`
	ReceivableAccountID        *uint64 `json:"receivable_account_id"`
	Status                     string  `json:"status" binding:"required"`
}

type ChangeCustomerStatusRequest struct {
	Status  string `json:"status" binding:"required"`
	Remarks string `json:"remarks"`
}

type CustomerListItemResponse struct {
	ID                   uint64    `json:"id"`
	CompanyID            uint64    `json:"company_id"`
	CustomerCode         string    `json:"customer_code"`
	CustomerName         string    `json:"customer_name"`
	CustomerCategoryID   *uint64   `json:"customer_category_id"`
	CustomerCategoryName string    `json:"customer_category_name"`
	CustomerType         string    `json:"customer_type"`
	PrimaryContactPerson string    `json:"primary_contact_person"`
	PrimaryContactNumber string    `json:"primary_contact_number"`
	PrimaryEmail         string    `json:"primary_email"`
	CreditLimit          float64   `json:"credit_limit"`
	CreditDays           int       `json:"credit_days"`
	CurrentBalance       float64   `json:"current_balance"`
	CreditLimitExceeded  bool      `json:"credit_limit_exceeded"`
	Status               string    `json:"status"`
	CreatedBy            *uint64   `json:"created_by"`
	CreatedAt            time.Time `json:"created_at"`
}

type CreditSummary struct {
	CreditLimit         float64 `json:"credit_limit"`
	CreditDays          int     `json:"credit_days"`
	CurrentBalance      float64 `json:"current_balance"`
	AvailableCredit     float64 `json:"available_credit"`
	CreditLimitExceeded bool    `json:"credit_limit_exceeded"`
}

type InvoiceSummaryPlaceholder struct {
	TotalInvoices    int64      `json:"total_invoices"`
	UnpaidInvoices   int64      `json:"unpaid_invoices"`
	PaidInvoices     int64      `json:"paid_invoices"`
	LastInvoiceDate  *time.Time `json:"last_invoice_date"`
}

type CustomerDetailResponse struct {
	ID                         uint64                    `json:"id"`
	CompanyID                  uint64                    `json:"company_id"`
	CustomerCategoryID         *uint64                   `json:"customer_category_id"`
	CustomerCategory           *CustomerCategoryResponse `json:"customer_category,omitempty"`
	CustomerCode               string                    `json:"customer_code"`
	CustomerName               string                    `json:"customer_name"`
	CustomerType               string                    `json:"customer_type"`
	BusinessRegistrationNumber string                    `json:"business_registration_number"`
	TaxRegistrationNumber      string                    `json:"tax_registration_number"`
	PrimaryContactPerson       string                    `json:"primary_contact_person"`
	PrimaryContactNumber       string                    `json:"primary_contact_number"`
	PrimaryEmail               string                    `json:"primary_email"`
	BillingAddress             string                    `json:"billing_address"`
	ShippingAddress            string                    `json:"shipping_address"`
	ReceivableAccountID        *uint64                   `json:"receivable_account_id"`
	Status                     string                    `json:"status"`
	CreatedBy                  *uint64                   `json:"created_by"`
	UpdatedBy                  *uint64                   `json:"updated_by"`
	CreatedAt                  time.Time                 `json:"created_at"`
	UpdatedAt                  time.Time                 `json:"updated_at"`

	Addresses                  []CustomerAddressResponse `json:"addresses"`
	Contacts                   []CustomerContactResponse `json:"contacts"`
	CreditSummary              CreditSummary             `json:"credit_summary"`
	InvoiceSummary             InvoiceSummaryPlaceholder `json:"invoice_summary"`
}
