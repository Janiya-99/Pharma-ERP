package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	inventoryModels "github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SalesReturnService interface {
	ListSalesReturns(db *gorm.DB, companyID uint64, filter dto.SalesReturnFilter) ([]inventoryModels.SalesReturn, int64, error)
	GetSalesReturnByID(db *gorm.DB, companyID, id uint64) (*inventoryModels.SalesReturn, error)
	CreateSalesReturn(db *gorm.DB, companyID, userID uint64, req dto.CreateSalesReturnRequest) (*inventoryModels.SalesReturn, error)
	UpdateSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.UpdateSalesReturnRequest) (*inventoryModels.SalesReturn, error)
	DeleteSalesReturn(db *gorm.DB, companyID, userID, id uint64) error
	SubmitSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error
	ApproveSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error
	RejectSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error
	PostSalesReturn(db *gorm.DB, companyID, userID, id uint64) error
}

type salesReturnService struct {
	repo              repositories.SalesReturnRepository
	stockMovementRepo repositories.StockMovementRepository
	stockMovementSvc  InventoryStockMovementService
	logger            *zap.Logger
}

func NewSalesReturnService(
	repo repositories.SalesReturnRepository,
	stockMovementRepo repositories.StockMovementRepository,
	stockMovementSvc InventoryStockMovementService,
	logger *zap.Logger,
) SalesReturnService {
	return &salesReturnService{
		repo:              repo,
		stockMovementRepo: stockMovementRepo,
		stockMovementSvc:  stockMovementSvc,
		logger:            logger,
	}
}

func (s *salesReturnService) ListSalesReturns(db *gorm.DB, companyID uint64, filter dto.SalesReturnFilter) ([]inventoryModels.SalesReturn, int64, error) {
	return s.repo.FindSalesReturns(db, companyID, filter)
}

func (s *salesReturnService) GetSalesReturnByID(db *gorm.DB, companyID, id uint64) (*inventoryModels.SalesReturn, error) {
	return s.repo.FindSalesReturnByID(db, companyID, id)
}

func (s *salesReturnService) ValidateReturnConditionWarehouse(warehouseType, returnCondition string) error {
	switch returnCondition {
	case "saleable":
		if warehouseType != "main" && warehouseType != "secondary" && warehouseType != "cold_storage" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "quarantine":
		if warehouseType != "quarantine" && warehouseType != "return" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "damaged":
		if warehouseType != "damaged" && warehouseType != "return" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "expired":
		if warehouseType != "expired" && warehouseType != "return" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "recall":
		if warehouseType != "quarantine" && warehouseType != "return" && warehouseType != "damaged" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	}
	return nil
}

func (s *salesReturnService) GenerateSalesReturnNumber(db *gorm.DB, companyID uint64) (string, error) {
	yearMonthPrefix := fmt.Sprintf("SR-%s-", time.Now().Format("0601"))
	lastNumber, err := s.repo.GetLastSalesReturnNumber(db, companyID, yearMonthPrefix)
	if err != nil {
		return "", err
	}

	var nextSequence int
	if lastNumber == "" {
		nextSequence = 1
	} else {
		fmt.Sscanf(lastNumber, yearMonthPrefix+"%04d", &nextSequence)
		nextSequence++
	}

	return fmt.Sprintf("%s%04d", yearMonthPrefix, nextSequence), nil
}

