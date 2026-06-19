package service

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

// RoleService handles role and permission business logic.
type RoleService struct {
	roleRepo    *repository.RoleRepository
	permService *PermissionService
	logger      *zap.Logger
}

func NewRoleService(roleRepo *repository.RoleRepository, permService *PermissionService, logger *zap.Logger) *RoleService {
	return &RoleService{roleRepo: roleRepo, permService: permService, logger: logger}
}

func (s *RoleService) GetByID(id uint64) (*model.Role, error) {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Role")
	}
	return role, nil
}

func (s *RoleService) List(companyID uint64, req *dto.PaginationRequest) ([]model.Role, int64, error) {
	return s.roleRepo.List(companyID, req)
}

func (s *RoleService) Create(companyID uint64, req *request.CreateRoleRequest) (*model.Role, error) {
	exists, err := s.roleRepo.SlugExists(companyID, req.Slug, 0)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	if exists {
		return nil, errs.ErrConflict("Role slug already exists")
	}

	role := &model.Role{
		CompanyScopedModel: model.CompanyScopedModel{CompanyID: companyID},
		Name:               req.Name,
		Slug:               req.Slug,
		Description:        req.Description,
		IsSystem:           false,
	}

	if err := s.roleRepo.Create(nil, role); err != nil {
		return nil, errs.ErrDatabase(err)
	}

	if len(req.PermissionIDs) > 0 {
		if err := s.roleRepo.AssignPermissions(nil, role.ID, req.PermissionIDs); err != nil {
			s.logger.Error("failed to assign permissions", zap.Error(err))
		}
	}

	return role, nil
}

func (s *RoleService) Update(ctx context.Context, id uint64, req *request.UpdateRoleRequest) (*model.Role, error) {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Role")
	}

	if role.IsSystem {
		return nil, errs.ErrConflict("Cannot modify system role")
	}

	if req.Name != "" {
		role.Name = req.Name
	}
	if req.Description != "" {
		role.Description = req.Description
	}

	if err := s.roleRepo.Update(nil, role); err != nil {
		return nil, errs.ErrDatabase(err)
	}

	if req.PermissionIDs != nil {
		if err := s.roleRepo.AssignPermissions(nil, role.ID, req.PermissionIDs); err != nil {
			s.logger.Error("failed to update permissions", zap.Error(err))
		}
		// Invalidate cache
		s.permService.InvalidateAllPermissions(ctx)
	}

	return role, nil
}

func (s *RoleService) Delete(id uint64) error {
	role, err := s.roleRepo.FindByID(id)
	if err != nil {
		return errs.ErrNotFound("Role")
	}
	if role.IsSystem {
		return errs.ErrConflict("Cannot delete system role")
	}

	if err := s.roleRepo.Delete(id); err != nil {
		return errs.ErrDatabase(err)
	}
	return nil
}

func (s *RoleService) GetAllPermissions() ([]model.Permission, error) {
	return s.roleRepo.GetAllPermissions()
}
