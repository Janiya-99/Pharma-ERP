package repositories

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type SalesReturnRepository interface {
	FindSalesReturns(db *gorm.DB, companyID uint64, filter dto.SalesReturnFilter) ([]models.SalesReturn, int64, error)
	FindSalesReturnByID(db *gorm.DB, companyID, id uint64) (*models.SalesReturn, error)
	CreateSalesReturnWithLines(db *gorm.DB, salesReturn *models.SalesReturn) error
	UpdateSalesReturnWithLines(db *gorm.DB, salesReturn *models.SalesReturn) error
	SoftDeleteSalesReturn(db *gorm.DB, companyID, id uint64, deletedBy uint64) error
	UpdateSalesReturnStatus(db *gorm.DB, id uint64, fields map[string]interface{}) error
	CreateSalesReturnApprovalRecord(db *gorm.DB, approval *models.SalesReturnApproval) error
	GetLastSalesReturnNumber(db *gorm.DB, companyID uint64, yearMonthPrefix string) (string, error)
	CheckSalesReturnLedgerExists(db *gorm.DB, companyID, returnID uint64) (bool, error)
}

type salesReturnRepository struct{}

func NewSalesReturnRepository() SalesReturnRepository {
	return &salesReturnRepository{}
}

func (r *salesReturnRepository) FindSalesReturns(db *gorm.DB, companyID uint64, filter dto.SalesReturnFilter) ([]models.SalesReturn, int64, error) {
	query := db.Model(&models.SalesReturn{}).Where("company_id = ?", companyID)

	if filter.BranchID != nil {
		query = query.Where("branch_id = ?", *filter.BranchID)
	}
	if filter.WarehouseID != nil {
		query = query.Where("warehouse_id = ?", *filter.WarehouseID)
	}
	if filter.FinancialYearID != nil {
		query = query.Where("financial_year_id = ?", *filter.FinancialYearID)
	}
	if filter.AccountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *filter.AccountingPeriodID)
	}
	if filter.ApprovalStatus != nil {
		query = query.Where("approval_status = ?", *filter.ApprovalStatus)
	}
	if filter.PostedStatus != nil {
		query = query.Where("posted_status = ?", *filter.PostedStatus)
	}
	if filter.ReturnReason != nil {
		query = query.Where("return_reason = ?", *filter.ReturnReason)
	}
	if filter.ReturnCondition != nil {
		query = query.Where("return_condition = ?", *filter.ReturnCondition)
	}
	if filter.DateFrom != nil {
		query = query.Where("sales_return_date >= ?", *filter.DateFrom)
	}
	if filter.DateTo != nil {
		query = query.Where("sales_return_date <= ?", *filter.DateTo)
	}

	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("(sales_return_number LIKE ? OR customer_name LIKE ? OR customer_contact_number LIKE ? OR sales_invoice_number LIKE ? OR customer_credit_note_number LIKE ? OR reference_number LIKE ? OR remarks LIKE ?)",
			searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.Page > 0 && filter.Limit > 0 {
		offset := (filter.Page - 1) * filter.Limit
		query = query.Offset(offset).Limit(filter.Limit)
	}

	var returns []models.SalesReturn
	err := query.Preload("Warehouse").Order("created_at desc").Find(&returns).Error
	return returns, total, err
}

func (r *salesReturnRepository) FindSalesReturnByID(db *gorm.DB, companyID, id uint64) (*models.SalesReturn, error) {
	var salesReturn models.SalesReturn
	err := db.Where("company_id = ? AND id = ?", companyID, id).
		Preload("Warehouse").
		Preload("Lines", func(db *gorm.DB) *gorm.DB {
			return db.Order("line_order asc")
		}).
		Preload("Lines.Product").
		Preload("Lines.ProductBatch").
		Preload("Lines.WarehouseLocation").
		Preload("Approvals", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at desc")
		}).
		First(&salesReturn).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &salesReturn, err
}

func (r *salesReturnRepository) CreateSalesReturnWithLines(db *gorm.DB, salesReturn *models.SalesReturn) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(salesReturn).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *salesReturnRepository) UpdateSalesReturnWithLines(db *gorm.DB, salesReturn *models.SalesReturn) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// Delete existing lines
		if err := tx.Where("sales_return_id = ?", salesReturn.ID).Delete(&models.SalesReturnLine{}).Error; err != nil {
			return err
		}

		// Save the header and new lines
		if err := tx.Save(salesReturn).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *salesReturnRepository) SoftDeleteSalesReturn(db *gorm.DB, companyID, id uint64, deletedBy uint64) error {
	return db.Model(&models.SalesReturn{}).
		Where("company_id = ? AND id = ?", companyID, id).
		Updates(map[string]interface{}{
			"status":     "deleted",
			"updated_by": deletedBy,
			"deleted_at": time.Now(),
		}).Error
}

func (r *salesReturnRepository) UpdateSalesReturnStatus(db *gorm.DB, id uint64, fields map[string]interface{}) error {
	return db.Model(&models.SalesReturn{}).Where("id = ?", id).Updates(fields).Error
}

func (r *salesReturnRepository) CreateSalesReturnApprovalRecord(db *gorm.DB, approval *models.SalesReturnApproval) error {
	return db.Create(approval).Error
}

func (r *salesReturnRepository) GetLastSalesReturnNumber(db *gorm.DB, companyID uint64, yearMonthPrefix string) (string, error) {
	var lastRecord models.SalesReturn
	err := db.Where("company_id = ? AND sales_return_number LIKE ?", companyID, yearMonthPrefix+"%").
		Order("sales_return_number desc").
		First(&lastRecord).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", nil
	}
	if err != nil {
		return "", err
	}

	return lastRecord.SalesReturnNumber, nil
}

func (r *salesReturnRepository) CheckSalesReturnLedgerExists(db *gorm.DB, companyID, returnID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).
		Where("company_id = ? AND source_type = ? AND source_id = ?", companyID, "sales_return", returnID).
		Count(&count).Error
	return count > 0, err
}