func (s *salesReturnService) CreateSalesReturn(db *gorm.DB, companyID, userID uint64, req dto.CreateSalesReturnRequest) (*inventoryModels.SalesReturn, error) {
	warehouse, err := s.stockMovementRepo.FindWarehouseByID(db, req.WarehouseID)
	if err != nil {
		return nil, err
	}
	if warehouse == nil || warehouse.Status != "active" {
		return nil, errors.New("invalid or inactive warehouse")
	}
	if warehouse.BranchID != req.BranchID {
		return nil, errors.New("warehouse does not belong to selected branch")
	}

	if err := s.ValidateReturnConditionWarehouse(warehouse.WarehouseType, req.ReturnCondition); err != nil {
		return nil, err
	}

	parsedDate, err := time.Parse("2006-01-02", req.SalesReturnDate)
	if err != nil {
		return nil, errors.New("invalid sales return date format")
	}

	returnNumber, err := s.GenerateSalesReturnNumber(db, companyID)
	if err != nil {
		return nil, err
	}

	salesReturn := &inventoryModels.SalesReturn{
		CompanyID:                companyID,
		BranchID:                 req.BranchID,
		WarehouseID:              req.WarehouseID,
		FinancialYearID:          req.FinancialYearID,
		AccountingPeriodID:       req.AccountingPeriodID,
		SalesReturnNumber:        returnNumber,
		SalesReturnDate:          parsedDate,
		CustomerName:             req.CustomerName,
		CustomerContactNumber:    req.CustomerContactNumber,
		SalesInvoiceNumber:       req.SalesInvoiceNumber,
		CustomerCreditNoteNumber: req.CustomerCreditNoteNumber,
		ReferenceNumber:          req.ReferenceNumber,
		ReturnReason:             req.ReturnReason,
		ReturnCondition:          req.ReturnCondition,
		Remarks:                  req.Remarks,
		ApprovalStatus:           "draft",
		PostedStatus:             "unposted",
		Status:                   "active",
		CreatedBy:                userID,
		UpdatedBy:                userID,
	}

	var totalQty, subtotal, discount, tax, total float64

	for i, lReq := range req.Lines {
		if lReq.ReturnQuantity <= 0 {
			return nil, errors.New("return quantity must be greater than zero")
		}

		product, err := s.stockMovementRepo.FindProductByID(db, lReq.ProductID)
		if err != nil || product == nil || product.Status != "active" {
			return nil, errors.New("invalid or inactive product")
		}

		if product.RequiresBatchTracking && lReq.ProductBatchID == nil {
			return nil, errors.New("product batch is required for batch tracked product")
		}

		if lReq.ProductBatchID != nil {
			batch, err := s.stockMovementRepo.FindBatchByID(db, *lReq.ProductBatchID)
			if err != nil || batch == nil {
				return nil, errors.New("invalid product batch")
			}
			if batch.ProductID != lReq.ProductID {
				return nil, errors.New("batch does not belong to selected product")
			}
			if batch.BatchStatus == "disposed" {
				return nil, errors.New("cannot return disposed batch")
			}

			if req.ReturnCondition == "saleable" && batch.BatchStatus == "expired" {
				return nil, errors.New("cannot use expired batch for saleable return")
			}
		}

		if lReq.WarehouseLocationID != nil {
			location, err := s.stockMovementRepo.FindWarehouseLocationByID(db, *lReq.WarehouseLocationID)
			if err != nil || location == nil || location.WarehouseID != req.WarehouseID {
				return nil, errors.New("invalid warehouse location")
			}
		}

		lineCond := lReq.ReturnCondition
		if lineCond == "" {
			lineCond = req.ReturnCondition
		}

		lineTotal := (lReq.ReturnQuantity * lReq.UnitPrice) - lReq.DiscountAmount + lReq.TaxAmount

		salesReturn.Lines = append(salesReturn.Lines, inventoryModels.SalesReturnLine{
			WarehouseLocationID: lReq.WarehouseLocationID,
			ProductID:           lReq.ProductID,
			ProductBatchID:      lReq.ProductBatchID,
			ReturnQuantity:      lReq.ReturnQuantity,
			UnitPrice:           lReq.UnitPrice,
			DiscountAmount:      lReq.DiscountAmount,
			TaxAmount:           lReq.TaxAmount,
			LineTotal:           lineTotal,
			StockUnitCost:       lReq.StockUnitCost,
			ReturnReason:        lReq.ReturnReason,
			ReturnCondition:     lineCond,
			LineRemarks:         lReq.LineRemarks,
			LineOrder:           i + 1,
		})

		totalQty += lReq.ReturnQuantity
		subtotal += (lReq.ReturnQuantity * lReq.UnitPrice)
		discount += lReq.DiscountAmount
		tax += lReq.TaxAmount
		total += lineTotal
	}

	salesReturn.TotalQuantity = totalQty
	salesReturn.SubtotalAmount = subtotal
	salesReturn.DiscountAmount = discount
	salesReturn.TaxAmount = tax
	salesReturn.TotalAmount = total

	if err := s.repo.CreateSalesReturnWithLines(db, salesReturn); err != nil {
		return nil, err
	}

	return salesReturn, nil
}

