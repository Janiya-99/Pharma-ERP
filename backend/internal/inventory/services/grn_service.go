package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type GRNService interface {
	ListGRNs(db *gorm.DB, filter dto.GRNFilter) ([]dto.GRNResponse, int64, error)
	GetGRNByID(db *gorm.DB, companyID, id uint64) (*models.GoodsReceiptNote, error)
	CreateGRN(db *gorm.DB, payload dto.CreateGRNPayload) (*models.GoodsReceiptNote, error)
	UpdateGRN(db *gorm.DB, id uint64, payload dto.UpdateGRNPayload) (*models.GoodsReceiptNote, error)
	DeleteGRN(db *gorm.DB, companyID, id, userID uint64) error

	SubmitGRN(db *gorm.DB, companyID, id, userID uint64, payload dto.ActionGRNPayload) error
	ApproveGRN(db *gorm.DB, companyID, id, userID uint64, payload dto.ActionGRNPayload) error
	RejectGRN(db *gorm.DB, companyID, id, userID uint64, payload dto.ActionGRNPayload) error
	PostGRN(db *gorm.DB, companyID, id, userID uint64) error
}

type grnService struct {
	grnRepo          repositories.GRNRepository
	stockRepo        repositories.StockMovementRepository
	pmRepo           *repositories.ProductMasterRepository
	stockMoveService InventoryStockMovementService
	auditLogger      *AuditLogService
	logger           *zap.Logger
}

func NewGRNService(
	grnRepo repositories.GRNRepository,
	stockRepo repositories.StockMovementRepository,
	pmRepo *repositories.ProductMasterRepository,
	stockMoveService InventoryStockMovementService,
	auditLogger *AuditLogService,
	logger *zap.Logger,
) GRNService {
	return &grnService{
		grnRepo:          grnRepo,
		stockRepo:        stockRepo,
		pmRepo:           pmRepo,
		stockMoveService: stockMoveService,
		auditLogger:      auditLogger,
		logger:           logger,
	}
}

func (s *grnService) ListGRNs(db *gorm.DB, filter dto.GRNFilter) ([]dto.GRNResponse, int64, error) {
	return s.grnRepo.FindGRNs(db, filter)
}

func (s *grnService) GetGRNByID(db *gorm.DB, companyID, id uint64) (*models.GoodsReceiptNote, error) {
	return s.grnRepo.FindGRNByID(db, companyID, id)
}

func (s *grnService) generateGRNNumber(db *gorm.DB, companyID uint64) (string, error) {
	lastNumber, err := s.grnRepo.GetLastGRNNumber(db, companyID)
	if err != nil {
		return "", err
	}

	if lastNumber == "" {
		return "GRN-000001", nil
	}

	var num int
	_, err = fmt.Sscanf(lastNumber, "GRN-%06d", &num)
	if err != nil {
		return "GRN-000001", nil
	}

	return fmt.Sprintf("GRN-%06d", num+1), nil
}

func (s *grnService) buildGRNLines(db *gorm.DB, companyID uint64, payloadLines []dto.GRNLinePayload) ([]models.GoodsReceiptNoteLine, float64, float64, float64, float64, float64, float64, float64, error) {
	var lines []models.GoodsReceiptNoteLine
	var tQty, tFreeQty, tStockQty, subTotal, tDiscount, tTax, tTotal float64

	for i, l := range payloadLines {
		if l.QuantityReceived <= 0 {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: quantity received must be greater than zero", i+1)
		}
		if l.FreeQuantity < 0 {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: free quantity cannot be negative", i+1)
		}
		if l.UnitCost < 0 {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: unit cost cannot be negative", i+1)
		}
		if l.DiscountAmount < 0 {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: discount cannot be negative", i+1)
		}
		if l.TaxAmount < 0 {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: tax cannot be negative", i+1)
		}

		product, err := s.stockRepo.FindProductByID(db, l.ProductID)
		if err != nil {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: product not found", i+1)
		}
		if product.Status != "active" {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: product is not active", i+1)
		}

		if product.RequiresBatchTracking {
			if l.ProductBatchID == nil && l.BatchNumber == "" {
				return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: product requires batch tracking, please provide batch ID or batch number", i+1)
			}
		}

		var mfgDate, expDate *time.Time
		if l.ManufactureDate != "" {
			parsed, err := time.Parse("2006-01-02", l.ManufactureDate)
			if err == nil {
				mfgDate = &parsed
			}
		}
		if l.ExpiryDate != "" {
			parsed, err := time.Parse("2006-01-02", l.ExpiryDate)
			if err == nil {
				expDate = &parsed
			}
		}

		if product.RequiresExpiryTracking && expDate == nil {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: expiry date is required for this product", i+1)
		}

		if mfgDate != nil && expDate != nil && expDate.Before(*mfgDate) {
			return nil, 0, 0, 0, 0, 0, 0, 0, fmt.Errorf("line %d: expiry date must be after manufacture date", i+1)
		}

		totalStockQty := l.QuantityReceived + l.FreeQuantity
		lineSubTotal := l.QuantityReceived * l.UnitCost
		lineTotal := lineSubTotal - l.DiscountAmount + l.TaxAmount

		var stockUnitCost float64
		if totalStockQty > 0 {
			stockUnitCost = lineTotal / totalStockQty
		}

		line := models.GoodsReceiptNoteLine{
			WarehouseLocationID: l.WarehouseLocationID,
			ProductID:           l.ProductID,
			ProductBatchID:      l.ProductBatchID,
			BatchNumber:         l.BatchNumber,
			ManufactureDate:     mfgDate,
			ExpiryDate:          expDate,
			QuantityReceived:    l.QuantityReceived,
			FreeQuantity:        l.FreeQuantity,
			TotalStockQuantity:  totalStockQty,
			UnitCost:            l.UnitCost,
			DiscountAmount:      l.DiscountAmount,
			TaxAmount:           l.TaxAmount,
			LineTotal:           lineTotal,
			StockUnitCost:       stockUnitCost,
			SellingPrice:        l.SellingPrice,
			MRP:                 l.MRP,
			LineRemarks:         l.LineRemarks,
			LineOrder:           i + 1,
		}

		lines = append(lines, line)

		tQty += l.QuantityReceived
		tFreeQty += l.FreeQuantity
		tStockQty += totalStockQty
		subTotal += lineSubTotal
		tDiscount += l.DiscountAmount
		tTax += l.TaxAmount
		tTotal += lineTotal
	}

	return lines, tQty, tFreeQty, tStockQty, subTotal, tDiscount, tTax, tTotal, nil
}

