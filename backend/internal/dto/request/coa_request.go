package request

// CreateAccountRequest is the DTO for POST /api/v1/finance/accounts
type CreateAccountRequest struct {
	CategoryID  uint64 `json:"category_id" binding:"required"`
	GLCode      string `json:"gl_code" binding:"required,min=1,max=30"`
	Name        string `json:"name" binding:"required,min=2,max=150"`
	IsCashBank  bool   `json:"is_cash_bank" binding:"omitempty"`
	ShowToPO    bool   `json:"show_to_po" binding:"omitempty"`
	InterBranch bool   `json:"inter_branch" binding:"omitempty"`
}

// UpdateAccountRequest is the DTO for PUT /api/v1/finance/accounts/:id
type UpdateAccountRequest struct {
	Name        string `json:"name" binding:"omitempty,min=2,max=150"`
	IsCashBank  *bool  `json:"is_cash_bank" binding:"omitempty"`
	ShowToPO    *bool  `json:"show_to_po" binding:"omitempty"`
	InterBranch *bool  `json:"inter_branch" binding:"omitempty"`
}
