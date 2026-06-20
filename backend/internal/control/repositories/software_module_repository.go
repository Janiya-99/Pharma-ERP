package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type SoftwareModuleRepository struct {
	db *gorm.DB
}

func NewSoftwareModuleRepository(db *gorm.DB) *SoftwareModuleRepository {
	return &SoftwareModuleRepository{db: db}
}

func (r *SoftwareModuleRepository) ListActive() ([]models.SoftwareModule, error) {
	var modules []models.SoftwareModule
	if err := r.db.Where("status = ?", "active").Find(&modules).Error; err != nil {
		return nil, err
	}
	return modules, nil
}
