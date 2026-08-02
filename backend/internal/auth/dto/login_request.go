package dto

type LoginRequest struct {
	CompanyCode string `json:"company_code"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required"`
}
