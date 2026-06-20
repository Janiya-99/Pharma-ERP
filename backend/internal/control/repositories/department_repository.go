package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type DepartmentRepository struct {
	db *gorm.DB
}

func NewDepartmentRepository(db *gorm.DB) *DepartmentRepository {
	return &DepartmentRepository{db: db}
}

func (r *DepartmentRepository) List(status, search string, offset, limit int) ([]models.Department, int64, error) {
	var depts []models.Department
	var count int64

	query := r.db.Model(&models.Department{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("department_code LIKE ? OR department_name LIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&depts).Error; err != nil {
		return nil, 0, err
	}

	return depts, count, nil
}

func (r *DepartmentRepository) GetByID(id uint64) (*models.Department, error) {
	var dept models.Department
	if err := r.db.First(&dept, id).Error; err != nil {
		return nil, err
	}
	return &dept, nil
}

func (r *DepartmentRepository) GetByName(name string) (*models.Department, error) {
	var dept models.Department
	if err := r.db.Where("department_name = ?", name).First(&dept).Error; err != nil {
		return nil, err
	}
	return &dept, nil
}

func (r *DepartmentRepository) Create(dept *models.Department) error {
	return r.db.Create(dept).Error
}

func (r *DepartmentRepository) Update(dept *models.Department) error {
	return r.db.Save(dept).Error
}

func (r *DepartmentRepository) SoftDelete(id uint64) error {
	return r.db.Delete(&models.Department{}, id).Error
}

func (r *DepartmentRepository) HasActiveUsers(deptID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("department_id = ? AND status = ?", deptID, "active").Count(&count).Error
	return count > 0, err
}
