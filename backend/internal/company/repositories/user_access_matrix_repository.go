package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type UserAccessMatrixRepository struct {
	db *gorm.DB
}

func NewUserAccessMatrixRepository(db *gorm.DB) *UserAccessMatrixRepository {
	return &UserAccessMatrixRepository{db: db}
}

func (r *UserAccessMatrixRepository) AssignRole(userID, branchID, roleID uint64, createdBy uint64) error {
	access := models.UserBranchRole{
		UserID:    userID,
		BranchID:  branchID,
		RoleID:    roleID,
		Status:    "active",
		CreatedBy: &createdBy,
	}
	return r.db.Create(&access).Error
}

func (r *UserAccessMatrixRepository) RemoveRole(userID, branchID, roleID uint64) error {
	return r.db.Where(
		"user_id = ? AND branch_id = ? AND role_id = ?",
		userID, branchID, roleID,
	).Delete(&models.UserBranchRole{}).Error
}

func (r *UserAccessMatrixRepository) GetUserAccessMatrix(userID uint64) ([]models.UserBranchRole, error) {
	var matrix []models.UserBranchRole
	err := r.db.Preload("Branch").
		Preload("Role").
		Where("user_id = ?", userID).
		Find(&matrix).Error
	return matrix, err
}

func (r *UserAccessMatrixRepository) GetUserRolesByBranch(userID, branchID uint64) ([]models.Role, error) {
	var matrix []models.UserBranchRole
	err := r.db.Preload("Role").
		Where("user_id = ? AND branch_id = ? AND status = ?", userID, branchID, "active").
		Find(&matrix).Error

	if err != nil {
		return nil, err
	}

	var roles []models.Role
	for _, m := range matrix {
		roles = append(roles, m.Role)
	}
	return roles, nil
}

func (r *UserAccessMatrixRepository) CheckUserHasRoleForBranch(userID, branchID, roleID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBranchRole{}).
		Where("user_id = ? AND branch_id = ? AND role_id = ? AND status = ?", userID, branchID, roleID, "active").
		Count(&count).Error

	return count > 0, err
}

func (r *UserAccessMatrixRepository) IsUserSuperAdmin(userID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBranchRole{}).
		Joins("JOIN roles ON roles.id = user_branch_roles.role_id").
		Where("user_branch_roles.user_id = ? AND roles.role_code = ? AND user_branch_roles.status = ?", userID, "SUPER_ADMIN", "active").
		Count(&count).Error
	return count > 0, err
}
