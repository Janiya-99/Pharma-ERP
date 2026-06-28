package repositories

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type GRNRepository interface {
	FindGRNs(db *gorm.DB, filter dto.GRNFilter) ([]dto.GRNResponse, int64, error)
	FindGRNByID(db *gorm.DB, companyID, id uint64) (*models.GoodsReceiptNote, error)
	GetLastGRNNumber(db *gorm.DB, companyID uint64) (string, error)

	CreateGRNWithLines(db *gorm.DB, grn *models.GoodsReceiptNote) error
	UpdateGRNWithLines(db *gorm.DB, grn *models.GoodsReceiptNote) error
	SoftDeleteGRN(db *gorm.DB, grn *models.GoodsReceiptNote) error

	UpdateGRNStatus(db *gorm.DB, companyID, id uint64, approvalStatus, postedStatus string, userID *uint64, actionAt *time.Time) error
	CreateGRNApprovalRecord(db *gorm.DB, approval *models.GoodsReceiptNoteApproval) error

	CheckGRNStockLedgerExists(db *gorm.DB, companyID, grnID uint64) (bool, error)
	FindOrCreateBatchFromGRNLine(tx *gorm.DB, companyID, productID uint64, batchNumber string, manufactureDate, expiryDate *time.Time, supplierID, manufacturerID uint64, purchaseRate, sellingPrice, mrp float64, createdBy uint64) (*models.ProductBatch, error)
	UpdateBatchPricesFromGRNLine(tx *gorm.DB, batchID uint64, purchaseRate, sellingPrice, mrp float64) error
}

type grnRepository struct{}

func NewGRNRepository() GRNRepository {
	return &grnRepository{}
}