func (s *grnService) CreateGRN(db *gorm.DB, payload dto.CreateGRNPayload) (*models.GoodsReceiptNote, error) {
	grnDate, err := time.Parse("2006-01-02", payload.GRNDate)
	if err != nil {
		return nil, errors.New("invalid GRN date format")
	}

	var suppInvDate *time.Time
	if payload.SupplierInvoiceDate != "" {
		parsed, err := time.Parse("2006-01-02", payload.SupplierInvoiceDate)
		if err == nil {
			suppInvDate = &parsed
		}
	}

	supplier, err := s.pmRepo.GetSupplierByID(db, payload.CompanyID, payload.SupplierID)
	if err != nil {
		return nil, errors.New("invalid supplier")
	}
	if supplier.Status != "active" {
		return nil, errors.New("supplier is not active")
	}

	warehouse, err := s.stockRepo.FindWarehouseByID(db, payload.WarehouseID)
	if err != nil {
		return nil, errors.New("invalid warehouse")
	}
	if warehouse.BranchID != payload.BranchID {
		return nil, errors.New("warehouse does not belong to selected branch")
	}

	lines, tQty, tFreeQty, tStockQty, subTotal, tDiscount, tTax, tTotal, err := s.buildGRNLines(db, payload.CompanyID, payload.Lines)
	if err != nil {
		return nil, err
	}

	grnNumber, err := s.generateGRNNumber(db, payload.CompanyID)
	if err != nil {
		return nil, err
	}

	grn := &models.GoodsReceiptNote{
		CompanyID:             payload.CompanyID,
		BranchID:              payload.BranchID,
		SupplierID:            payload.SupplierID,
		WarehouseID:           payload.WarehouseID,
		FinancialYearID:       payload.FinancialYearID,
		AccountingPeriodID:    payload.AccountingPeriodID,
		GRNNumber:             grnNumber,
		GRNDate:               grnDate,
		SupplierInvoiceNumber: payload.SupplierInvoiceNumber,
		SupplierInvoiceDate:   suppInvDate,
		PurchaseOrderNumber:   payload.PurchaseOrderNumber,
		ReferenceNumber:       payload.ReferenceNumber,
		Remarks:               payload.Remarks,
		TotalQuantity:         tQty,
		TotalFreeQuantity:     tFreeQty,
		TotalStockQuantity:    tStockQty,
		SubtotalAmount:        subTotal,
		DiscountAmount:        tDiscount,
		TaxAmount:             tTax,
		TotalAmount:           tTotal,
		ApprovalStatus:        "draft",
		PostedStatus:          "unposted",
		CreatedBy:             payload.CreatedBy,
		UpdatedBy:             payload.CreatedBy,
		Lines:                 lines,
	}

	if err := s.grnRepo.CreateGRNWithLines(db, grn); err != nil {
		return nil, err
	}

	s.auditLogger.LogAction(db, payload.CompanyID, payload.CreatedBy, "GRN_CREATED", "Goods Receipt Note", grn.ID)

	return grn, nil
}

