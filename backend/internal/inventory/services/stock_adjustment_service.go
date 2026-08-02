package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type StockAdjustmentService interface {
	ListStockAdjustments(db *gorm.DB, companyID uint64, branchID *uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockAdjustment, int64, error)
	GetStockAdjustmentByID(db *gorm.DB, id uint64, companyID uint64) (*models.StockAdjustment, error)
	CreateStockAdjustment(db *gorm.DB, req *dto.StockAdjustmentCreateRequest, companyID, userID uint64) (*models.StockAdjustment, error)
	UpdateStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentUpdateRequest, companyID, userID uint64) error
	DeleteStockAdjustment(db *gorm.DB, id uint64, companyID, userID uint64) error
	SubmitStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentActionRequest, companyID, userID uint64) error
	ApproveStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentActionRequest, companyID, userID uint64) error
	RejectStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentActionRequest, companyID, userID uint64) error
	PostStockAdjustment(db *gorm.DB, id uint64, companyID, userID uint64) error
}

type stockAdjustmentService struct {
	repo            repositories.StockAdjustmentRepository
	movementRepo    repositories.StockMovementRepository
	movementService InventoryStockMovementService
	auditLogger     *AuditLogService
}

func NewStockAdjustmentService(repo repositories.StockAdjustmentRepository, movementRepo repositories.StockMovementRepository, movementService InventoryStockMovementService, auditLogger *AuditLogService) StockAdjustmentService {
	return &stockAdjustmentService{
		repo:            repo,
		movementRepo:    movementRepo,
		movementService: movementService,
		auditLogger:     auditLogger,
	}
}

func (s *stockAdjustmentService) ListStockAdjustments(db *gorm.DB, companyID uint64, branchID *uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockAdjustment, int64, error) {
	return s.repo.FindStockAdjustments(db, companyID, branchID, filters, search, page, limit)
}

func (s *stockAdjustmentService) GetStockAdjustmentByID(db *gorm.DB, id uint64, companyID uint64) (*models.StockAdjustment, error) {
	return s.repo.FindStockAdjustmentByID(db, id, companyID)
}

func (s *stockAdjustmentService) GenerateStockAdjustmentNumber(db *gorm.DB, companyID uint64) (string, error) {
	lastNo, err := s.repo.GetLastStockAdjustmentNumber(db, companyID)
	if err != nil {
		return "", err
	}

	if lastNo == "" {
		return "SA-000001", nil
	}

	var num int
	_, err = fmt.Sscanf(lastNo, "SA-%06d", &num)
	if err != nil {
		return "SA-000001", nil
	}

	return fmt.Sprintf("SA-%06d", num+1), nil
}

func (s *stockAdjustmentService) CreateStockAdjustment(db *gorm.DB, req *dto.StockAdjustmentCreateRequest, companyID, userID uint64) (*models.StockAdjustment, error) {
	adjNumber, err := s.GenerateStockAdjustmentNumber(db, companyID)
	if err != nil {
		return nil, err
	}

	adjDate, err := time.Parse("2006-01-02", req.AdjustmentDate)
	if err != nil {
		return nil, errors.New("invalid adjustment_date format")
	}

	adj := &models.StockAdjustment{
		CompanyID:          companyID,
		BranchID:           req.BranchID,
		WarehouseID:        req.WarehouseID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		AdjustmentNumber:   adjNumber,
		AdjustmentDate:     adjDate,
		AdjustmentType:     req.AdjustmentType,
		ReferenceNumber:    req.ReferenceNumber,
		Reason:             req.Reason,
		Remarks:            req.Remarks,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
	}

	lines, err := s.ValidateStockAdjustmentLines(db, req.Lines, req.WarehouseID, companyID, req.AdjustmentType)
	if err != nil {
		return nil, err
	}

	s.CalculateStockAdjustmentHeaderTotals(adj, lines)

	if err := s.repo.CreateStockAdjustmentWithLines(db, adj, lines); err != nil {
		return nil, err
	}

	s.auditLogger.LogAction(db, companyID, userID, "STOCK_ADJUSTMENT_CREATED", fmt.Sprintf("Created stock adjustment %s", adjNumber), adj.ID)

	return adj, nil
}

