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
	var count int64
	r.db.Model(&models.SoftwareModule{}).Where("software_code = ?", "ALL_MODULES").Count(&count)
	if count == 0 {
		allModule := models.SoftwareModule{
			SoftwareCode: "ALL_MODULES",
			SoftwareName: "All Modules (Global)",
			Description:  "Global access across all software modules and permissions",
			IconName:     "globe",
			RoutePath:    "/control-center",
			DisplayOrder: 0,
			Status:       "active",
		}
		r.db.Create(&allModule)
	}

	var modules []models.SoftwareModule
	if err := r.db.Where("status = ?", "active").Order("display_order ASC, id ASC").Find(&modules).Error; err != nil {
		return nil, err
	}
	return modules, nil
}

func (r *SoftwareModuleRepository) FindByID(id uint64) (*models.SoftwareModule, error) {
	var module models.SoftwareModule
	if err := r.db.First(&module, id).Error; err != nil {
		return nil, err
	}
	return &module, nil
}
