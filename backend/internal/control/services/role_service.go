package services

import (
	"errors"
	"math"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type RoleService struct {
	repo         *repositories.RoleRepository
	moduleRepo   *repositories.SoftwareModuleRepository
	rolePermRepo *repositories.RolePermissionRepository
	auditService *AuditService
}

func NewRoleService(repo *repositories.RoleRepository, moduleRepo *repositories.SoftwareModuleRepository, rolePermRepo *repositories.RolePermissionRepository, auditService *AuditService) *RoleService {
	return &RoleService{
		repo:         repo,
		moduleRepo:   moduleRepo,
		rolePermRepo: rolePermRepo,
		auditService: auditService,
	}
}

func (s *RoleService) ListRoles(softwareID, softwareCode, status, search string, page, limit int) ([]dto.RoleResponse, *dto.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	roles, count, err := s.repo.FindRoles(softwareID, softwareCode, status, search, offset, limit)
	if err != nil {
		return nil, nil, err
	}

	totalPages := int(math.Ceil(float64(count) / float64(limit)))

	pagination := &dto.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      count,
		TotalPages: totalPages,
	}

	var res []dto.RoleResponse
	for _, r := range roles {
		rolePerms, _ := s.rolePermRepo.FindRolePermissions(r.ID)
		var permIDs []uint64
		for _, rp := range rolePerms {
			permIDs = append(permIDs, rp.PermissionID)
		}
		res = append(res, dto.RoleResponse{
			ID:            r.ID,
			SoftwareID:    r.SoftwareID,
			SoftwareCode:  r.Software.SoftwareCode,
			SoftwareName:  r.Software.SoftwareName,
			RoleName:      r.RoleName,
			RoleCode:      r.RoleCode,
			Description:   r.Description,
			IsSystemRole:  r.IsSystemRole,
			Status:        r.Status,
			PermissionIDs: permIDs,
		})
	}

	return res, pagination, nil
}

func (s *RoleService) GetRoleByID(id uint64) (*dto.RoleResponse, error) {
	r, err := s.repo.FindRoleByID(id)
	if err != nil {
		return nil, errors.New("role not found")
	}

	rolePerms, _ := s.rolePermRepo.FindRolePermissions(id)
	var permIDs []uint64
	for _, rp := range rolePerms {
		permIDs = append(permIDs, rp.PermissionID)
	}

	return &dto.RoleResponse{
		ID:            r.ID,
		SoftwareID:    r.SoftwareID,
		SoftwareCode:  r.Software.SoftwareCode,
		SoftwareName:  r.Software.SoftwareName,
		RoleName:      r.RoleName,
		RoleCode:      r.RoleCode,
		Description:   r.Description,
		IsSystemRole:  r.IsSystemRole,
		Status:        r.Status,
		PermissionIDs: permIDs,
	}, nil
}

func (s *RoleService) CreateRole(req dto.CreateRoleRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.RoleResponse, error) {
	software, err := s.moduleRepo.FindByID(req.SoftwareID)
	if err != nil || software.Status != "active" {
		return nil, errors.New("software module not found or inactive")
	}

	existing, _ := s.repo.FindRoleByCode(req.SoftwareID, req.RoleCode)
	if existing != nil {
		return nil, errors.New("role code already exists for this software module")
	}

	role := &models.Role{
		SoftwareID:   req.SoftwareID,
		RoleName:     req.RoleName,
		RoleCode:     req.RoleCode,
		Description:  req.Description,
		IsSystemRole: false,
		Status:       req.Status,
		CreatedBy:    &activeUserID,
	}

	if err := s.repo.CreateRole(role); err != nil {
		return nil, errors.New("failed to create role")
	}

	if len(req.PermissionIDs) > 0 {
		var newRolePermissions []models.RolePermission
		for _, pID := range req.PermissionIDs {
			newRolePermissions = append(newRolePermissions, models.RolePermission{
				RoleID:       role.ID,
				PermissionID: pID,
			})
		}
		_ = s.rolePermRepo.ReplaceRolePermissions(role.ID, newRolePermissions)
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"ROLE_CREATED", "role", &role.ID, nil, role, ipAddress, userAgent,
	)

	return s.GetRoleByID(role.ID)
}

func (s *RoleService) UpdateRole(id uint64, req dto.UpdateRoleRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.RoleResponse, error) {
	role, err := s.repo.FindRoleByID(id)
	if err != nil {
		return nil, errors.New("role not found")
	}

	if role.IsSystemRole {
		// System roles can only have their description and status updated
		if req.RoleName != role.RoleName || req.RoleCode != role.RoleCode {
			return nil, errors.New("cannot change role_name or role_code of a system role")
		}
	} else {
		if req.RoleCode != role.RoleCode {
			existing, _ := s.repo.FindRoleByCode(role.SoftwareID, req.RoleCode)
			if existing != nil && existing.ID != id {
				return nil, errors.New("role code already exists for this software module")
			}
		}
	}

	oldValues := *role

	if !role.IsSystemRole {
		role.RoleName = req.RoleName
		role.RoleCode = req.RoleCode
	}
	role.Description = req.Description
	role.Status = req.Status
	role.UpdatedBy = &activeUserID

	if err := s.repo.UpdateRole(role); err != nil {
		return nil, errors.New("failed to update role")
	}

	if req.PermissionIDs != nil {
		var newRolePermissions []models.RolePermission
		for _, pID := range req.PermissionIDs {
			newRolePermissions = append(newRolePermissions, models.RolePermission{
				RoleID:       role.ID,
				PermissionID: pID,
			})
		}
		_ = s.rolePermRepo.ReplaceRolePermissions(role.ID, newRolePermissions)
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"ROLE_UPDATED", "role", &role.ID, oldValues, role, ipAddress, userAgent,
	)

	return s.GetRoleByID(role.ID)
}

func (s *RoleService) DeleteRole(id uint64, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) error {
	role, err := s.repo.FindRoleByID(id)
	if err != nil {
		return errors.New("role not found")
	}

	if role.IsSystemRole {
		return errors.New("cannot delete system roles")
	}

	activeCount, _ := s.repo.CountActiveRoleAssignments(id)
	if activeCount > 0 {
		return errors.New("cannot delete role currently assigned to active users")
	}

	if err := s.repo.SoftDeleteRole(id); err != nil {
		return errors.New("failed to delete role")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"ROLE_DELETED", "role", &role.ID, role, nil, ipAddress, userAgent,
	)

	return nil
}

func (s *RoleService) GetRolesBySoftware(softwareID uint64) ([]dto.RoleResponse, error) {
	roles, err := s.repo.FindRolesBySoftware(softwareID)
	if err != nil {
		return nil, err
	}

	var res []dto.RoleResponse
	for _, r := range roles {
		res = append(res, dto.RoleResponse{
			ID:           r.ID,
			RoleName:     r.RoleName,
			RoleCode:     r.RoleCode,
			IsSystemRole: r.IsSystemRole,
			Status:       r.Status,
		})
	}
	return res, nil
}
