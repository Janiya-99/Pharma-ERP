package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type RolePermissionRepository struct {
	db *gorm.DB
}

func NewRolePermissionRepository(db *gorm.DB) *RolePermissionRepository {
	return &RolePermissionRepository{db: db}
}

func (r *RolePermissionRepository) FindRolePermissions(roleID uint64) ([]models.RolePermission, error) {
	var rolePermissions []models.RolePermission
	if err := r.db.Preload("Permission").Where("role_id = ?", roleID).Find(&rolePermissions).Error; err != nil {
		return nil, err
	}
	return rolePermissions, nil
}

func (r *RolePermissionRepository) DeleteRolePermissionsByRoleID(roleID uint64) error {
	return r.db.Where("role_id = ?", roleID).Delete(&models.RolePermission{}).Error
}

func (r *RolePermissionRepository) CreateRolePermissions(rolePermissions []models.RolePermission) error {
	if len(rolePermissions) == 0 {
		return nil
	}
	return r.db.Create(&rolePermissions).Error
}

func (r *RolePermissionRepository) ReplaceRolePermissions(roleID uint64, rolePermissions []models.RolePermission) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("role_id = ?", roleID).Delete(&models.RolePermission{}).Error; err != nil {
			return err
		}
		if len(rolePermissions) > 0 {
			if err := tx.Create(&rolePermissions).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
