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

func (r *UserAccessMatrixRepository) FindUserAccessMatrix(userID uint64) ([]models.UserBranchRole, error) {
	var matrix []models.UserBranchRole
	if err := r.db.Preload("Branch").
		Preload("Role").
		Where("user_id = ?", userID).
		Find(&matrix).Error; err != nil {
		return nil, err
	}
	return matrix, nil
}

func (r *UserAccessMatrixRepository) FindAccessRecordByID(accessID uint64) (*models.UserBranchRole, error) {
	var record models.UserBranchRole
	if err := r.db.Preload("Role").First(&record, accessID).Error; err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *UserAccessMatrixRepository) CheckDuplicateAccess(userID, branchID, roleID uint64) (*models.UserBranchRole, error) {
	var record models.UserBranchRole
	err := r.db.Where("user_id = ? AND branch_id = ? AND role_id = ?",
		userID, branchID, roleID).First(&record).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &record, nil
}

func (r *UserAccessMatrixRepository) CreateOrReactivateAccess(record *models.UserBranchRole) error {
	existing, err := r.CheckDuplicateAccess(record.UserID, record.BranchID, record.RoleID)
	if err != nil {
		return err
	}

	if existing != nil {
		existing.Status = "active"
		return r.db.Save(existing).Error
	}

	return r.db.Create(record).Error
}

func (r *UserAccessMatrixRepository) DeactivateAccess(accessID uint64) error {
	return r.db.Model(&models.UserBranchRole{}).Where("id = ?", accessID).Update("status", "inactive").Error
}

func (r *UserAccessMatrixRepository) CountActiveSuperAdminAccess() (int64, error) {
	var count int64
	err := r.db.Model(&models.UserBranchRole{}).
		Joins("JOIN roles ON roles.id = user_branch_roles.role_id").
		Where("roles.role_code = ? AND user_branch_roles.status = ?", "SUPER_ADMIN", "active").
		Count(&count).Error
	return count, err
}
