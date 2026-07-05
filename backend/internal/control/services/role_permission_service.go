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

	// Get all permissions for all software modules
	allSoftwarePermissions, err := s.permissionRepo.FindPermissionsGrouped("", "ALL_MODULES")
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
	var groupOrder []string
	groupedMap := make(map[string][]dto.RolePermissionItem)

	for _, p := range allSoftwarePermissions {
		item := dto.RolePermissionItem{
			PermissionID:   p.ID,
			PermissionKey:  p.PermissionKey,
			PermissionName: p.PermissionName,
			Assigned:       assignedMap[p.ID],
		}
		groupName := p.Software.SoftwareName + " - " + p.PermissionGroup
		if _, ok := groupedMap[groupName]; !ok {
			groupOrder = append(groupOrder, groupName)
		}
		groupedMap[groupName] = append(groupedMap[groupName], item)
	}

	var groups []dto.RolePermissionGroup
	for _, gname := range groupOrder {
		groups = append(groups, dto.RolePermissionGroup{
			PermissionGroup: gname,
			Permissions:     groupedMap[gname],
		})
	}

	res := &dto.RolePermissionMatrixResponse{
		Role: dto.RoleReference{
			ID:       role.ID,
			RoleName: role.RoleName,
			RoleCode: role.RoleCode,
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

	if role.RoleCode == "SUPER_ADMIN" {
		if len(req.PermissionIDs) == 0 {
			return nil, errors.New("cannot remove all permissions from Super Admin")
		}
	}

	permissionsToAssign, err := s.permissionRepo.FindPermissionsByIDs(req.PermissionIDs)
	if err != nil {
		return nil, errors.New("invalid permissions")
	}

	for _, p := range permissionsToAssign {
		if p.Status != "active" {
			return nil, errors.New("cannot assign inactive permissions")
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
