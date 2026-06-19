package request

type CreateBranchRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=255"`
	Code    string `json:"code" binding:"required,min=2,max=50"`
	Address string `json:"address" binding:"omitempty,max=500"`
	Phone   string `json:"phone" binding:"omitempty,max=50"`
}

type UpdateBranchRequest struct {
	Name     string `json:"name" binding:"omitempty,min=2,max=255"`
	Code     string `json:"code" binding:"omitempty,min=2,max=50"`
	Address  string `json:"address" binding:"omitempty,max=500"`
	Phone    string `json:"phone" binding:"omitempty,max=50"`
	IsActive *bool  `json:"is_active" binding:"omitempty"`
}
