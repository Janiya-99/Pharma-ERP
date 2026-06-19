package request

type CreateCompanyRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=255"`
	Code    string `json:"code" binding:"required,min=2,max=50"`
	TaxID   string `json:"tax_id" binding:"omitempty,max=100"`
	Address string `json:"address" binding:"omitempty,max=500"`
	Phone   string `json:"phone" binding:"omitempty,max=50"`
	Email   string `json:"email" binding:"omitempty,email,max=255"`
}

type UpdateCompanyRequest struct {
	Name     string `json:"name" binding:"omitempty,min=2,max=255"`
	Code     string `json:"code" binding:"omitempty,min=2,max=50"`
	TaxID    string `json:"tax_id" binding:"omitempty,max=100"`
	Address  string `json:"address" binding:"omitempty,max=500"`
	Phone    string `json:"phone" binding:"omitempty,max=50"`
	Email    string `json:"email" binding:"omitempty,email,max=255"`
	IsActive *bool  `json:"is_active" binding:"omitempty"`
}
