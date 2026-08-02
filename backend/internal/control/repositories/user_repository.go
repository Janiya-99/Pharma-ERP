package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindUsers(search, departmentID, designationID, status, userType string, offset, limit int) ([]models.User, int64, error) {
	var users []models.User
	var count int64

	query := r.db.Model(&models.User{}).Preload("Department").Preload("Designation").Preload("DefaultBranch")

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("name LIKE ? OR email LIKE ? OR employee_code LIKE ?", searchPattern, searchPattern, searchPattern)
	}
	if departmentID != "" {
		query = query.Where("department_id = ?", departmentID)
	}
	if designationID != "" {
		query = query.Where("designation_id = ?", designationID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if userType != "" {
		query = query.Where("user_type = ?", userType)
	}

	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, count, nil
}

func (r *UserRepository) FindUserByID(id uint64) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Department").Preload("Designation").Preload("DefaultBranch").First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindUserByEmployeeCode(code string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("employee_code = ?", code).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) SoftDeleteUser(id uint64) error {
	return r.db.Delete(&models.User{}, id).Error
}

func (r *UserRepository) CountActiveSuperAdmins() (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("user_type = ? AND status = ?", "super_admin", "active").Count(&count).Error
	return count, err
}
