package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserSoftwareAccessRepository struct {
	db *gorm.DB
}

func NewUserSoftwareAccessRepository(db *gorm.DB) *UserSoftwareAccessRepository {
	return &UserSoftwareAccessRepository{db: db}
}

func (r *UserSoftwareAccessRepository) FindUserSoftwareAccess(userID uint64) ([]models.UserSoftwareAccess, error) {
	var accesses []models.UserSoftwareAccess
	if err := r.db.Preload("Software").Where("user_id = ?", userID).Find(&accesses).Error; err != nil {
		return nil, err
	}
	return accesses, nil
}

func (r *UserSoftwareAccessRepository) FindUserSoftwareByID(userID, softwareID uint64) (*models.UserSoftwareAccess, error) {
	var access models.UserSoftwareAccess
	if err := r.db.Where("user_id = ? AND software_id = ?", userID, softwareID).First(&access).Error; err != nil {
		return nil, err
	}
	return &access, nil
}

func (r *UserSoftwareAccessRepository) CreateOrUpdateUserSoftwareAccess(access *models.UserSoftwareAccess) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "software_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"can_access", "status"}),
	}).Create(access).Error
}

func (r *UserSoftwareAccessRepository) RemoveUserSoftwareAccess(userID, softwareID uint64) error {
	return r.db.Model(&models.UserSoftwareAccess{}).
		Where("user_id = ? AND software_id = ?", userID, softwareID).
		Updates(map[string]interface{}{"status": "inactive", "can_access": false}).Error
}

func (r *UserSoftwareAccessRepository) CountActiveUserSoftware(userID uint64) (int64, error) {
	var count int64
	err := r.db.Model(&models.UserSoftwareAccess{}).Where("user_id = ? AND status = ? AND can_access = ?", userID, "active", true).Count(&count).Error
	return count, err
}

func (r *UserSoftwareAccessRepository) HasActiveRolesInSoftware(userID, softwareID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBranchSoftwareRole{}).Where("user_id = ? AND software_id = ? AND status = ?", userID, softwareID, "active").Count(&count).Error
	return count > 0, err
}