func (s *salesReturnService) UpdateSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.UpdateSalesReturnRequest) (*inventoryModels.SalesReturn, error) {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected sales returns can be updated")
	}

	warehouse, err := s.stockMovementRepo.FindWarehouseByID(db, existing.WarehouseID)
	if err != nil {
		return nil, err
	}

	if err := s.ValidateReturnConditionWarehouse(warehouse.WarehouseType, req.ReturnCondition); err != nil {
		return nil, err
	}

	parsedDate, err := time.Parse("2006-01-02", req.SalesReturnDate)
	if err != nil {
		return nil, errors.New("invalid sales return date format")
	}

	existing.SalesReturnDate = parsedDate
	existing.CustomerName = req.CustomerName
	existing.CustomerContactNumber = req.CustomerContactNumber
	existing.SalesInvoiceNumber = req.SalesInvoiceNumber
	existing.CustomerCreditNoteNumber = req.CustomerCreditNoteNumber
	existing.ReferenceNumber = req.ReferenceNumber
	existing.ReturnReason = req.ReturnReason
	existing.ReturnCondition = req.ReturnCondition
	existing.Remarks = req.Remarks
	existing.UpdatedBy = userID

	var totalQty, subtotal, discount, tax, total float64
	var newLines []inventoryModels.SalesReturnLine

	for i, lReq := range req.Lines {
		if lReq.ReturnQuantity <= 0 {
			return nil, errors.New("return quantity must be greater than zero")
		}

		product, err := s.stockMovementRepo.FindProductByID(db, lReq.ProductID)
		if err != nil || product == nil || product.Status != "active" {
			return nil, errors.New("invalid or inactive product")
		}

		if product.RequiresBatchTracking && lReq.ProductBatchID == nil {
			return nil, errors.New("product batch is required for batch tracked product")
		}

		if lReq.ProductBatchID != nil {
			batch, err := s.stockMovementRepo.FindBatchByID(db, *lReq.ProductBatchID)
			if err != nil || batch == nil {
				return nil, errors.New("invalid product batch")
			}
			if batch.ProductID != lReq.ProductID {
				return nil, errors.New("batch does not belong to selected product")
			}
			if batch.BatchStatus == "disposed" {
				return nil, errors.New("cannot return disposed batch")
			}
			if req.ReturnCondition == "saleable" && batch.BatchStatus == "expired" {
				return nil, errors.New("cannot use expired batch for saleable return")
			}
		}

		if lReq.WarehouseLocationID != nil {
			location, err := s.stockMovementRepo.FindWarehouseLocationByID(db, *lReq.WarehouseLocationID)
			if err != nil || location == nil || location.WarehouseID != existing.WarehouseID {
				return nil, errors.New("invalid warehouse location")
			}
		}

		lineCond := lReq.ReturnCondition
		if lineCond == "" {
			lineCond = req.ReturnCondition
		}
		lineTotal := (lReq.ReturnQuantity * lReq.UnitPrice) - lReq.DiscountAmount + lReq.TaxAmount

		newLines = append(newLines, inventoryModels.SalesReturnLine{
			SalesReturnID:       existing.ID,
			WarehouseLocationID: lReq.WarehouseLocationID,
			ProductID:           lReq.ProductID,
			ProductBatchID:      lReq.ProductBatchID,
			ReturnQuantity:      lReq.ReturnQuantity,
			UnitPrice:           lReq.UnitPrice,
			DiscountAmount:      lReq.DiscountAmount,
			TaxAmount:           lReq.TaxAmount,
			LineTotal:           lineTotal,
			StockUnitCost:       lReq.StockUnitCost,
			ReturnReason:        lReq.ReturnReason,
			ReturnCondition:     lineCond,
			LineRemarks:         lReq.LineRemarks,
			LineOrder:           i + 1,
		})

		totalQty += lReq.ReturnQuantity
		subtotal += (lReq.ReturnQuantity * lReq.UnitPrice)
		discount += lReq.DiscountAmount
		tax += lReq.TaxAmount
		total += lineTotal
	}

	existing.Lines = newLines
	existing.TotalQuantity = totalQty
	existing.SubtotalAmount = subtotal
	existing.DiscountAmount = discount
	existing.TaxAmount = tax
	existing.TotalAmount = total

	if err := s.repo.UpdateSalesReturnWithLines(db, existing); err != nil {
		return nil, err
	}

	return existing, nil
}

