package dto

type CreateRoleRequest struct {
	SoftwareID    uint64   `json:"software_id" binding:"required"`
	RoleName      string   `json:"role_name" binding:"required"`
	RoleCode      string   `json:"role_code" binding:"required"`
	Description   string   `json:"description"`
	Status        string   `json:"status" binding:"required,oneof=active inactive"`
	PermissionIDs []uint64 `json:"permission_ids"`
}

type UpdateRoleRequest struct {
	RoleName      string   `json:"role_name" binding:"required"`
	RoleCode      string   `json:"role_code" binding:"required"`
	Description   string   `json:"description"`
	Status        string   `json:"status" binding:"required,oneof=active inactive"`
	PermissionIDs []uint64 `json:"permission_ids"`
}

type RoleResponse struct {
	ID            uint64   `json:"id"`
	SoftwareID    uint64   `json:"software_id"`
	SoftwareCode  string   `json:"software_code"`
	SoftwareName  string   `json:"software_name"`
	RoleName      string   `json:"role_name"`
	RoleCode      string   `json:"role_code"`
	Description   string   `json:"description"`
	IsSystemRole  bool     `json:"is_system_role"`
	Status        string   `json:"status"`
	PermissionIDs []uint64 `json:"permission_ids,omitempty"`
}
