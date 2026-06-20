package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserBranchAccessRepository struct {
	db *gorm.DB
}

func NewUserBranchAccessRepository(db *gorm.DB) *UserBranchAccessRepository {
	return &UserBranchAccessRepository{db: db}
}

func (r *UserBranchAccessRepository) FindUserBranches(userID uint64) ([]models.UserBranchAccess, error) {
	var accesses []models.UserBranchAccess
	if err := r.db.Preload("Branch").Where("user_id = ?", userID).Find(&accesses).Error; err != nil {
		return nil, err
	}
	return accesses, nil
}

func (r *UserBranchAccessRepository) FindUserBranchAccess(userID, branchID uint64) (*models.UserBranchAccess, error) {
	var access models.UserBranchAccess
	if err := r.db.Where("user_id = ? AND branch_id = ?", userID, branchID).First(&access).Error; err != nil {
		return nil, err
	}
	return &access, nil
}

func (r *UserBranchAccessRepository) CreateOrUpdateUserBranchAccess(access *models.UserBranchAccess) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "branch_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"is_default", "status"}),
	}).Create(access).Error
}

func (r *UserBranchAccessRepository) RemoveUserBranchAccess(userID, branchID uint64) error {
	return r.db.Model(&models.UserBranchAccess{}).
		Where("user_id = ? AND branch_id = ?", userID, branchID).
		Update("status", "inactive").Error
}

func (r *UserBranchAccessRepository) CountActiveUserBranches(userID uint64) (int64, error) {
	var count int64
	err := r.db.Model(&models.UserBranchAccess{}).Where("user_id = ? AND status = ?", userID, "active").Count(&count).Error
	return count, err
}

func (r *UserBranchAccessRepository) HasActiveRolesInBranch(userID, branchID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBranchSoftwareRole{}).Where("user_id = ? AND branch_id = ? AND status = ?", userID, branchID, "active").Count(&count).Error
	return count > 0, err
}
