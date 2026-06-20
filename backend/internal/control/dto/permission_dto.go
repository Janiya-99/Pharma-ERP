package dto

type PermissionResponse struct {
	ID              uint64 `json:"id"`
	SoftwareID      uint64 `json:"software_id"`
	SoftwareCode    string `json:"software_code"`
	PermissionGroup string `json:"permission_group"`
	PermissionKey   string `json:"permission_key"`
	PermissionName  string `json:"permission_name"`
	Description     string `json:"description"`
	Status          string `json:"status"`
}

type PermissionItem struct {
	ID             uint64 `json:"id"`
	PermissionKey  string `json:"permission_key"`
	PermissionName string `json:"permission_name"`
}

type PermissionGroupResponse struct {
	PermissionGroup string           `json:"permission_group"`
	Permissions     []PermissionItem `json:"permissions"`
}

type SoftwarePermissionsResponse struct {
	SoftwareCode string                    `json:"software_code"`
	Groups       []PermissionGroupResponse `json:"groups"`
}
