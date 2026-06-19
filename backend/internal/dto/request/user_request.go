package request

// CreateUserRequest is the DTO for POST /api/v1/users
type CreateUserRequest struct {
	Email         string   `json:"email" binding:"required,email"`
	Password      string   `json:"password" binding:"required,min=8,max=128"`
	FullName      string   `json:"full_name" binding:"required,min=2,max=255"`
	Phone         string   `json:"phone" binding:"omitempty,max=50"`
	BranchID      uint64   `json:"branch_id" binding:"required"`
	DesignationID *uint64  `json:"designation_id" binding:"omitempty"`
	RoleIDs       []uint64 `json:"role_ids" binding:"omitempty"`
}

// UpdateUserRequest is the DTO for PUT /api/v1/users/:id
type UpdateUserRequest struct {
	FullName      string   `json:"full_name" binding:"omitempty,min=2,max=255"`
	Phone         string   `json:"phone" binding:"omitempty,max=50"`
	BranchID      uint64   `json:"branch_id" binding:"omitempty"`
	DesignationID *uint64  `json:"designation_id" binding:"omitempty"`
	IsActive      *bool    `json:"is_active" binding:"omitempty"`
	RoleIDs       []uint64 `json:"role_ids" binding:"omitempty"`
}