func (s *salesReturnService) DeleteSalesReturn(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales returns can be deleted")
	}

	if existing.PostedStatus == "posted" {
		return errors.New("posted sales returns cannot be deleted")
	}

	if err := s.repo.SoftDeleteSalesReturn(db, companyID, id, userID); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) SubmitSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales returns can be submitted")
	}
	if len(existing.Lines) == 0 {
		return errors.New("sales return must have at least one line")
	}
	if existing.TotalQuantity <= 0 {
		return errors.New("total quantity must be greater than zero")
	}

	if err := s.repo.UpdateSalesReturnStatus(db, id, map[string]interface{}{
		"approval_status": "pending",
		"updated_by":      userID,
	}); err != nil {
		return err
	}

	approval := &inventoryModels.SalesReturnApproval{
		SalesReturnID: id,
		Action:        "submitted",
		Remarks:       req.Remarks,
		ActionBy:      userID,
		ActionAt:      time.Now(),
	}
	if err := s.repo.CreateSalesReturnApprovalRecord(db, approval); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) ApproveSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales returns can be approved")
	}

	now := time.Now()
	if err := s.repo.UpdateSalesReturnStatus(db, id, map[string]interface{}{
		"approval_status": "approved",
		"approved_by":     userID,
		"approved_at":     now,
		"updated_by":      userID,
	}); err != nil {
		return err
	}

	approval := &inventoryModels.SalesReturnApproval{
		SalesReturnID: id,
		Action:        "approved",
		Remarks:       req.Remarks,
		ActionBy:      userID,
		ActionAt:      now,
	}
	if err := s.repo.CreateSalesReturnApprovalRecord(db, approval); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) RejectSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error {
	if req.Remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales returns can be rejected")
	}

	if err := s.repo.UpdateSalesReturnStatus(db, id, map[string]interface{}{
		"approval_status": "rejected",
		"updated_by":      userID,
	}); err != nil {
		return err
	}

	approval := &inventoryModels.SalesReturnApproval{
		SalesReturnID: id,
		Action:        "rejected",
		Remarks:       req.Remarks,
		ActionBy:      userID,
		ActionAt:      time.Now(),
	}
	if err := s.repo.CreateSalesReturnApprovalRecord(db, approval); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) PostSalesReturn(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "approved" {
		return errors.New("only approved sales returns can be posted")
	}
	if existing.PostedStatus == "posted" {
		return errors.New("sales return is already posted to stock ledger")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		exists, err := s.repo.CheckSalesReturnLedgerExists(tx, companyID, id)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("Sales return is already posted to stock ledger")
		}

		for _, line := range existing.Lines {

			allowExpired := false
			allowBlocked := false
			allowRecalled := false

			warehouse, _ := s.stockMovementRepo.FindWarehouseByID(tx, existing.WarehouseID)
			whType := ""
			if warehouse != nil {
				whType = warehouse.WarehouseType
			}

			if line.ReturnCondition == "expired" && (whType == "expired" || whType == "return") {
				allowExpired = true
			}
			if line.ReturnCondition == "recall" && (whType == "quarantine" || whType == "return" || whType == "damaged") {
				allowRecalled = true
				allowBlocked = true
			}

			stockInPayload := dto.StockInPayload{
				CompanyID:           companyID,
				BranchID:            existing.BranchID,
				WarehouseID:         existing.WarehouseID,
				WarehouseLocationID: line.WarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				TransactionDate:     existing.SalesReturnDate,
				SourceType:          "sales_return",
				SourceID:            existing.ID,
				SourceNumber:        existing.SalesReturnNumber,
				Quantity:            line.ReturnQuantity,
				UnitCost:            line.StockUnitCost,
				Remarks:             fmt.Sprintf("Sales Return %s", existing.SalesReturnNumber),
				CreatedBy:           userID,
				AllowExpiredBatch:   allowExpired,
				AllowBlockedBatch:   allowBlocked,
				AllowRecalledBatch:  allowRecalled,
			}

			if err := s.stockMovementSvc.ProcessStockIn(tx, stockInPayload); err != nil {
				return fmt.Errorf("failed to process stock in for product %d: %w", line.ProductID, err)
			}
		}

		now := time.Now()
		if err := s.repo.UpdateSalesReturnStatus(tx, id, map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
			"updated_by":    userID,
		}); err != nil {
			return err
		}

		approval := &inventoryModels.SalesReturnApproval{
			SalesReturnID: id,
			Action:        "posted",
			Remarks:       "Posted to stock ledger",
			ActionBy:      userID,
			ActionAt:      now,
		}
		if err := s.repo.CreateSalesReturnApprovalRecord(tx, approval); err != nil {
			return err
		}

		return nil
	})
}
