package repositories

import (
	"strings"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type StockAdjustmentRepository interface {
	FindStockAdjustments(db *gorm.DB, companyID uint64, branchID *uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockAdjustment, int64, error)
	FindStockAdjustmentByID(db *gorm.DB, id uint64, companyID uint64) (*models.StockAdjustment, error)
	CreateStockAdjustmentWithLines(db *gorm.DB, adjustment *models.StockAdjustment, lines []models.StockAdjustmentLine) error
	UpdateStockAdjustmentWithLines(db *gorm.DB, adjustment *models.StockAdjustment, lines []models.StockAdjustmentLine) error
	SoftDeleteStockAdjustment(db *gorm.DB, id uint64, companyID uint64, deletedBy uint64) error
	UpdateStockAdjustmentStatus(db *gorm.DB, id uint64, companyID uint64, updates map[string]interface{}) error
	CreateStockAdjustmentApprovalRecord(db *gorm.DB, record *models.StockAdjustmentApproval) error
	GetLastStockAdjustmentNumber(db *gorm.DB, companyID uint64) (string, error)
	CheckStockAdjustmentLedgerExists(db *gorm.DB, companyID uint64, adjustmentID uint64) (bool, error)
}

type stockAdjustmentRepository struct{}

func NewStockAdjustmentRepository() StockAdjustmentRepository {
	return &stockAdjustmentRepository{}
}

func (r *stockAdjustmentRepository) FindStockAdjustments(db *gorm.DB, companyID uint64, branchID *uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockAdjustment, int64, error) {
	var adjustments []models.StockAdjustment
	var total int64

	query := db.Model(&models.StockAdjustment{}).
		Preload("Branch").
		Preload("Warehouse").
		Where("company_id = ?", companyID)

	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	}

	if val, ok := filters["warehouse_id"]; ok {
		query = query.Where("warehouse_id = ?", val)
	}
	if val, ok := filters["financial_year_id"]; ok {
		query = query.Where("financial_year_id = ?", val)
	}
	if val, ok := filters["accounting_period_id"]; ok {
		query = query.Where("accounting_period_id = ?", val)
	}
	if val, ok := filters["adjustment_type"]; ok {
		query = query.Where("adjustment_type = ?", val)
	}
	if val, ok := filters["approval_status"]; ok {
		query = query.Where("approval_status = ?", val)
	}
	if val, ok := filters["posted_status"]; ok {
		query = query.Where("posted_status = ?", val)
	}
	if val, ok := filters["adjustment_date_from"]; ok {
		query = query.Where("adjustment_date >= ?", val)
	}
	if val, ok := filters["adjustment_date_to"]; ok {
		query = query.Where("adjustment_date <= ?", val)
	}

	if search != "" {
		searchStr := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(adjustment_number) LIKE ? OR LOWER(reference_number) LIKE ? OR LOWER(reason) LIKE ? OR LOWER(remarks) LIKE ?", searchStr, searchStr, searchStr, searchStr)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&adjustments).Error

	return adjustments, total, err
}

func (r *stockAdjustmentRepository) FindStockAdjustmentByID(db *gorm.DB, id uint64, companyID uint64) (*models.StockAdjustment, error) {
	var adjustment models.StockAdjustment
	err := db.Preload("Branch").
		Preload("Warehouse").
		Preload("Lines.Product").
		Preload("Lines.ProductBatch").
		Preload("Lines.WarehouseLocation").
		Preload("ApprovalHistory.ActionByUser").
		Where("id = ? AND company_id = ?", id, companyID).
		First(&adjustment).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &adjustment, nil
}

func (r *stockAdjustmentRepository) CreateStockAdjustmentWithLines(db *gorm.DB, adjustment *models.StockAdjustment, lines []models.StockAdjustmentLine) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(adjustment).Error; err != nil {
			return err
		}

		for i := range lines {
			lines[i].StockAdjustmentID = adjustment.ID
			if err := tx.Create(&lines[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *stockAdjustmentRepository) UpdateStockAdjustmentWithLines(db *gorm.DB, adjustment *models.StockAdjustment, lines []models.StockAdjustmentLine) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// Soft delete existing lines
		if err := tx.Where("stock_adjustment_id = ?", adjustment.ID).Delete(&models.StockAdjustmentLine{}).Error; err != nil {
			return err
		}

		// Update header
		if err := tx.Save(adjustment).Error; err != nil {
			return err
		}

		// Insert new lines
		for i := range lines {
			lines[i].StockAdjustmentID = adjustment.ID
			lines[i].ID = 0 // Ensure it gets a new ID, depending on soft delete nature (if we didn't soft delete, we'd do unscoped delete, but gorm deletes physically if there's no DeletedAt in lines) Wait, StockAdjustmentLine has no DeletedAt! So the Delete above was a hard delete. Which is fine.
			if err := tx.Create(&lines[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *stockAdjustmentRepository) SoftDeleteStockAdjustment(db *gorm.DB, id uint64, companyID uint64, deletedBy uint64) error {
	return db.Model(&models.StockAdjustment{}).
		Where("id = ? AND company_id = ?", id, companyID).
		Updates(map[string]interface{}{
			"status":     "deleted",
			"updated_by": deletedBy,
			"deleted_at": gorm.Expr("NOW()"),
		}).Error
}

func (r *stockAdjustmentRepository) UpdateStockAdjustmentStatus(db *gorm.DB, id uint64, companyID uint64, updates map[string]interface{}) error {
	return db.Model(&models.StockAdjustment{}).
		Where("id = ? AND company_id = ?", id, companyID).
		Updates(updates).Error
}

func (r *stockAdjustmentRepository) CreateStockAdjustmentApprovalRecord(db *gorm.DB, record *models.StockAdjustmentApproval) error {
	return db.Create(record).Error
}

func (r *stockAdjustmentRepository) GetLastStockAdjustmentNumber(db *gorm.DB, companyID uint64) (string, error) {
	var adjustment models.StockAdjustment
	err := db.Unscoped().Where("company_id = ?", companyID).Order("id desc").First(&adjustment).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return adjustment.AdjustmentNumber, nil
}

func (r *stockAdjustmentRepository) CheckStockAdjustmentLedgerExists(db *gorm.DB, companyID uint64, adjustmentID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).
		Where("company_id = ? AND source_type = 'stock_adjustment' AND source_id = ?", companyID, adjustmentID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
