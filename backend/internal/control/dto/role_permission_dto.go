package dto

type AssignRolePermissionsRequest struct {
	PermissionIDs []uint64 `json:"permission_ids" binding:"required"`
}

type RolePermissionItem struct {
	PermissionID   uint64 `json:"permission_id"`
	ID             uint64 `json:"id"`
	PermissionKey  string `json:"permission_key"`
	PermissionName string `json:"permission_name"`
	SoftwareName   string `json:"software_name,omitempty"`
	Assigned       bool   `json:"assigned"`
}

type RolePermissionGroup struct {
	PermissionGroup string               `json:"permission_group"`
	SoftwareName    string               `json:"software_name,omitempty"`
	Permissions     []RolePermissionItem `json:"permissions"`
}

type RoleReference struct {
	ID       uint64 `json:"id"`
	RoleName string `json:"role_name"`
	RoleCode string `json:"role_code"`
}

type SoftwareReference struct {
	ID           uint64 `json:"id"`
	SoftwareCode string `json:"software_code"`
	SoftwareName string `json:"software_name"`
}

type RolePermissionMatrixResponse struct {
	Role                  RoleReference         `json:"role"`
	Groups                []RolePermissionGroup `json:"groups"`
	Permissions           []RolePermissionItem  `json:"permissions"`
	AssignedPermissionIDs []uint64              `json:"assigned_permission_ids"`
}