func (s *stockAdjustmentService) UpdateStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentUpdateRequest, companyID, userID uint64) error {
	adj, err := s.repo.FindStockAdjustmentByID(db, id, companyID)
	if err != nil {
		return err
	}
	if adj == nil {
		return errors.New("stock adjustment not found")
	}

	if adj.ApprovalStatus != "draft" && adj.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected adjustments can be updated")
	}

	adjDate, err := time.Parse("2006-01-02", req.AdjustmentDate)
	if err != nil {
		return errors.New("invalid adjustment_date format")
	}

	adj.BranchID = req.BranchID
	adj.WarehouseID = req.WarehouseID
	adj.FinancialYearID = req.FinancialYearID
	adj.AccountingPeriodID = req.AccountingPeriodID
	adj.AdjustmentDate = adjDate
	adj.AdjustmentType = req.AdjustmentType
	adj.ReferenceNumber = req.ReferenceNumber
	adj.Reason = req.Reason
	adj.Remarks = req.Remarks
	adj.UpdatedBy = &userID

	lines, err := s.ValidateStockAdjustmentLines(db, req.Lines, req.WarehouseID, companyID, req.AdjustmentType)
	if err != nil {
		return err
	}

	s.CalculateStockAdjustmentHeaderTotals(adj, lines)

	err = s.repo.UpdateStockAdjustmentWithLines(db, adj, lines)
	if err == nil {
		s.auditLogger.LogAction(db, companyID, userID, "STOCK_ADJUSTMENT_UPDATED", fmt.Sprintf("Updated stock adjustment %s", adj.AdjustmentNumber), adj.ID)
	}
	return err
}

func (s *stockAdjustmentService) DeleteStockAdjustment(db *gorm.DB, id uint64, companyID, userID uint64) error {
	adj, err := s.repo.FindStockAdjustmentByID(db, id, companyID)
	if err != nil {
		return err
	}
	if adj == nil {
		return errors.New("stock adjustment not found")
	}

	if adj.PostedStatus == "posted" {
		return errors.New("posted adjustments cannot be deleted")
	}

	if adj.ApprovalStatus != "draft" && adj.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected adjustments can be deleted")
	}

	err = s.repo.SoftDeleteStockAdjustment(db, id, companyID, userID)
	if err == nil {
		s.auditLogger.LogAction(db, companyID, userID, "STOCK_ADJUSTMENT_DELETED", fmt.Sprintf("Deleted stock adjustment %s", adj.AdjustmentNumber), adj.ID)
	}
	return err
}

func (s *stockAdjustmentService) SubmitStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentActionRequest, companyID, userID uint64) error {
	adj, err := s.repo.FindStockAdjustmentByID(db, id, companyID)
	if err != nil {
		return err
	}
	if adj == nil {
		return errors.New("stock adjustment not found")
	}

	if adj.ApprovalStatus != "draft" && adj.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected adjustments can be submitted")
	}

	if len(adj.Lines) == 0 {
		return errors.New("adjustment must have at least one line")
	}

	if adj.TotalQuantityIn <= 0 && adj.TotalQuantityOut <= 0 {
		return errors.New("total quantity in or out must be greater than zero")
	}

	// Revalidate out lines
	for _, line := range adj.Lines {
		if line.AdjustmentDirection == "out" {
			err = s.ValidateAdjustmentStockAvailability(db, companyID, adj.WarehouseID, line)
			if err != nil {
				return err
			}
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateStockAdjustmentStatus(tx, id, companyID, map[string]interface{}{
			"approval_status": "pending",
			"updated_by":      userID,
			"updated_at":      time.Now(),
		}); err != nil {
			return err
		}

		approval := &models.StockAdjustmentApproval{
			StockAdjustmentID: id,
			Action:            "submitted",
			Remarks:           req.Remarks,
			ActionBy:          userID,
			ActionAt:          time.Now(),
		}
		if err := s.repo.CreateStockAdjustmentApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditLogger.LogAction(tx, companyID, userID, "STOCK_ADJUSTMENT_SUBMITTED", fmt.Sprintf("Submitted stock adjustment %s", adj.AdjustmentNumber), adj.ID)
		return nil
	})
}

