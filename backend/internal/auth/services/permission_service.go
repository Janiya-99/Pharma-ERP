package services

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type PermissionService struct {
	db *gorm.DB
}

func NewPermissionService(db *gorm.DB) *PermissionService {
	return &PermissionService{db: db}
}

func (s *PermissionService) GetPermissionsForUserContext(userID, branchID uint64, softwareCode string) []string {
	// 1. Find active roles from user_branch_roles
	var matrix []models.UserBranchRole
	s.db.Preload("Role").Where("user_id = ? AND branch_id = ? AND status = ?", userID, branchID, "active").Find(&matrix)

	if len(matrix) == 0 {
		return []string{}
	}

	var roleIDs []uint64
	for _, m := range matrix {
		if m.Role.Status == "active" {
			if m.Role.RoleCode == "SUPER_ADMIN" {
				return []string{"*"}
			}
			roleIDs = append(roleIDs, m.RoleID)
		}
	}

	if len(roleIDs) == 0 {
		return []string{}
	}

	// 2. Fetch role permissions for all assigned active roles
	var rolePermissions []models.RolePermission
	s.db.Preload("Permission").
		Where("role_id IN ?", roleIDs).
		Find(&rolePermissions)

	permMap := make(map[string]bool)
	var permissions []string
	for _, rp := range rolePermissions {
		if rp.Permission.Status == "active" {
			if !permMap[rp.Permission.PermissionKey] {
				permMap[rp.Permission.PermissionKey] = true
				permissions = append(permissions, rp.Permission.PermissionKey)
			}
		}
	}

	// 3. Return unique permission_key list
	return permissions
}
