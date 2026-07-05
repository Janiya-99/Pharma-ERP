package repositories

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type OpeningStockRepository interface {
	FindOpeningStockEntries(db *gorm.DB, filter dto.OpeningStockFilter) ([]models.OpeningStockEntry, int64, error)
	FindOpeningStockEntryByID(db *gorm.DB, companyID, id uint64) (*models.OpeningStockEntry, error)
	CreateOpeningStockEntryWithLines(db *gorm.DB, entry *models.OpeningStockEntry) error
	UpdateOpeningStockEntryWithLines(db *gorm.DB, entry *models.OpeningStockEntry) error
	SoftDeleteOpeningStockEntry(db *gorm.DB, companyID, id uint64, deletedBy uint64) error
	UpdateOpeningStockStatus(db *gorm.DB, entry *models.OpeningStockEntry) error
	CreateOpeningStockApprovalRecord(db *gorm.DB, approval *models.OpeningStockEntryApproval) error
	GetLastOpeningStockNumber(db *gorm.DB, companyID uint64) (string, error)
	CheckOpeningStockLedgerExists(db *gorm.DB, companyID, sourceID uint64) (bool, error)
}

type openingStockRepository struct{}

func NewOpeningStockRepository() OpeningStockRepository {
	return &openingStockRepository{}
}

func (r *openingStockRepository) FindOpeningStockEntries(db *gorm.DB, filter dto.OpeningStockFilter) ([]models.OpeningStockEntry, int64, error) {
	var entries []models.OpeningStockEntry
	var total int64

	query := db.Model(&models.OpeningStockEntry{}).Where("company_id = ?", filter.CompanyID)

	if filter.BranchID > 0 {
		query = query.Where("branch_id = ?", filter.BranchID)
	}
	if filter.WarehouseID > 0 {
		query = query.Where("warehouse_id = ?", filter.WarehouseID)
	}
	if filter.FinancialYearID > 0 {
		query = query.Where("financial_year_id = ?", filter.FinancialYearID)
	}
	if filter.AccountingPeriodID > 0 {
		query = query.Where("accounting_period_id = ?", filter.AccountingPeriodID)
	}
	if filter.ApprovalStatus != "" {
		query = query.Where("approval_status = ?", filter.ApprovalStatus)
	}
	if filter.PostedStatus != "" {
		query = query.Where("posted_status = ?", filter.PostedStatus)
	}
	if filter.OpeningStockDateFrom != "" {
		query = query.Where("opening_stock_date >= ?", filter.OpeningStockDateFrom)
	}
	if filter.OpeningStockDateTo != "" {
		query = query.Where("opening_stock_date <= ?", filter.OpeningStockDateTo)
	}
	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("opening_stock_number LIKE ? OR reference_number LIKE ? OR remarks LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (filter.Page - 1) * filter.Limit
	err = query.Preload("Warehouse").Order("created_at desc").Offset(offset).Limit(filter.Limit).Find(&entries).Error

	return entries, total, err
}

func (r *openingStockRepository) FindOpeningStockEntryByID(db *gorm.DB, companyID, id uint64) (*models.OpeningStockEntry, error) {
	var entry models.OpeningStockEntry
	err := db.Preload("Warehouse").
		Preload("Lines").
		Preload("Lines.Product").
		Preload("Lines.ProductBatch").
		Preload("Lines.WarehouseLocation").
		Preload("Approvals").
		Where("company_id = ? AND id = ?", companyID, id).First(&entry).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &entry, nil
}

func (r *openingStockRepository) CreateOpeningStockEntryWithLines(db *gorm.DB, entry *models.OpeningStockEntry) error {
	return db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(entry).Error
	})
}

func (r *openingStockRepository) UpdateOpeningStockEntryWithLines(db *gorm.DB, entry *models.OpeningStockEntry) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// Delete existing lines
		if err := tx.Where("opening_stock_entry_id = ?", entry.ID).Delete(&models.OpeningStockEntryLine{}).Error; err != nil {
			return err
		}

		// Save entry header and new lines
		return tx.Save(entry).Error
	})
}

func (r *openingStockRepository) SoftDeleteOpeningStockEntry(db *gorm.DB, companyID, id uint64, deletedBy uint64) error {
	return db.Model(&models.OpeningStockEntry{}).
		Where("company_id = ? AND id = ?", companyID, id).
		Updates(map[string]interface{}{
			"updated_by": deletedBy,
			"updated_at": time.Now(),
			"deleted_at": time.Now(),
		}).Error
}

func (r *openingStockRepository) UpdateOpeningStockStatus(db *gorm.DB, entry *models.OpeningStockEntry) error {
	return db.Save(entry).Error
}

func (r *openingStockRepository) CreateOpeningStockApprovalRecord(db *gorm.DB, approval *models.OpeningStockEntryApproval) error {
	return db.Create(approval).Error
}

func (r *openingStockRepository) GetLastOpeningStockNumber(db *gorm.DB, companyID uint64) (string, error) {
	var lastEntry models.OpeningStockEntry
	err := db.Unscoped().Where("company_id = ?", companyID).Order("id desc").First(&lastEntry).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}
	return lastEntry.OpeningStockNumber, nil
}

func (r *openingStockRepository) CheckOpeningStockLedgerExists(db *gorm.DB, companyID, sourceID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).
		Where("company_id = ? AND source_type = 'opening_stock' AND source_id = ?", companyID, sourceID).
		Count(&count).Error
	return count > 0, err
}
