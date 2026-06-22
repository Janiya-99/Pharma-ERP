package dto

type CreateSupplierRequest struct {
	SupplierCode          string  `json:"supplier_code" binding:"required"`
	SupplierName          string  `json:"supplier_name" binding:"required"`
	ContactPerson         string  `json:"contact_person"`
	ContactNumber         string  `json:"contact_number"`
	Email                 string  `json:"email"`
	Address               string  `json:"address"`
	TaxRegistrationNumber string  `json:"tax_registration_number"`
	PaymentTermsDays      int     `json:"payment_terms_days"`
	PayableAccountID      *uint64 `json:"payable_account_id"`
	Status                string  `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateSupplierRequest struct {
	SupplierCode          string  `json:"supplier_code" binding:"required"`
	SupplierName          string  `json:"supplier_name" binding:"required"`
	ContactPerson         string  `json:"contact_person"`
	ContactNumber         string  `json:"contact_number"`
	Email                 string  `json:"email"`
	Address               string  `json:"address"`
	TaxRegistrationNumber string  `json:"tax_registration_number"`
	PaymentTermsDays      int     `json:"payment_terms_days"`
	PayableAccountID      *uint64 `json:"payable_account_id"`
	Status                string  `json:"status" binding:"required,oneof=active inactive"`
}
