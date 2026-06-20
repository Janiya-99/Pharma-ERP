package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/company/repositories"
	"gorm.io/gorm"
)

type UserAccessMatrixService struct {
	db   *gorm.DB
	repo *repositories.UserAccessMatrixRepository
}

func NewUserAccessMatrixService(db *gorm.DB, repo *repositories.UserAccessMatrixRepository) *UserAccessMatrixService {
	return &UserAccessMatrixService{db: db, repo: repo}
}

func (s *UserAccessMatrixService) AssignAccess(userID, branchID, softwareID, roleID uint64, createdBy *uint64) error {
	if err := s.ValidateUserBranchSoftwareRole(userID, branchID, softwareID, roleID); err != nil {
		return err
	}
	return s.repo.AssignUserRoleToBranchSoftware(userID, branchID, softwareID, roleID, createdBy)
}

func (s *UserAccessMatrixService) RemoveAccess(userID, branchID, softwareID, roleID uint64) error {
	return s.repo.RemoveUserRoleFromBranchSoftware(userID, branchID, softwareID, roleID)
}

func (s *UserAccessMatrixService) ListUserAccess(userID uint64) ([]models.UserBranchSoftwareRole, error) {
	return s.repo.GetUserAccessMatrix(userID)
}

func (s *UserAccessMatrixService) ValidateUserBranchSoftwareRole(userID, branchID, softwareID, roleID uint64) error {
	// 1. User exists and status = active
	var user models.User
	if err := s.db.Where("id = ? AND status = ?", userID, "active").First(&user).Error; err != nil {
		return errors.New("user does not exist or is inactive")
	}

	// 2. Branch exists and status = active
	var branch models.Branch
	if err := s.db.Where("id = ? AND status = ?", branchID, "active").First(&branch).Error; err != nil {
		return errors.New("branch does not exist or is inactive")
	}

	// 3. Software module exists and status = active
	var software models.SoftwareModule
	if err := s.db.Where("id = ? AND status = ?", softwareID, "active").First(&software).Error; err != nil {
		return errors.New("software module does not exist or is inactive")
	}

	// 4. Role exists and status = active
	var role models.Role
	if err := s.db.Where("id = ? AND status = ?", roleID, "active").First(&role).Error; err != nil {
		return errors.New("role does not exist or is inactive")
	}

	// 5. Role must belong to the selected software_id
	if role.SoftwareID != softwareID {
		return errors.New("role does not belong to the selected software module")
	}

	// 6. User must already have branch access in user_branch_access
	var uba models.UserBranchAccess
	if err := s.db.Where("user_id = ? AND branch_id = ? AND status = ?", userID, branchID, "active").First(&uba).Error; err != nil {
		return errors.New("user does not have access to this branch")
	}

	// 7. User must already have software access in user_software_access
	var usa models.UserSoftwareAccess
	if err := s.db.Where("user_id = ? AND software_id = ? AND status = ?", userID, softwareID, "active").First(&usa).Error; err != nil {
		return errors.New("user does not have access to this software module")
	}

	// 8. Do not create duplicate user + branch + software + role assignment
	// This is handled by the unique index idx_user_branch_software_role on DB level,
	// but we can also check here or let FirstOrCreate handle it.

	return nil
}
