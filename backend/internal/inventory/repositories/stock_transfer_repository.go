package repositories

import (
	"errors"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type StockTransferRepository interface {
	FindStockTransfers(db *gorm.DB, companyID uint64, filters dto.ListStockTransfersFilters) ([]models.StockTransfer, int64, error)
	FindStockTransferByID(db *gorm.DB, companyID, id uint64) (*models.StockTransfer, error)
	CreateStockTransferWithLines(db *gorm.DB, transfer *models.StockTransfer) error
	UpdateStockTransferWithLines(db *gorm.DB, transfer *models.StockTransfer) error
	SoftDeleteStockTransfer(db *gorm.DB, transfer *models.StockTransfer) error
	UpdateStockTransferStatus(db *gorm.DB, transfer *models.StockTransfer) error
	CreateStockTransferApprovalRecord(db *gorm.DB, approval *models.StockTransferApproval) error
	GetLastStockTransferNumber(db *gorm.DB, companyID uint64) (string, error)
	CheckStockTransferLedgerExists(db *gorm.DB, companyID, transferID uint64) (bool, error)
}

type stockTransferRepository struct{}

func NewStockTransferRepository() StockTransferRepository {
	return &stockTransferRepository{}
}

func (r *stockTransferRepository) FindStockTransfers(db *gorm.DB, companyID uint64, filters dto.ListStockTransfersFilters) ([]models.StockTransfer, int64, error) {
	var transfers []models.StockTransfer
	var total int64

	query := db.Model(&models.StockTransfer{}).
		Preload("FromWarehouse").
		Preload("ToWarehouse").
		Where("company_id = ?", companyID)

	if filters.BranchID != nil {
		query = query.Where("branch_id = ?", *filters.BranchID)
	}
	if filters.FromWarehouseID != nil {
		query = query.Where("from_warehouse_id = ?", *filters.FromWarehouseID)
	}
	if filters.ToWarehouseID != nil {
		query = query.Where("to_warehouse_id = ?", *filters.ToWarehouseID)
	}
	if filters.FinancialYearID != nil {
		query = query.Where("financial_year_id = ?", *filters.FinancialYearID)
	}
	if filters.AccountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *filters.AccountingPeriodID)
	}
	if filters.ApprovalStatus != "" {
		query = query.Where("approval_status = ?", filters.ApprovalStatus)
	}
	if filters.PostedStatus != "" {
		query = query.Where("posted_status = ?", filters.PostedStatus)
	}
	if filters.TransferDateFrom != "" {
		query = query.Where("transfer_date >= ?", filters.TransferDateFrom)
	}
	if filters.TransferDateTo != "" {
		query = query.Where("transfer_date <= ?", filters.TransferDateTo)
	}
	if filters.Search != "" {
		search := "%" + filters.Search + "%"
		query = query.Where("transfer_number LIKE ? OR reference_number LIKE ? OR remarks LIKE ?", search, search, search)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (filters.Page - 1) * filters.Limit
	err = query.Order("created_at DESC").Offset(offset).Limit(filters.Limit).Find(&transfers).Error
	if err != nil {
		return nil, 0, err
	}

	return transfers, total, nil
}

func (r *stockTransferRepository) FindStockTransferByID(db *gorm.DB, companyID, id uint64) (*models.StockTransfer, error) {
	var transfer models.StockTransfer
	err := db.Preload("FromWarehouse").
		Preload("ToWarehouse").
		Preload("Lines").
		Preload("Lines.Product").
		Preload("Lines.ProductBatch").
		Preload("Lines.FromWarehouseLocation").
		Preload("Lines.ToWarehouseLocation").
		Preload("Approvals", func(db *gorm.DB) *gorm.DB {
			return db.Order("action_at DESC")
		}).
		Where("id = ? AND company_id = ?", id, companyID).
		First(&transfer).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &transfer, nil
}

func (r *stockTransferRepository) CreateStockTransferWithLines(db *gorm.DB, transfer *models.StockTransfer) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(transfer).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *stockTransferRepository) UpdateStockTransferWithLines(db *gorm.DB, transfer *models.StockTransfer) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("stock_transfer_id = ?", transfer.ID).Delete(&models.StockTransferLine{}).Error; err != nil {
			return err
		}

		if err := tx.Save(transfer).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *stockTransferRepository) SoftDeleteStockTransfer(db *gorm.DB, transfer *models.StockTransfer) error {
	return db.Delete(transfer).Error
}

func (r *stockTransferRepository) UpdateStockTransferStatus(db *gorm.DB, transfer *models.StockTransfer) error {
	return db.Model(transfer).Select("ApprovalStatus", "ApprovedBy", "ApprovedAt", "PostedStatus", "PostedBy", "PostedAt", "UpdatedBy").Updates(transfer).Error
}

func (r *stockTransferRepository) CreateStockTransferApprovalRecord(db *gorm.DB, approval *models.StockTransferApproval) error {
	return db.Create(approval).Error
}

func (r *stockTransferRepository) GetLastStockTransferNumber(db *gorm.DB, companyID uint64) (string, error) {
	var lastTransfer models.StockTransfer
	err := db.Where("company_id = ?", companyID).
		Order("id desc").
		First(&lastTransfer).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}

	return lastTransfer.TransferNumber, nil
}

func (r *stockTransferRepository) CheckStockTransferLedgerExists(db *gorm.DB, companyID, transferID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).
		Where("company_id = ? AND source_type = ? AND source_id = ?", companyID, "stock_transfer", transferID).
		Count(&count).Error

	if err != nil {
		return false, err
	}
	return count > 0, nil
}
