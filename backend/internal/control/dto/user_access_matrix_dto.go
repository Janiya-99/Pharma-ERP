package dto

type AccessMatrixItem struct {
	BranchID uint64 `json:"branch_id" binding:"required"`
	RoleID   uint64 `json:"role_id" binding:"required"`
}

type AssignUserAccessMatrixRequest struct {
	Access []AccessMatrixItem `json:"access" binding:"required,min=1"`
}

type UserReference struct {
	ID    uint64 `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type AccessMatrixResponseItem struct {
	ID         uint64 `json:"id"`
	BranchID   uint64 `json:"branch_id"`
	BranchName string `json:"branch_name"`
	RoleID     uint64 `json:"role_id"`
	RoleName   string `json:"role_name"`
	Status     string `json:"status"`
}

type UserAccessMatrixResponse struct {
	User         UserReference              `json:"user"`
	AccessMatrix []AccessMatrixResponseItem `json:"access_matrix"`
}
