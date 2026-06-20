package dto

type CreateBranchRequest struct {
	BranchCode   string `json:"branch_code" binding:"required"`
	BranchName   string `json:"branch_name" binding:"required"`
	BranchType   string `json:"branch_type"`
	Address      string `json:"address"`
	Phone        string `json:"phone"`
	Email        string `json:"email" binding:"omitempty,email"`
	IsMainBranch bool   `json:"is_main_branch"`
	Status       string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateBranchRequest struct {
	BranchCode   string `json:"branch_code" binding:"required"`
	BranchName   string `json:"branch_name" binding:"required"`
	BranchType   string `json:"branch_type"`
	Address      string `json:"address"`
	Phone        string `json:"phone"`
	Email        string `json:"email" binding:"omitempty,email"`
	IsMainBranch bool   `json:"is_main_branch"`
	Status       string `json:"status" binding:"required,oneof=active inactive"`
}
