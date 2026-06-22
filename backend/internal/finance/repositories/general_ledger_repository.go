package repositories

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type GeneralLedgerRepository struct {
	db *gorm.DB
}

func NewGeneralLedgerRepository(db *gorm.DB) *GeneralLedgerRepository {
	return &GeneralLedgerRepository{db: db}
}

func (r *GeneralLedgerRepository) CreateLedgerEntriesTx(tx *gorm.DB, entries []models.GeneralLedgerEntry) error {
	if len(entries) == 0 {
		return nil
	}
	return tx.Create(&entries).Error
}

func (r *GeneralLedgerRepository) DeleteLedgerEntriesBySourceTx(tx *gorm.DB, companyID uint64, sourceType string, sourceID uint64) error {
	return tx.Unscoped().Where("company_id = ? AND source_type = ? AND source_id = ?", companyID, sourceType, sourceID).Delete(&models.GeneralLedgerEntry{}).Error
}

func (r *GeneralLedgerRepository) DeleteLedgerEntriesByFinancialYearTx(tx *gorm.DB, companyID, financialYearID uint64) error {
	return tx.Unscoped().Where("company_id = ? AND financial_year_id = ?", companyID, financialYearID).Delete(&models.GeneralLedgerEntry{}).Error
}

func (r *GeneralLedgerRepository) List(companyID uint64, filters map[string]interface{}, search string, dateFrom, dateTo *time.Time, page, limit int) ([]models.GeneralLedgerEntry, int64, error) {
	var entries []models.GeneralLedgerEntry
	var total int64

	query := r.db.Model(&models.GeneralLedgerEntry{}).Where("company_id = ?", companyID)

	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if dateFrom != nil {
		query = query.Where("transaction_date >= ?", *dateFrom)
	}
	if dateTo != nil {
		query = query.Where("transaction_date <= ?", *dateTo)
	}

	if search != "" {
		searchStr := "%" + search + "%"
		query = query.Where(
			"source_number LIKE ? OR reference_number LIKE ? OR account_code LIKE ? OR account_name LIKE ? OR description LIKE ?",
			searchStr, searchStr, searchStr, searchStr, searchStr,
		)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Order("transaction_date DESC, id DESC").Limit(limit).Offset(offset).Find(&entries).Error; err != nil {
		return nil, 0, err
	}

	return entries, total, nil
}

func (r *GeneralLedgerRepository) GetLedgerEntriesByAccountAndFinancialYearTx(tx *gorm.DB, companyID, accountID, financialYearID uint64) ([]models.GeneralLedgerEntry, error) {
	var entries []models.GeneralLedgerEntry
	err := tx.Where("company_id = ? AND account_id = ? AND financial_year_id = ?", companyID, accountID, financialYearID).
		Order("transaction_date ASC, id ASC").
		Find(&entries).Error
	return entries, err
}

func (r *GeneralLedgerRepository) UpdateLedgerEntryTx(tx *gorm.DB, entry *models.GeneralLedgerEntry) error {
	return tx.Save(entry).Error
}

func (r *GeneralLedgerRepository) DB() *gorm.DB {
	return r.db
}
