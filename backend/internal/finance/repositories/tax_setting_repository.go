package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type TaxSettingRepository struct {
	db *gorm.DB
}

func NewTaxSettingRepository(db *gorm.DB) *TaxSettingRepository {
	return &TaxSettingRepository{db: db}
}

func (r *TaxSettingRepository) List(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.TaxSetting, int64, error) {
	var settings []models.TaxSetting
	var total int64

	query := r.db.Model(&models.TaxSetting{}).Where("company_id = ?", companyID)

	if status, ok := filters["status"]; ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("tax_code LIKE ? OR tax_name LIKE ? OR description LIKE ?", searchStr, searchStr, searchStr)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Preload("TaxAccount").Limit(limit).Offset(offset).Order("tax_code asc").Find(&settings).Error

	return settings, total, err
}

func (r *TaxSettingRepository) FindByID(companyID, id uint64) (*models.TaxSetting, error) {
	var setting models.TaxSetting
	err := r.db.Preload("TaxAccount").Where("company_id = ? AND id = ?", companyID, id).First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

func (r *TaxSettingRepository) Create(setting *models.TaxSetting) error {
	return r.db.Create(setting).Error
}

func (r *TaxSettingRepository) Update(setting *models.TaxSetting) error {
	return r.db.Save(setting).Error
}
