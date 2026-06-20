package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type UserAccessMatrixService struct {
	repo         *repositories.UserAccessMatrixRepository
	userRepo     *repositories.UserRepository
	branchRepo   *repositories.UserBranchAccessRepository
	softwareRepo *repositories.UserSoftwareAccessRepository
	roleRepo     *repositories.RoleRepository
	auditService *AuditService
}

func NewUserAccessMatrixService(repo *repositories.UserAccessMatrixRepository, userRepo *repositories.UserRepository, branchRepo *repositories.UserBranchAccessRepository, softwareRepo *repositories.UserSoftwareAccessRepository, roleRepo *repositories.RoleRepository, auditService *AuditService) *UserAccessMatrixService {
	return &UserAccessMatrixService{
		repo:         repo,
		userRepo:     userRepo,
		branchRepo:   branchRepo,
		softwareRepo: softwareRepo,
		roleRepo:     roleRepo,
		auditService: auditService,
	}
}

func (s *UserAccessMatrixService) GetUserAccessMatrix(userID uint64) (*dto.UserAccessMatrixResponse, error) {
	user, err := s.userRepo.FindUserByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	matrix, err := s.repo.FindUserAccessMatrix(userID)
	if err != nil {
		return nil, err
	}

	var items []dto.AccessMatrixResponseItem
	for _, m := range matrix {
		items = append(items, dto.AccessMatrixResponseItem{
			ID:           m.ID,
			BranchID:     m.BranchID,
			BranchName:   m.Branch.BranchName,
			SoftwareID:   m.SoftwareID,
			SoftwareCode: m.Software.SoftwareCode,
			SoftwareName: m.Software.SoftwareName,
			RoleID:       m.RoleID,
			RoleName:     m.Role.RoleName,
			Status:       m.Status,
		})
	}

	res := &dto.UserAccessMatrixResponse{
		User: dto.UserReference{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
		AccessMatrix: items,
	}

	return res, nil
}

func (s *UserAccessMatrixService) AssignUserAccessMatrix(userID uint64, req dto.AssignUserAccessMatrixRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.UserAccessMatrixResponse, error) {
	user, err := s.userRepo.FindUserByID(userID)
	if err != nil || user.Status != "active" {
		return nil, errors.New("user not found or inactive")
	}

	for _, accessReq := range req.Access {
		// 1. Verify user has branch access
		bAccess, err := s.branchRepo.FindUserBranchAccess(userID, accessReq.BranchID)
		if err != nil || bAccess.Status != "active" {
			return nil, errors.New("user does not have access to one of the selected branches")
		}

		// 2. Verify user has software access
		sAccess, err := s.softwareRepo.FindUserSoftwareByID(userID, accessReq.SoftwareID)
		if err != nil || sAccess.Status != "active" || !sAccess.CanAccess {
			return nil, errors.New("user does not have access to one of the selected software modules")
		}

		// 3. Verify role exists and belongs to the selected software
		role, err := s.roleRepo.FindRoleByID(accessReq.RoleID)
		if err != nil || role.Status != "active" {
			return nil, errors.New("role not found or inactive")
		}
		if role.SoftwareID != accessReq.SoftwareID {
			return nil, errors.New("role does not belong to the selected software module")
		}

		// 4. Create or Reactivate
		record := &models.UserBranchSoftwareRole{
			UserID:     userID,
			BranchID:   accessReq.BranchID,
			SoftwareID: accessReq.SoftwareID,
			RoleID:     accessReq.RoleID,
			Status:     "active",
			CreatedBy:  &activeUserID,
		}

		if err := s.repo.CreateOrReactivateAccess(record); err != nil {
			return nil, errors.New("failed to assign user access matrix")
		}
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_ACCESS_MATRIX_ASSIGNED", "user_branch_software_roles", &userID, nil, req.Access, ipAddress, userAgent,
	)

	return s.GetUserAccessMatrix(userID)
}

func (s *UserAccessMatrixService) RemoveUserAccessMatrix(accessID uint64, userID, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) error {
	record, err := s.repo.FindAccessRecordByID(accessID)
	if err != nil || record.Status != "active" {
		return errors.New("access record not found")
	}

	if record.UserID != userID {
		return errors.New("access record does not belong to this user")
	}

	// System rule: Do not allow removing active Super Admin access for Control Center
	if record.Role.RoleCode == "SUPER_ADMIN" && record.Software.SoftwareCode == "CONTROL_CENTER" {
		if record.UserID == activeUserID {
			return errors.New("cannot remove your own active Super Admin access")
		}

		count, _ := s.repo.CountActiveSuperAdminAccess()
		if count <= 1 {
			return errors.New("cannot remove the last active Super Admin access for Control Center")
		}
	}

	if err := s.repo.DeactivateAccess(accessID); err != nil {
		return errors.New("failed to remove access record")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_ACCESS_MATRIX_REMOVED", "user_branch_software_roles", &accessID, record, nil, ipAddress, userAgent,
	)

	return nil
}
