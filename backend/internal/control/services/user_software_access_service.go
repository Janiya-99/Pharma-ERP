package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type UserSoftwareAccessService struct {
	repo         *repositories.UserSoftwareAccessRepository
	userRepo     *repositories.UserRepository
	moduleRepo   *repositories.SoftwareModuleRepository
	auditService *AuditService
}

func NewUserSoftwareAccessService(repo *repositories.UserSoftwareAccessRepository, userRepo *repositories.UserRepository, moduleRepo *repositories.SoftwareModuleRepository, auditService *AuditService) *UserSoftwareAccessService {
	return &UserSoftwareAccessService{
		repo:         repo,
		userRepo:     userRepo,
		moduleRepo:   moduleRepo,
		auditService: auditService,
	}
}

func (s *UserSoftwareAccessService) GetUserSoftwareAccess(userID uint64) ([]models.UserSoftwareAccess, error) {
	return s.repo.FindUserSoftwareAccess(userID)
}

func (s *UserSoftwareAccessService) AssignUserSoftwareAccess(userID uint64, req dto.AssignSoftwareAccessRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) ([]models.UserSoftwareAccess, error) {
	user, err := s.userRepo.FindUserByID(userID)
	if err != nil || user.Status != "active" {
		return nil, errors.New("user not found or inactive")
	}

	for _, reqMod := range req.SoftwareModules {
		// Just to verify if software exists (you could cache this to optimize)
		access := &models.UserSoftwareAccess{
			UserID:     userID,
			SoftwareID: reqMod.SoftwareID,
			CanAccess:  reqMod.CanAccess,
			Status:     "active",
			CreatedBy:  &activeUserID,
		}

		if err := s.repo.CreateOrUpdateUserSoftwareAccess(access); err != nil {
			return nil, errors.New("failed to assign software access")
		}
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_SOFTWARE_ACCESS_ASSIGNED", "user_software_access", &userID, nil, req.SoftwareModules, ipAddress, userAgent,
	)

	return s.repo.FindUserSoftwareAccess(userID)
}

func (s *UserSoftwareAccessService) RemoveUserSoftwareAccess(userID, softwareID, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) error {
	access, err := s.repo.FindUserSoftwareByID(userID, softwareID)
	if err != nil || access.Status != "active" || !access.CanAccess {
		return errors.New("software access not found")
	}

	count, _ := s.repo.CountActiveUserSoftware(userID)
	if count <= 1 {
		return errors.New("cannot remove the user's only active software access")
	}

	hasRoles, _ := s.repo.HasActiveRolesInSoftware(userID, softwareID)
	if hasRoles {
		return errors.New("cannot remove software while user has active roles in it")
	}

	// Verify if CONTROL_CENTER from last super admin
	user, _ := s.userRepo.FindUserByID(userID)
	if user != nil && user.UserType == "super_admin" {
		if access.Software.SoftwareCode == "CONTROL_CENTER" {
			superCount, _ := s.userRepo.CountActiveSuperAdmins()
			if superCount <= 1 {
				return errors.New("cannot remove CONTROL_CENTER from the last active super_admin")
			}
		}
	}

	if err := s.repo.RemoveUserSoftwareAccess(userID, softwareID); err != nil {
		return errors.New("failed to remove software access")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_SOFTWARE_ACCESS_REMOVED", "user_software_access", &userID, softwareID, nil, ipAddress, userAgent,
	)

	return nil
}