func (s *grnService) UpdateGRN(db *gorm.DB, id uint64, payload dto.UpdateGRNPayload) (*models.GoodsReceiptNote, error) {
	grn, err := s.grnRepo.FindGRNByID(db, payload.CompanyID, id)
	if err != nil {
		return nil, err
	}

	if grn.PostedStatus == "posted" {
		return nil, errors.New("cannot update a posted GRN")
	}
	if grn.ApprovalStatus != "draft" && grn.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected GRNs can be updated")
	}

	grnDate, err := time.Parse("2006-01-02", payload.GRNDate)
	if err != nil {
		return nil, errors.New("invalid GRN date format")
	}

	var suppInvDate *time.Time
	if payload.SupplierInvoiceDate != "" {
		parsed, err := time.Parse("2006-01-02", payload.SupplierInvoiceDate)
		if err == nil {
			suppInvDate = &parsed
		}
	}

	lines, tQty, tFreeQty, tStockQty, subTotal, tDiscount, tTax, tTotal, err := s.buildGRNLines(db, payload.CompanyID, payload.Lines)
	if err != nil {
		return nil, err
	}

	grn.BranchID = payload.BranchID
	grn.SupplierID = payload.SupplierID
	grn.WarehouseID = payload.WarehouseID
	grn.FinancialYearID = payload.FinancialYearID
	grn.AccountingPeriodID = payload.AccountingPeriodID
	grn.GRNDate = grnDate
	grn.SupplierInvoiceNumber = payload.SupplierInvoiceNumber
	grn.SupplierInvoiceDate = suppInvDate
	grn.PurchaseOrderNumber = payload.PurchaseOrderNumber
	grn.ReferenceNumber = payload.ReferenceNumber
	grn.Remarks = payload.Remarks
	grn.UpdatedBy = payload.UpdatedBy

	grn.TotalQuantity = tQty
	grn.TotalFreeQuantity = tFreeQty
	grn.TotalStockQuantity = tStockQty
	grn.SubtotalAmount = subTotal
	grn.DiscountAmount = tDiscount
	grn.TaxAmount = tTax
	grn.TotalAmount = tTotal
	grn.Lines = lines

	if err := s.grnRepo.UpdateGRNWithLines(db, grn); err != nil {
		return nil, err
	}

	s.auditLogger.LogAction(db, payload.CompanyID, payload.UpdatedBy, "GRN_UPDATED", "Goods Receipt Note", grn.ID)

	return grn, nil
}

func (s *grnService) DeleteGRN(db *gorm.DB, companyID, id, userID uint64) error {
	grn, err := s.grnRepo.FindGRNByID(db, companyID, id)
	if err != nil {
		return err
	}

	if grn.PostedStatus == "posted" {
		return errors.New("cannot delete a posted GRN")
	}
	if grn.ApprovalStatus != "draft" && grn.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected GRNs can be deleted")
	}

	if err := s.grnRepo.SoftDeleteGRN(db, grn); err != nil {
		return err
	}

	s.auditLogger.LogAction(db, companyID, userID, "GRN_DELETED", "Goods Receipt Note", grn.ID)
	return nil
}

func (s *grnService) SubmitGRN(db *gorm.DB, companyID, id, userID uint64, payload dto.ActionGRNPayload) error {
	grn, err := s.grnRepo.FindGRNByID(db, companyID, id)
	if err != nil {
		return err
	}

	if grn.PostedStatus == "posted" {
		return errors.New("GRN is already posted")
	}
	if grn.ApprovalStatus != "draft" && grn.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected GRNs can be submitted")
	}

	if len(grn.Lines) == 0 {
		return errors.New("GRN must have at least one line to submit")
	}
	if grn.TotalStockQuantity <= 0 {
		return errors.New("GRN total stock quantity must be greater than zero")
	}

	now := time.Now()
	if err := s.grnRepo.UpdateGRNStatus(db, companyID, id, "pending", "", nil, nil); err != nil {
		return err
	}

	approval := &models.GoodsReceiptNoteApproval{
		GoodsReceiptNoteID: id,
		Action:             "submitted",
		Remarks:            payload.Remarks,
		ActionBy:           userID,
		ActionAt:           &now,
	}
	_ = s.grnRepo.CreateGRNApprovalRecord(db, approval)

	s.auditLogger.LogAction(db, companyID, userID, "GRN_SUBMITTED", "Goods Receipt Note", id)
	return nil
}

