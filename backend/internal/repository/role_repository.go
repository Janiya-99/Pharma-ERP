package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// RoleRepository handles role and permission data access.
type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) FindByID(id uint64) (*model.Role, error) {
	var role model.Role
	err := r.db.Preload("Permissions").First(&role, id).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) List(companyID uint64, req *dto.PaginationRequest) ([]model.Role, int64, error) {
	var roles []model.Role
	var total int64

	query := r.db.Model(&model.Role{}).
		Scopes(model.ScopeByCompany(companyID)).
		Preload("Permissions")

	if req.Search != "" {
		query = query.Where("name LIKE ?", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &roles, &total)
	return roles, total, err
}

func (r *RoleRepository) Create(db *gorm.DB, role *model.Role) error {
	if db == nil {
		db = r.db
	}
	return db.Create(role).Error
}

func (r *RoleRepository) Update(db *gorm.DB, role *model.Role) error {
	if db == nil {
		db = r.db
	}
	return db.Save(role).Error
}

func (r *RoleRepository) Delete(id uint64) error {
	return r.db.Delete(&model.Role{}, id).Error
}

// AssignPermissions replaces a role's permissions.
func (r *RoleRepository) AssignPermissions(db *gorm.DB, roleID uint64, permissionIDs []uint64) error {
	if db == nil {
		db = r.db
	}
	var role model.Role
	role.ID = roleID

	var perms []model.Permission
	for _, id := range permissionIDs {
		perms = append(perms, model.Permission{ID: id})
	}

	return db.Model(&role).Association("Permissions").Replace(perms)
}

// GetAllPermissions returns all available permissions.
func (r *RoleRepository) GetAllPermissions() ([]model.Permission, error) {
	var perms []model.Permission
	err := r.db.Order("module, resource, action").Find(&perms).Error
	return perms, err
}

// GetPermissionsByUserID returns all permission slugs for a user (via their roles).
func (r *RoleRepository) GetPermissionsByUserID(userID uint64) ([]string, error) {
	var slugs []string
	err := r.db.Model(&model.Permission{}).
		Joins("JOIN role_permissions ON role_permissions.permission_id = permissions.id").
		Joins("JOIN user_roles ON user_roles.role_id = role_permissions.role_id").
		Where("user_roles.user_id = ?", userID).
		Distinct().
		Pluck("permissions.slug", &slugs).Error
	return slugs, err
}

// SlugExists checks if a role slug already exists within a company.
func (r *RoleRepository) SlugExists(companyID uint64, slug string, excludeID uint64) (bool, error) {
	var count int64
	query := r.db.Model(&model.Role{}).
		Where("company_id = ? AND slug = ?", companyID, slug)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}
