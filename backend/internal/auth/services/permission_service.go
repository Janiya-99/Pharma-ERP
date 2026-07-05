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
	// 1. Find active software module by software_code
	var software models.SoftwareModule
	if err := s.db.Where("software_code = ? AND status = ?", softwareCode, "active").First(&software).Error; err != nil {
		return []string{}
	}

	// 2. Find active roles from user_branch_software_roles
	var matrix []models.UserBranchRole
	s.db.Where("user_id = ? AND branch_id = ? AND status = ?", userID, branchID, "active").Find(&matrix)

	if len(matrix) == 0 {
		return []string{}
	}

	var roleIDs []uint64
	for _, m := range matrix {
		if m.Role.Status == "active" {
			roleIDs = append(roleIDs, m.RoleID)
		}
	}

	if len(roleIDs) == 0 {
		return []string{}
	}

	// 3. Join roles -> role_permissions -> permissions -> software_modules
	var rolePermissions []models.RolePermission
	s.db.Preload("Permission.Software").
		Joins("JOIN permissions p ON p.id = role_permissions.permission_id").
		Joins("JOIN software_modules sm ON sm.id = p.software_id").
		Where("role_permissions.role_id IN ? AND sm.software_code = ?", roleIDs, softwareCode).
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

	// 4. Return unique permission_key list
	return permissions
}