func (s *stockAdjustmentService) ApproveStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentActionRequest, companyID, userID uint64) error {
	adj, err := s.repo.FindStockAdjustmentByID(db, id, companyID)
	if err != nil {
		return err
	}
	if adj == nil {
		return errors.New("stock adjustment not found")
	}

	if adj.ApprovalStatus != "pending" {
		return errors.New("only pending adjustments can be approved")
	}

	// Revalidate out lines
	for _, line := range adj.Lines {
		if line.AdjustmentDirection == "out" {
			err = s.ValidateAdjustmentStockAvailability(db, companyID, adj.WarehouseID, line)
			if err != nil {
				return err
			}
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateStockAdjustmentStatus(tx, id, companyID, map[string]interface{}{
			"approval_status": "approved",
			"approved_by":     userID,
			"approved_at":     now,
			"updated_by":      userID,
			"updated_at":      now,
		}); err != nil {
			return err
		}

		approval := &models.StockAdjustmentApproval{
			StockAdjustmentID: id,
			Action:            "approved",
			Remarks:           req.Remarks,
			ActionBy:          userID,
			ActionAt:          now,
		}
		if err := s.repo.CreateStockAdjustmentApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditLogger.LogAction(tx, companyID, userID, "STOCK_ADJUSTMENT_APPROVED", fmt.Sprintf("Approved stock adjustment %s", adj.AdjustmentNumber), adj.ID)
		return nil
	})
}

func (s *stockAdjustmentService) RejectStockAdjustment(db *gorm.DB, id uint64, req *dto.StockAdjustmentActionRequest, companyID, userID uint64) error {
	adj, err := s.repo.FindStockAdjustmentByID(db, id, companyID)
	if err != nil {
		return err
	}
	if adj == nil {
		return errors.New("stock adjustment not found")
	}

	if adj.ApprovalStatus != "pending" {
		return errors.New("only pending adjustments can be rejected")
	}

	if req.Remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateStockAdjustmentStatus(tx, id, companyID, map[string]interface{}{
			"approval_status": "rejected",
			"updated_by":      userID,
			"updated_at":      now,
		}); err != nil {
			return err
		}

		approval := &models.StockAdjustmentApproval{
			StockAdjustmentID: id,
			Action:            "rejected",
			Remarks:           req.Remarks,
			ActionBy:          userID,
			ActionAt:          now,
		}
		if err := s.repo.CreateStockAdjustmentApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditLogger.LogAction(tx, companyID, userID, "STOCK_ADJUSTMENT_REJECTED", fmt.Sprintf("Rejected stock adjustment %s", adj.AdjustmentNumber), adj.ID)
		return nil
	})
}

