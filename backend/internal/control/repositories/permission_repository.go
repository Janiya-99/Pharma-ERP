package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type PermissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) *PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) FindPermissions(softwareID string, softwareCode string, permissionGroup string, status string, search string, offset int, limit int) ([]models.Permission, int64, error) {
	var permissions []models.Permission
	var count int64

	query := r.db.Model(&models.Permission{}).Preload("Software")

	if softwareID != "" {
		query = query.Where("software_id = ?", softwareID)
	}

	if softwareCode != "" {
		query = query.Joins("JOIN software_modules sm ON sm.id = permissions.software_id").
			Where("sm.software_code = ?", softwareCode)
	}

	if permissionGroup != "" {
		query = query.Where("permissions.permission_group = ?", permissionGroup)
	}

	if status != "" {
		query = query.Where("permissions.status = ?", status)
	}

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("permissions.permission_name LIKE ? OR permissions.permission_key LIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&permissions).Error; err != nil {
		return nil, 0, err
	}

	return permissions, count, nil
}

func (r *PermissionRepository) FindPermissionsGrouped(softwareID string, softwareCode string) ([]models.Permission, error) {
	var permissions []models.Permission

	query := r.db.Model(&models.Permission{}).Preload("Software").Where("permissions.status = ?", "active")

	if softwareID != "" {
		query = query.Where("software_id = ?", softwareID)
	}

	if softwareCode != "" {
		query = query.Joins("JOIN software_modules sm ON sm.id = permissions.software_id").
			Where("sm.software_code = ?", softwareCode)
	}

	query = query.Order("permissions.permission_group ASC, permissions.id ASC")

	if err := query.Find(&permissions).Error; err != nil {
		return nil, err
	}

	return permissions, nil
}

func (r *PermissionRepository) FindPermissionsByIDs(ids []uint64) ([]models.Permission, error) {
	var permissions []models.Permission
	if len(ids) == 0 {
		return permissions, nil
	}
	if err := r.db.Where("id IN ?", ids).Find(&permissions).Error; err != nil {
		return nil, err
	}
	return permissions, nil
}