func (s *grnService) ApproveGRN(db *gorm.DB, companyID, id, userID uint64, payload dto.ActionGRNPayload) error {
	grn, err := s.grnRepo.FindGRNByID(db, companyID, id)
	if err != nil {
		return err
	}

	if grn.ApprovalStatus != "pending" {
		return errors.New("only pending GRNs can be approved")
	}

	now := time.Now()
	if err := s.grnRepo.UpdateGRNStatus(db, companyID, id, "approved", "", &userID, &now); err != nil {
		return err
	}

	approval := &models.GoodsReceiptNoteApproval{
		GoodsReceiptNoteID: id,
		Action:             "approved",
		Remarks:            payload.Remarks,
		ActionBy:           userID,
		ActionAt:           &now,
	}
	_ = s.grnRepo.CreateGRNApprovalRecord(db, approval)

	s.auditLogger.LogAction(db, companyID, userID, "GRN_APPROVED", "Goods Receipt Note", id)
	return nil
}

func (s *grnService) RejectGRN(db *gorm.DB, companyID, id, userID uint64, payload dto.ActionGRNPayload) error {
	grn, err := s.grnRepo.FindGRNByID(db, companyID, id)
	if err != nil {
		return err
	}

	if grn.ApprovalStatus != "pending" {
		return errors.New("only pending GRNs can be rejected")
	}

	if payload.Remarks == "" {
		return errors.New("remarks are required when rejecting a GRN")
	}

	now := time.Now()
	if err := s.grnRepo.UpdateGRNStatus(db, companyID, id, "rejected", "", nil, nil); err != nil {
		return err
	}

	approval := &models.GoodsReceiptNoteApproval{
		GoodsReceiptNoteID: id,
		Action:             "rejected",
		Remarks:            payload.Remarks,
		ActionBy:           userID,
		ActionAt:           &now,
	}
	_ = s.grnRepo.CreateGRNApprovalRecord(db, approval)

	s.auditLogger.LogAction(db, companyID, userID, "GRN_REJECTED", "Goods Receipt Note", id)
	return nil
}

func (s *grnService) PostGRN(db *gorm.DB, companyID, id, userID uint64) error {
	grn, err := s.grnRepo.FindGRNByID(db, companyID, id)
	if err != nil {
		return err
	}

	if grn.ApprovalStatus != "approved" {
		return errors.New("only approved GRNs can be posted")
	}
	if grn.PostedStatus == "posted" {
		return errors.New("GRN is already posted")
	}

	exists, err := s.grnRepo.CheckGRNStockLedgerExists(db, companyID, id)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("GRN is already posted to stock ledger")
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		for i, line := range grn.Lines {
			var resolvedBatchID *uint64

			if line.ProductBatchID != nil {
				resolvedBatchID = line.ProductBatchID
				// Update batch prices if provided
				_ = s.grnRepo.UpdateBatchPricesFromGRNLine(tx, *resolvedBatchID, line.UnitCost, line.SellingPrice, line.MRP)
			} else if line.BatchNumber != "" {
				product, err := s.stockRepo.FindProductByID(tx, line.ProductID)
				if err != nil {
					return err
				}

				var manufacturerID uint64
				if product.ManufacturerID != nil {
					manufacturerID = *product.ManufacturerID
				}

				batch, err := s.grnRepo.FindOrCreateBatchFromGRNLine(
					tx,
					companyID,
					line.ProductID,
					line.BatchNumber,
					line.ManufactureDate,
					line.ExpiryDate,
					grn.SupplierID,
					manufacturerID,
					line.UnitCost,
					line.SellingPrice,
					line.MRP,
					userID,
				)
				if err != nil {
					return fmt.Errorf("line %d: %w", i+1, err)
				}
				resolvedBatchID = &batch.ID
			}

			movePayload := dto.StockInPayload{
				CompanyID:           companyID,
				BranchID:            grn.BranchID,
				WarehouseID:         grn.WarehouseID,
				WarehouseLocationID: line.WarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      resolvedBatchID,
				TransactionDate:     grn.GRNDate,
				SourceType:          "grn",
				SourceID:            grn.ID,
				SourceNumber:        grn.GRNNumber,
				Quantity:            line.TotalStockQuantity,
				UnitCost:            line.StockUnitCost,
				Remarks:             "GRN stock received",
				CreatedBy:           userID,
			}

			err = s.stockMoveService.ProcessStockIn(tx, movePayload)
			if err != nil {
				return fmt.Errorf("line %d stock movement failed: %w", i+1, err)
			}
		}

		now := time.Now()
		updates := map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
		}
		if err := tx.Model(&models.GoodsReceiptNote{}).Where("id = ?", id).Updates(updates).Error; err != nil {
			return err
		}

		approval := &models.GoodsReceiptNoteApproval{
			GoodsReceiptNoteID: id,
			Action:             "posted",
			Remarks:            "Automatically posted",
			ActionBy:           userID,
			ActionAt:           &now,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditLogger.LogAction(tx, companyID, userID, "GRN_POSTED", "Goods Receipt Note", id)

		return nil
	})

	return err
}
