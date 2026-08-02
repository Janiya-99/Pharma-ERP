package dto

type CreateTaxSettingRequest struct {
	TaxCode      string  `json:"tax_code" binding:"required"`
	TaxName      string  `json:"tax_name" binding:"required"`
	TaxRate      float64 `json:"tax_rate" binding:"gte=0"`
	TaxAccountID *uint64 `json:"tax_account_id"`
	Description  string  `json:"description"`
	Status       string  `json:"status" binding:"required"`
}

type UpdateTaxSettingRequest struct {
	TaxCode      string  `json:"tax_code" binding:"required"`
	TaxName      string  `json:"tax_name" binding:"required"`
	TaxRate      float64 `json:"tax_rate" binding:"gte=0"`
	TaxAccountID *uint64 `json:"tax_account_id"`
	Description  string  `json:"description"`
	Status       string  `json:"status" binding:"required"`
}
