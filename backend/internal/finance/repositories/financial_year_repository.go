package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type FinancialYearRepository struct {
	db *gorm.DB
}

func NewFinancialYearRepository(db *gorm.DB) *FinancialYearRepository {
	return &FinancialYearRepository{db: db}
}

func (r *FinancialYearRepository) Create(fy *models.FinancialYear) error {
	return r.db.Create(fy).Error
}

func (r *FinancialYearRepository) Update(fy *models.FinancialYear) error {
	return r.db.Save(fy).Error
}

func (r *FinancialYearRepository) FindByID(companyID, id uint64) (*models.FinancialYear, error) {
	var fy models.FinancialYear
	err := r.db.Where("company_id = ? AND id = ?", companyID, id).First(&fy).Error
	if err != nil {
		return nil, err
	}
	return &fy, nil
}

func (r *FinancialYearRepository) FindActiveByCompany(companyID uint64) (*models.FinancialYear, error) {
	var fy models.FinancialYear
	err := r.db.Where("company_id = ? AND is_active = ?", companyID, true).First(&fy).Error
	if err != nil {
		return nil, err
	}
	return &fy, nil
}

func (r *FinancialYearRepository) List(companyID uint64, status string, search string, page, limit int) ([]models.FinancialYear, int64, error) {
	var years []models.FinancialYear
	var total int64

	query := r.db.Model(&models.FinancialYear{}).Where("company_id = ?", companyID)

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Where("year_name LIKE ?", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Order("start_date DESC").Offset(offset).Limit(limit).Find(&years).Error

	return years, total, err
}

func (r *FinancialYearRepository) DeactivateAll(companyID uint64) error {
	return r.db.Model(&models.FinancialYear{}).
		Where("company_id = ?", companyID).
		Update("is_active", false).Error
}

func (r *FinancialYearRepository) BeginTransaction() *gorm.DB {
	return r.db.Begin()
}