func (r *grnRepository) FindGRNs(db *gorm.DB, filter dto.GRNFilter) ([]dto.GRNResponse, int64, error) {
	var grns []models.GoodsReceiptNote
	var total int64

	query := db.Model(&models.GoodsReceiptNote{}).Where("company_id = ?", filter.CompanyID)

	if filter.BranchID > 0 {
		query = query.Where("branch_id = ?", filter.BranchID)
	}
	if filter.SupplierID > 0 {
		query = query.Where("supplier_id = ?", filter.SupplierID)
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
	if filter.GRNDateFrom != "" {
		query = query.Where("grn_date >= ?", filter.GRNDateFrom)
	}
	if filter.GRNDateTo != "" {
		query = query.Where("grn_date <= ?", filter.GRNDateTo)
	}
	if filter.Search != "" {
		search := "%" + filter.Search + "%"
		query = query.Where("(grn_number LIKE ? OR supplier_invoice_number LIKE ? OR purchase_order_number LIKE ? OR reference_number LIKE ? OR remarks LIKE ?)", search, search, search, search, search)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (filter.Page - 1) * filter.Limit
	if err := query.Order("created_at desc").Offset(offset).Limit(filter.Limit).Find(&grns).Error; err != nil {
		return nil, 0, err
	}

	var responses []dto.GRNResponse
	for _, grn := range grns {
		responses = append(responses, dto.GRNResponse{
			ID:                    grn.ID,
			GRNNumber:             grn.GRNNumber,
			GRNDate:               grn.GRNDate,
			BranchID:              grn.BranchID,
			SupplierID:            grn.SupplierID,
			WarehouseID:           grn.WarehouseID,
			SupplierInvoiceNumber: grn.SupplierInvoiceNumber,
			TotalQuantity:         grn.TotalQuantity,
			TotalFreeQuantity:     grn.TotalFreeQuantity,
			TotalStockQuantity:    grn.TotalStockQuantity,
			TotalAmount:           grn.TotalAmount,
			ApprovalStatus:        grn.ApprovalStatus,
			PostedStatus:          grn.PostedStatus,
			CreatedBy:             grn.CreatedBy,
			CreatedAt:             grn.CreatedAt,
		})
	}

	return responses, total, nil
}

func (r *grnRepository) FindGRNByID(db *gorm.DB, companyID, id uint64) (*models.GoodsReceiptNote, error) {
	var grn models.GoodsReceiptNote
	err := db.Preload("Branch").
		Preload("Supplier").
		Preload("Warehouse").
		Preload("Lines.Product.BaseUnit").
		Preload("Lines.ProductBatch").
		Preload("Lines.WarehouseLocation").
		Preload("Approvals.User").
		Where("company_id = ? AND id = ?", companyID, id).
		First(&grn).Error
	if err != nil {
		return nil, err
	}
	return &grn, nil
}

func (r *grnRepository) GetLastGRNNumber(db *gorm.DB, companyID uint64) (string, error) {
	var grn models.GoodsReceiptNote
	err := db.Where("company_id = ?", companyID).Order("id desc").First(&grn).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}
	return grn.GRNNumber, nil
}

func (r *grnRepository) CreateGRNWithLines(db *gorm.DB, grn *models.GoodsReceiptNote) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(grn).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *grnRepository) UpdateGRNWithLines(db *gorm.DB, grn *models.GoodsReceiptNote) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("goods_receipt_note_id = ?", grn.ID).Delete(&models.GoodsReceiptNoteLine{}).Error; err != nil {
			return err
		}

		if err := tx.Save(grn).Error; err != nil {
			return err
		}

		for i := range grn.Lines {
			grn.Lines[i].GoodsReceiptNoteID = grn.ID
			if err := tx.Create(&grn.Lines[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *grnRepository) SoftDeleteGRN(db *gorm.DB, grn *models.GoodsReceiptNote) error {
	return db.Delete(grn).Error
}

func (r *grnRepository) UpdateGRNStatus(db *gorm.DB, companyID, id uint64, approvalStatus, postedStatus string, userID *uint64, actionAt *time.Time) error {
	updates := map[string]interface{}{}

	if approvalStatus != "" {
		updates["approval_status"] = approvalStatus
		if approvalStatus == "approved" {
			updates["approved_by"] = userID
			updates["approved_at"] = actionAt
		}
	}

	if postedStatus != "" {
		updates["posted_status"] = postedStatus
		if postedStatus == "posted" {
			updates["posted_by"] = userID
			updates["posted_at"] = actionAt
		}
	}

	return db.Model(&models.GoodsReceiptNote{}).Where("company_id = ? AND id = ?", companyID, id).Updates(updates).Error
}

func (r *grnRepository) CreateGRNApprovalRecord(db *gorm.DB, approval *models.GoodsReceiptNoteApproval) error {
	return db.Create(approval).Error
}

func (r *grnRepository) CheckGRNStockLedgerExists(db *gorm.DB, companyID, grnID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).
		Where("company_id = ? AND source_type = ? AND source_id = ?", companyID, "grn", grnID).
		Count(&count).Error
	return count > 0, err
}

func (r *grnRepository) FindOrCreateBatchFromGRNLine(tx *gorm.DB, companyID, productID uint64, batchNumber string, manufactureDate, expiryDate *time.Time, supplierID, manufacturerID uint64, purchaseRate, sellingPrice, mrp float64, createdBy uint64) (*models.ProductBatch, error) {
	if batchNumber == "" {
		return nil, errors.New("batch number is required to create a batch")
	}

	var batch models.ProductBatch
	err := tx.Where("company_id = ? AND product_id = ? AND batch_number = ?", companyID, productID, batchNumber).First(&batch).Error

	if err == nil {
		return &batch, nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	newBatch := models.ProductBatch{
		CompanyID:       companyID,
		ProductID:       productID,
		BatchNumber:     batchNumber,
		ManufactureDate: manufactureDate,
		ExpiryDate:      expiryDate,
		SupplierID:      &supplierID,
		ManufacturerID:  nil,
		PurchaseRate:    purchaseRate,
		SellingPrice:    sellingPrice,
		MRP:             mrp,
		BatchStatus:     "active",
		IsBlocked:       false,
		CreatedBy:       &createdBy,
	}

	if manufacturerID > 0 {
		newBatch.ManufacturerID = &manufacturerID
	}

	if err := tx.Create(&newBatch).Error; err != nil {
		return nil, fmt.Errorf("failed to auto-create batch %s: %w", batchNumber, err)
	}

	return &newBatch, nil
}

func (r *grnRepository) UpdateBatchPricesFromGRNLine(tx *gorm.DB, batchID uint64, purchaseRate, sellingPrice, mrp float64) error {
	updates := map[string]interface{}{}
	if purchaseRate > 0 {
		updates["purchase_rate"] = purchaseRate
	}
	if sellingPrice > 0 {
		updates["selling_price"] = sellingPrice
	}
	if mrp > 0 {
		updates["mrp"] = mrp
	}

	if len(updates) == 0 {
		return nil
	}

	return tx.Model(&models.ProductBatch{}).Where("id = ?", batchID).Updates(updates).Error
}
