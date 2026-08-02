package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type UserBranchAccessService struct {
	repo         *repositories.UserBranchAccessRepository
	userRepo     *repositories.UserRepository
	branchRepo   *repositories.BranchRepository
	auditService *AuditService
}

func NewUserBranchAccessService(repo *repositories.UserBranchAccessRepository, userRepo *repositories.UserRepository, branchRepo *repositories.BranchRepository, auditService *AuditService) *UserBranchAccessService {
	return &UserBranchAccessService{
		repo:         repo,
		userRepo:     userRepo,
		branchRepo:   branchRepo,
		auditService: auditService,
	}
}

func (s *UserBranchAccessService) GetUserBranches(userID uint64) ([]models.UserBranchAccess, error) {
	return s.repo.FindUserBranches(userID)
}

func (s *UserBranchAccessService) AssignUserBranches(userID uint64, req dto.AssignBranchAccessRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) ([]models.UserBranchAccess, error) {
	user, err := s.userRepo.FindUserByID(userID)
	if err != nil || user.Status != "active" {
		return nil, errors.New("user not found or inactive")
	}

	var defaultBranchID uint64
	defaultCount := 0

	for _, reqBranch := range req.Branches {
		if reqBranch.IsDefault {
			defaultCount++
			defaultBranchID = reqBranch.BranchID
		}
	}

	if defaultCount > 1 {
		return nil, errors.New("only one branch can be default")
	}

	for _, reqBranch := range req.Branches {
		branch, err := s.branchRepo.GetByID(reqBranch.BranchID)
		if err != nil || branch.Status != "active" {
			return nil, errors.New("one or more branches are invalid or inactive")
		}

		access := &models.UserBranchAccess{
			UserID:    userID,
			BranchID:  reqBranch.BranchID,
			IsDefault: reqBranch.IsDefault,
			Status:    "active",
			CreatedBy: &activeUserID,
		}

		if err := s.repo.CreateOrUpdateUserBranchAccess(access); err != nil {
			return nil, errors.New("failed to assign branch access")
		}
	}

	if defaultCount == 1 {
		user.DefaultBranchID = &defaultBranchID
		_ = s.userRepo.UpdateUser(user)

		// Unset old default branches
		branches, _ := s.repo.FindUserBranches(userID)
		for _, b := range branches {
			if b.BranchID != defaultBranchID && b.IsDefault {
				b.IsDefault = false
				_ = s.repo.CreateOrUpdateUserBranchAccess(&b)
			}
		}
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_BRANCH_ACCESS_ASSIGNED", "user_branch_access", &userID, nil, req.Branches, ipAddress, userAgent,
	)

	return s.repo.FindUserBranches(userID)
}

func (s *UserBranchAccessService) RemoveUserBranchAccess(userID, branchID, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) error {
	access, err := s.repo.FindUserBranchAccess(userID, branchID)
	if err != nil || access.Status != "active" {
		return errors.New("branch access not found")
	}

	count, _ := s.repo.CountActiveUserBranches(userID)
	if count <= 1 {
		return errors.New("cannot remove the user's only active branch")
	}

	hasRoles, _ := s.repo.HasActiveRolesInBranch(userID, branchID)
	if hasRoles {
		return errors.New("cannot remove branch while user has active roles in it")
	}

	if access.IsDefault {
		return errors.New("cannot remove default branch. Set another branch as default first")
	}

	if err := s.repo.RemoveUserBranchAccess(userID, branchID); err != nil {
		return errors.New("failed to remove branch access")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_BRANCH_ACCESS_REMOVED", "user_branch_access", &userID, branchID, nil, ipAddress, userAgent,
	)

	return nil
}
