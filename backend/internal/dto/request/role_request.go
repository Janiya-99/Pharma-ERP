package request

// CreateRoleRequest is the DTO for POST /api/v1/roles
type CreateRoleRequest struct {
	Name          string   `json:"name" binding:"required,min=2,max=100"`
	Slug          string   `json:"slug" binding:"required,min=2,max=100"`
	Description   string   `json:"description" binding:"omitempty,max=255"`
	PermissionIDs []uint64 `json:"permission_ids" binding:"omitempty"`
}

// UpdateRoleRequest is the DTO for PUT /api/v1/roles/:id
type UpdateRoleRequest struct {
	Name          string   `json:"name" binding:"omitempty,min=2,max=100"`
	Description   string   `json:"description" binding:"omitempty,max=255"`
	PermissionIDs []uint64 `json:"permission_ids" binding:"omitempty"`
}

// AssignRoleRequest is the DTO for POST /api/v1/users/:id/roles
type AssignRoleRequest struct {
	RoleIDs []uint64 `json:"role_ids" binding:"required,min=1"`
}
