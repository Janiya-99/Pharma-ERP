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

func (r *UserAccessMatrixRepository) FindUserAccessMatrix(userID uint64) ([]models.UserBranchSoftwareRole, error) {
	var matrix []models.UserBranchSoftwareRole
	if err := r.db.Preload("Branch").
		Preload("Software").
		Preload("Role").
		Where("user_id = ?", userID).
		Find(&matrix).Error; err != nil {
		return nil, err
	}
	return matrix, nil
}

func (r *UserAccessMatrixRepository) FindAccessRecordByID(accessID uint64) (*models.UserBranchSoftwareRole, error) {
	var record models.UserBranchSoftwareRole
	if err := r.db.Preload("Role").First(&record, accessID).Error; err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *UserAccessMatrixRepository) CheckDuplicateAccess(userID, branchID, softwareID, roleID uint64) (*models.UserBranchSoftwareRole, error) {
	var record models.UserBranchSoftwareRole
	err := r.db.Where("user_id = ? AND branch_id = ? AND software_id = ? AND role_id = ?",
		userID, branchID, softwareID, roleID).First(&record).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &record, nil
}

func (r *UserAccessMatrixRepository) CreateOrReactivateAccess(record *models.UserBranchSoftwareRole) error {
	existing, err := r.CheckDuplicateAccess(record.UserID, record.BranchID, record.SoftwareID, record.RoleID)
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
	return r.db.Model(&models.UserBranchSoftwareRole{}).Where("id = ?", accessID).Update("status", "inactive").Error
}

func (r *UserAccessMatrixRepository) CountActiveSuperAdminAccess() (int64, error) {
	var count int64
	err := r.db.Model(&models.UserBranchSoftwareRole{}).
		Joins("JOIN roles ON roles.id = user_branch_software_roles.role_id").
		Joins("JOIN software_modules sm ON sm.id = user_branch_software_roles.software_id").
		Where("roles.role_code = ? AND sm.software_code = ? AND user_branch_software_roles.status = ?", "SUPER_ADMIN", "CONTROL_CENTER", "active").
		Count(&count).Error
	return count, err
}
