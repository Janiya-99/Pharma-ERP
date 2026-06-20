package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) FindRoles(softwareID string, softwareCode string, status string, search string, offset int, limit int) ([]models.Role, int64, error) {
	var roles []models.Role
	var count int64

	query := r.db.Model(&models.Role{}).Preload("Software")

	if softwareID != "" {
		query = query.Where("software_id = ?", softwareID)
	}

	if softwareCode != "" {
		query = query.Joins("JOIN software_modules sm ON sm.id = roles.software_id").
			Where("sm.software_code = ?", softwareCode)
	}

	if status != "" {
		query = query.Where("roles.status = ?", status)
	}

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("roles.role_name LIKE ? OR roles.role_code LIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&roles).Error; err != nil {
		return nil, 0, err
	}

	return roles, count, nil
}

func (r *RoleRepository) FindRoleByID(id uint64) (*models.Role, error) {
	var role models.Role
	if err := r.db.Preload("Software").First(&role, id).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) FindRoleByCode(softwareID uint64, code string) (*models.Role, error) {
	var role models.Role
	if err := r.db.Where("software_id = ? AND role_code = ?", softwareID, code).First(&role).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) CreateRole(role *models.Role) error {
	return r.db.Create(role).Error
}

func (r *RoleRepository) UpdateRole(role *models.Role) error {
	return r.db.Save(role).Error
}

func (r *RoleRepository) SoftDeleteRole(id uint64) error {
	return r.db.Delete(&models.Role{}, id).Error
}

func (r *RoleRepository) CountActiveRoleAssignments(roleID uint64) (int64, error) {
	var count int64
	err := r.db.Model(&models.UserBranchSoftwareRole{}).Where("role_id = ? AND status = ?", roleID, "active").Count(&count).Error
	return count, err
}

func (r *RoleRepository) FindRolesBySoftware(softwareID uint64) ([]models.Role, error) {
	var roles []models.Role
	if err := r.db.Where("software_id = ? AND status = ?", softwareID, "active").Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}