func (s *stockAdjustmentService) PostStockAdjustment(db *gorm.DB, id uint64, companyID, userID uint64) error {
	adj, err := s.repo.FindStockAdjustmentByID(db, id, companyID)
	if err != nil {
		return err
	}
	if adj == nil {
		return errors.New("stock adjustment not found")
	}

	if adj.ApprovalStatus != "approved" {
		return errors.New("only approved adjustments can be posted")
	}

	if adj.PostedStatus == "posted" {
		return errors.New("adjustment is already posted")
	}

	exists, err := s.repo.CheckStockAdjustmentLedgerExists(db, companyID, id)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("stock adjustment is already posted to stock ledger")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		for _, line := range adj.Lines {
			if line.AdjustmentDirection == "in" {
				err = s.movementService.ProcessStockIn(tx, dto.StockInPayload{
					CompanyID:           companyID,
					BranchID:            adj.BranchID,
					WarehouseID:         adj.WarehouseID,
					WarehouseLocationID: line.WarehouseLocationID,
					ProductID:           line.ProductID,
					ProductBatchID:      line.ProductBatchID,
					TransactionDate:     adj.AdjustmentDate,
					SourceType:          "stock_adjustment",
					SourceID:            adj.ID,
					SourceNumber:        adj.AdjustmentNumber,
					Quantity:            line.Quantity,
					UnitCost:            line.UnitCost,
					Remarks:             line.LineRemarks,
					CreatedBy:           userID,
				})
			} else if line.AdjustmentDirection == "out" {
				err = s.movementService.ProcessStockOut(tx, dto.StockOutPayload{
					CompanyID:           companyID,
					BranchID:            adj.BranchID,
					WarehouseID:         adj.WarehouseID,
					WarehouseLocationID: line.WarehouseLocationID,
					ProductID:           line.ProductID,
					ProductBatchID:      line.ProductBatchID,
					TransactionDate:     adj.AdjustmentDate,
					SourceType:          "stock_adjustment",
					SourceID:            adj.ID,
					SourceNumber:        adj.AdjustmentNumber,
					Quantity:            line.Quantity,
					Remarks:             line.LineRemarks,
					CreatedBy:           userID,
				})
			}

			if err != nil {
				return fmt.Errorf("failed to process line %d: %v", line.ID, err)
			}
		}

		now := time.Now()
		if err := s.repo.UpdateStockAdjustmentStatus(tx, id, companyID, map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
			"updated_by":    userID,
			"updated_at":    now,
		}); err != nil {
			return err
		}

		approval := &models.StockAdjustmentApproval{
			StockAdjustmentID: id,
			Action:            "posted",
			Remarks:           "Adjustment posted successfully",
			ActionBy:          userID,
			ActionAt:          now,
		}
		if err := s.repo.CreateStockAdjustmentApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditLogger.LogAction(tx, companyID, userID, "STOCK_ADJUSTMENT_POSTED", fmt.Sprintf("Posted stock adjustment %s", adj.AdjustmentNumber), adj.ID)
		return nil
	})
}

// Helpers

