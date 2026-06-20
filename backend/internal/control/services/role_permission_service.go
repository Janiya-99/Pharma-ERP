package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type RolePermissionService struct {
	repo           *repositories.RolePermissionRepository
	roleRepo       *repositories.RoleRepository
	permissionRepo *repositories.PermissionRepository
	auditService   *AuditService
}

func NewRolePermissionService(repo *repositories.RolePermissionRepository, roleRepo *repositories.RoleRepository, permissionRepo *repositories.PermissionRepository, auditService *AuditService) *RolePermissionService {
	return &RolePermissionService{
		repo:           repo,
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
		auditService:   auditService,
	}
}

func (s *RolePermissionService) GetRolePermissionMatrix(roleID uint64) (*dto.RolePermissionMatrixResponse, error) {
	role, err := s.roleRepo.FindRoleByID(roleID)
	if err != nil {
		return nil, errors.New("role not found")
	}

	// Get all permissions for this role's software
	allSoftwarePermissions, err := s.permissionRepo.FindPermissionsGrouped("", role.Software.SoftwareCode)
	if err != nil {
		return nil, err
	}

	// Get current assigned permissions
	rolePermissions, err := s.repo.FindRolePermissions(roleID)
	if err != nil {
		return nil, err
	}

	assignedMap := make(map[uint64]bool)
	for _, rp := range rolePermissions {
		assignedMap[rp.PermissionID] = true
	}

	// Group map
	groupedMap := make(map[string][]dto.RolePermissionItem)

	for _, p := range allSoftwarePermissions {
		item := dto.RolePermissionItem{
			PermissionID:   p.ID,
			PermissionKey:  p.PermissionKey,
			PermissionName: p.PermissionName,
			Assigned:       assignedMap[p.ID],
		}
		groupedMap[p.PermissionGroup] = append(groupedMap[p.PermissionGroup], item)
	}

	var groups []dto.RolePermissionGroup
	for gname, items := range groupedMap {
		groups = append(groups, dto.RolePermissionGroup{
			PermissionGroup: gname,
			Permissions:     items,
		})
	}

	res := &dto.RolePermissionMatrixResponse{
		Role: dto.RoleReference{
			ID:       role.ID,
			RoleName: role.RoleName,
			RoleCode: role.RoleCode,
		},
		Software: dto.SoftwareReference{
			ID:           role.SoftwareID,
			SoftwareCode: role.Software.SoftwareCode,
			SoftwareName: role.Software.SoftwareName,
		},
		Groups: groups,
	}

	return res, nil
}

func (s *RolePermissionService) AssignRolePermissions(roleID uint64, req dto.AssignRolePermissionsRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.RolePermissionMatrixResponse, error) {
	role, err := s.roleRepo.FindRoleByID(roleID)
	if err != nil || role.Status != "active" {
		return nil, errors.New("role not found or inactive")
	}

	if role.RoleCode == "SUPER_ADMIN" && role.Software.SoftwareCode == "CONTROL_CENTER" {
		if len(req.PermissionIDs) == 0 {
			return nil, errors.New("cannot remove all permissions from Super Admin")
		}
	}

	permissionsToAssign, err := s.permissionRepo.FindPermissionsByIDs(req.PermissionIDs)
	if err != nil {
		return nil, errors.New("invalid permissions")
	}

	for _, p := range permissionsToAssign {
		if p.SoftwareID != role.SoftwareID || p.Status != "active" {
			return nil, errors.New("cannot assign permissions that do not belong to the role's software module")
		}
	}

	var newRolePermissions []models.RolePermission
	for _, pID := range req.PermissionIDs {
		newRolePermissions = append(newRolePermissions, models.RolePermission{
			RoleID:       roleID,
			PermissionID: pID,
		})
	}

	if err := s.repo.ReplaceRolePermissions(roleID, newRolePermissions); err != nil {
		return nil, errors.New("failed to assign role permissions")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"ROLE_PERMISSIONS_UPDATED", "role", &roleID, nil, req.PermissionIDs, ipAddress, userAgent,
	)

	return s.GetRolePermissionMatrix(roleID)
}
