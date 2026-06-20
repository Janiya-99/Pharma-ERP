package dto

type UpdateCompanyProfileRequest struct {
	CompanyName        string `json:"company_name" binding:"required"`
	RegistrationNumber string `json:"registration_number"`
	TaxNumber          string `json:"tax_number"`
	Address            string `json:"address"`
	Phone              string `json:"phone"`
	Email              string `json:"email" binding:"omitempty,email"`
	LogoURL            string `json:"logo_url"`
}
