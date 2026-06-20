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

func (r *UserAccessMatrixRepository) AssignUserRoleToBranchSoftware(userID, branchID, softwareID, roleID uint64, createdBy *uint64) error {
	access := models.UserBranchSoftwareRole{
		UserID:     userID,
		BranchID:   branchID,
		SoftwareID: softwareID,
		RoleID:     roleID,
		Status:     "active",
		CreatedBy:  createdBy,
	}

	return r.db.Where(
		"user_id = ? AND branch_id = ? AND software_id = ? AND role_id = ?",
		userID, branchID, softwareID, roleID,
	).FirstOrCreate(&access).Error
}

func (r *UserAccessMatrixRepository) RemoveUserRoleFromBranchSoftware(userID, branchID, softwareID, roleID uint64) error {
	return r.db.Where(
		"user_id = ? AND branch_id = ? AND software_id = ? AND role_id = ?",
		userID, branchID, softwareID, roleID,
	).Delete(&models.UserBranchSoftwareRole{}).Error
}

func (r *UserAccessMatrixRepository) GetUserAccessMatrix(userID uint64) ([]models.UserBranchSoftwareRole, error) {
	var matrix []models.UserBranchSoftwareRole
	err := r.db.Preload("Branch").Preload("Software").Preload("Role").
		Where("user_id = ? AND status = ?", userID, "active").
		Find(&matrix).Error
	return matrix, err
}

func (r *UserAccessMatrixRepository) GetUserRolesByBranchAndSoftware(userID, branchID, softwareID uint64) ([]models.Role, error) {
	var matrix []models.UserBranchSoftwareRole
	err := r.db.Preload("Role").
		Where("user_id = ? AND branch_id = ? AND software_id = ? AND status = ?", userID, branchID, softwareID, "active").
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

func (r *UserAccessMatrixRepository) CheckUserHasRoleForBranchSoftware(userID, branchID, softwareID, roleID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBranchSoftwareRole{}).
		Where("user_id = ? AND branch_id = ? AND software_id = ? AND role_id = ? AND status = ?", userID, branchID, softwareID, roleID, "active").
		Count(&count).Error

	return count > 0, err
}
