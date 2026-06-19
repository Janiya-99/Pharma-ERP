package request

// LoginRequest is the DTO for POST /api/v1/auth/login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// RegisterRequest is the DTO for POST /api/v1/auth/register
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8,max=128"`
	FullName  string `json:"full_name" binding:"required,min=2,max=255"`
	Phone     string `json:"phone" binding:"omitempty,max=50"`
	CompanyID uint64 `json:"company_id" binding:"required"`
	BranchID  uint64 `json:"branch_id" binding:"required"`
}

// RefreshTokenRequest is the DTO for POST /api/v1/auth/refresh
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// ChangePasswordRequest is the DTO for PUT /api/v1/auth/password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required,min=8"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=128"`
}
