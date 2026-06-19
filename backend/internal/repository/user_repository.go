package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// UserRepository handles user data access.
type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByID returns a user by ID with roles preloaded.
func (r *UserRepository) FindByID(id uint64) (*model.User, error) {
	var user model.User
	err := r.db.Preload("Roles").Preload("Roles.Permissions").Preload("Designation").
		First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail returns a user by email (for login).
func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Preload("Roles").Preload("Roles.Permissions").Preload("Designation").
		Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// List returns paginated users scoped by company.
func (r *UserRepository) List(companyID uint64, req *dto.PaginationRequest) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := r.db.Model(&model.User{}).
		Scopes(model.ScopeByCompany(companyID)).
		Select("id, company_id, branch_id, designation_id, email, full_name, phone, is_active, created_at, updated_at").
		Preload("Designation").Preload("Roles")

	if req.Search != "" {
		query = query.Where("full_name LIKE ? OR email LIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &users, &total)
	return users, total, err
}

// Create creates a new user. Accepts *gorm.DB for transaction support.
func (r *UserRepository) Create(db *gorm.DB, user *model.User) error {
	if db == nil {
		db = r.db
	}
	return db.Create(user).Error
}

// Update updates user fields. Accepts *gorm.DB for transaction support.
func (r *UserRepository) Update(db *gorm.DB, user *model.User) error {
	if db == nil {
		db = r.db
	}
	return db.Save(user).Error
}

// Delete soft-deletes a user.
func (r *UserRepository) Delete(id uint64) error {
	return r.db.Delete(&model.User{}, id).Error
}

// AssignRoles replaces user's roles with the given role IDs.
func (r *UserRepository) AssignRoles(db *gorm.DB, userID uint64, roleIDs []uint64) error {
	if db == nil {
		db = r.db
	}
	var user model.User
	user.ID = userID

	var roles []model.Role
	for _, id := range roleIDs {
		roles = append(roles, model.Role{BaseModel: model.BaseModel{ID: id}})
	}

	return db.Model(&user).Association("Roles").Replace(roles)
}

// EmailExists checks if an email is already registered (excluding a specific user ID).
func (r *UserRepository) EmailExists(email string, excludeID uint64) (bool, error) {
	var count int64
	query := r.db.Model(&model.User{}).Where("email = ?", email)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}
