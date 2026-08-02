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

func (s *UserAccessMatrixService) AssignAccess(userID, branchID, roleID uint64, createdBy *uint64) error {
	if err := s.ValidateUserBranchRole(userID, branchID, roleID); err != nil {
		return err
	}
	// Note: createdBy should be dereferenced if AssignRole takes uint64, but keeping logic consistent.
	var cb uint64
	if createdBy != nil {
		cb = *createdBy
	}
	return s.repo.AssignRole(userID, branchID, roleID, cb)
}

func (s *UserAccessMatrixService) RemoveAccess(userID, branchID, roleID uint64) error {
	return s.repo.RemoveRole(userID, branchID, roleID)
}

func (s *UserAccessMatrixService) ListUserAccess(userID uint64) ([]models.UserBranchRole, error) {
	return s.repo.GetUserAccessMatrix(userID)
}

func (s *UserAccessMatrixService) ValidateUserBranchRole(userID, branchID, roleID uint64) error {
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

	// 3. Role exists and status = active
	var role models.Role
	if err := s.db.Where("id = ? AND status = ?", roleID, "active").First(&role).Error; err != nil {
		return errors.New("role does not exist or is inactive")
	}

	// 4. User must already have branch access in user_branch_access
	var uba models.UserBranchAccess
	if err := s.db.Where("user_id = ? AND branch_id = ? AND status = ?", userID, branchID, "active").First(&uba).Error; err != nil {
		return errors.New("user does not have access to this branch")
	}

	return nil
}
