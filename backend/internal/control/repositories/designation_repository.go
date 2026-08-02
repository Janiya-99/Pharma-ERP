package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type DesignationRepository struct {
	db *gorm.DB
}

func NewDesignationRepository(db *gorm.DB) *DesignationRepository {
	return &DesignationRepository{db: db}
}

func (r *DesignationRepository) List(status, search string, offset, limit int) ([]models.Designation, int64, error) {
	var desigs []models.Designation
	var count int64

	query := r.db.Model(&models.Designation{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("designation_name LIKE ?", searchPattern)
	}

	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&desigs).Error; err != nil {
		return nil, 0, err
	}

	return desigs, count, nil
}

func (r *DesignationRepository) GetByID(id uint64) (*models.Designation, error) {
	var desig models.Designation
	if err := r.db.First(&desig, id).Error; err != nil {
		return nil, err
	}
	return &desig, nil
}

func (r *DesignationRepository) GetByName(name string) (*models.Designation, error) {
	var desig models.Designation
	if err := r.db.Where("designation_name = ?", name).First(&desig).Error; err != nil {
		return nil, err
	}
	return &desig, nil
}

func (r *DesignationRepository) Create(desig *models.Designation) error {
	return r.db.Create(desig).Error
}

func (r *DesignationRepository) Update(desig *models.Designation) error {
	return r.db.Save(desig).Error
}

func (r *DesignationRepository) SoftDelete(id uint64) error {
	return r.db.Delete(&models.Designation{}, id).Error
}

func (r *DesignationRepository) HasActiveUsers(desigID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("designation_id = ? AND status = ?", desigID, "active").Count(&count).Error
	return count > 0, err
}
