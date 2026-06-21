package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type AccountingPeriodRepository struct {
	db *gorm.DB
}

func NewAccountingPeriodRepository(db *gorm.DB) *AccountingPeriodRepository {
	return &AccountingPeriodRepository{db: db}
}

func (r *AccountingPeriodRepository) Create(ap *models.AccountingPeriod) error {
	return r.db.Create(ap).Error
}

func (r *AccountingPeriodRepository) Update(ap *models.AccountingPeriod) error {
	return r.db.Save(ap).Error
}

func (r *AccountingPeriodRepository) FindByID(companyID, id uint64) (*models.AccountingPeriod, error) {
	var ap models.AccountingPeriod
	err := r.db.Preload("FinancialYear").Where("company_id = ? AND id = ?", companyID, id).First(&ap).Error
	if err != nil {
		return nil, err
	}
	return &ap, nil
}

func (r *AccountingPeriodRepository) List(companyID, financialYearID uint64, status string, search string, page, limit int) ([]models.AccountingPeriod, int64, error) {
	var periods []models.AccountingPeriod
	var total int64

	query := r.db.Model(&models.AccountingPeriod{}).Where("company_id = ?", companyID)

	if financialYearID > 0 {
		query = query.Where("financial_year_id = ?", financialYearID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Where("period_name LIKE ?", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Preload("FinancialYear").Order("start_date ASC").Offset(offset).Limit(limit).Find(&periods).Error

	return periods, total, err
}

func (r *AccountingPeriodRepository) CountUnclosedPeriods(companyID, financialYearID uint64) (int64, error) {
	var count int64
	err := r.db.Model(&models.AccountingPeriod{}).
		Where("company_id = ? AND financial_year_id = ? AND is_closed = ?", companyID, financialYearID, false).
		Count(&count).Error
	return count, err
}