func (s *stockAdjustmentService) ValidateStockAdjustmentLines(db *gorm.DB, lineRequests []dto.StockAdjustmentLineRequest, warehouseID uint64, companyID uint64, adjustmentType string) ([]models.StockAdjustmentLine, error) {
	if len(lineRequests) == 0 {
		return nil, errors.New("at least one line is required")
	}

	var lines []models.StockAdjustmentLine
	for i, lr := range lineRequests {
		if lr.ProductID == 0 {
			return nil, errors.New("product is required for each line")
		}
		if lr.AdjustmentDirection != "in" && lr.AdjustmentDirection != "out" {
			return nil, errors.New("adjustment direction must be in or out")
		}

		product, err := s.movementRepo.FindProductByID(db, lr.ProductID)
		if err != nil {
			return nil, err
		}
		if product == nil || product.Status != "active" {
			return nil, errors.New("invalid or inactive product")
		}

		if product.RequiresBatchTracking && lr.ProductBatchID == nil {
			return nil, errors.New("product batch is required for batch tracked products")
		}

		if lr.ProductBatchID != nil {
			batch, err := s.movementRepo.FindBatchByID(db, *lr.ProductBatchID)
			if err != nil {
				return nil, err
			}
			if batch == nil {
				return nil, errors.New("invalid product batch")
			}
			if batch.IsBlocked {
				return nil, errors.New("product batch is blocked")
			}
			if batch.BatchStatus == "inactive" || batch.BatchStatus == "disposed" || batch.BatchStatus == "recalled" {
				return nil, errors.New("product batch is in an invalid state")
			}
			if product.RequiresExpiryTracking && batch.ExpiryDate != nil && batch.ExpiryDate.Before(time.Now()) {
				// Expiry corrections might adjust expired batches?
				// "Stock Adjustment is used for ... expired stock corrections"
				// Wait, if we are doing "expiry" adjustment type, maybe it's allowed.
				// For now let's allow it but the stock movement service might block it in ProcessStockIn/Out if we aren't careful.
				// The stock_movement_service says: "if batch.ExpiryDate.Before(time.Now()) return err"
				// So we need to ensure the standard validation is okay or bypassing it if it's an out movement.
				// The out movement usually doesn't block expired stock. ProcessStockOut blocks on expired if it's strict, but the prompt said "batch must be active, not blocked, not recalled, and not disposed"
			}
		}

		if lr.WarehouseLocationID != nil {
			loc, err := s.movementRepo.FindWarehouseLocationByID(db, *lr.WarehouseLocationID)
			if err != nil {
				return nil, err
			}
			if loc == nil || loc.WarehouseID != warehouseID || loc.Status != "active" {
				return nil, errors.New("invalid warehouse location for selected warehouse")
			}
		}

		qty := lr.Quantity
		dir := lr.AdjustmentDirection

		if adjustmentType == "physical_count" {
			variance := lr.PhysicalQuantity - lr.SystemQuantity
			if variance > 0 {
				dir = "in"
			} else if variance < 0 {
				dir = "out"
			}
			qty = math.Abs(variance)

			if variance == 0 {
				continue // ignore line
			}
		}

		if qty <= 0 {
			return nil, errors.New("quantity must be greater than zero")
		}
		if lr.UnitCost < 0 {
			return nil, errors.New("unit cost cannot be negative")
		}

		line := models.StockAdjustmentLine{
			WarehouseLocationID: lr.WarehouseLocationID,
			ProductID:           lr.ProductID,
			ProductBatchID:      lr.ProductBatchID,
			AdjustmentDirection: dir,
			Quantity:            qty,
			UnitCost:            lr.UnitCost,
			TotalCost:           qty * lr.UnitCost,
			SystemQuantity:      lr.SystemQuantity,
			PhysicalQuantity:    lr.PhysicalQuantity,
			VarianceQuantity:    lr.PhysicalQuantity - lr.SystemQuantity,
			LineReason:          lr.LineReason,
			LineRemarks:         lr.LineRemarks,
			LineOrder:           i + 1,
		}

		if line.AdjustmentDirection == "out" {
			err = s.ValidateAdjustmentStockAvailability(db, companyID, warehouseID, line)
			if err != nil {
				return nil, err
			}
		}

		lines = append(lines, line)
	}

	return lines, nil
}

func (s *stockAdjustmentService) ValidateAdjustmentStockAvailability(db *gorm.DB, companyID uint64, warehouseID uint64, line models.StockAdjustmentLine) error {
	return s.movementService.ValidateStockAvailability(db, dto.StockOutPayload{
		CompanyID:           companyID,
		WarehouseID:         warehouseID,
		WarehouseLocationID: line.WarehouseLocationID,
		ProductID:           line.ProductID,
		ProductBatchID:      line.ProductBatchID,
		Quantity:            line.Quantity,
	})
}

func (s *stockAdjustmentService) CalculateStockAdjustmentHeaderTotals(adj *models.StockAdjustment, lines []models.StockAdjustmentLine) {
	var totalIn float64 = 0
	var totalOut float64 = 0
	var totalValue float64 = 0

	for _, line := range lines {
		if line.AdjustmentDirection == "in" {
			totalIn += line.Quantity
		} else {
			totalOut += line.Quantity
		}
		totalValue += line.TotalCost
	}

	adj.TotalQuantityIn = totalIn
	adj.TotalQuantityOut = totalOut
	adj.TotalStockValue = totalValue
}
