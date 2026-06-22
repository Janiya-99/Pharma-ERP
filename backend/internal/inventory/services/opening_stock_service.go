package services

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type OpeningStockService interface {
	ListOpeningStockEntries(filter dto.OpeningStockFilter) ([]dto.OpeningStockResponse, int64, error)
	GetOpeningStockEntryByID(companyID, id uint64) (*models.OpeningStockEntry, error)
	CreateOpeningStockEntry(payload dto.CreateOpeningStockPayload) (*models.OpeningStockEntry, error)
	UpdateOpeningStockEntry(id uint64, payload dto.UpdateOpeningStockPayload) (*models.OpeningStockEntry, error)
	DeleteOpeningStockEntry(companyID, id uint64, deletedBy uint64) error
	SubmitOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, submittedBy uint64) error
	ApproveOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, approvedBy uint64) error
	RejectOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, rejectedBy uint64) error
	PostOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, postedBy uint64) error
}

type openingStockService struct {
	db                      *gorm.DB
	repo                    repositories.OpeningStockRepository
	stockMovementRepo       repositories.StockMovementRepository
	stockMovementService    InventoryStockMovementService
	auditLogger             *AuditLogService
}

func NewOpeningStockService(
	db *gorm.DB,
	repo repositories.OpeningStockRepository,
	stockMovementRepo repositories.StockMovementRepository,
	stockMovementService InventoryStockMovementService,
	auditLogger *AuditLogService,
) OpeningStockService {
	return &openingStockService{
		db:                   db,
		repo:                 repo,
		stockMovementRepo:    stockMovementRepo,
		stockMovementService: stockMovementService,
		auditLogger:          auditLogger,
	}
}

func (s *openingStockService) ListOpeningStockEntries(filter dto.OpeningStockFilter) ([]dto.OpeningStockResponse, int64, error) {
	entries, total, err := s.repo.FindOpeningStockEntries(s.db, filter)
	if err != nil {
		return nil, 0, err
	}

	var response []dto.OpeningStockResponse
	for _, entry := range entries {
		response = append(response, dto.OpeningStockResponse{
			ID:                 entry.ID,
			OpeningStockNumber: entry.OpeningStockNumber,
			OpeningStockDate:   entry.OpeningStockDate,
			BranchID:           entry.BranchID,
			WarehouseID:        entry.WarehouseID,
			ReferenceNumber:    entry.ReferenceNumber,
			TotalQuantity:      entry.TotalQuantity,
			TotalStockValue:    entry.TotalStockValue,
			ApprovalStatus:     entry.ApprovalStatus,
			PostedStatus:       entry.PostedStatus,
			CreatedBy:          entry.CreatedBy,
			CreatedAt:          entry.CreatedAt,
		})
	}
	return response, total, nil
}

func (s *openingStockService) GetOpeningStockEntryByID(companyID, id uint64) (*models.OpeningStockEntry, error) {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, companyID, id)
	if err != nil {
		return nil, err
	}
	if entry == nil {
		return nil, errors.New("opening stock entry not found")
	}
	return entry, nil
}

func (s *openingStockService) GenerateOpeningStockNumber(companyID uint64) (string, error) {
	lastNumber, err := s.repo.GetLastOpeningStockNumber(s.db, companyID)
	if err != nil {
		return "", err
	}

	if lastNumber == "" {
		return "OS-000001", nil
	}

	var prefix string
	var numberStr string
	_, err = fmt.Sscanf(lastNumber, "%2s-%s", &prefix, &numberStr)
	if err != nil {
		return "OS-000001", nil
	}

	number, err := strconv.Atoi(numberStr)
	if err != nil {
		return "OS-000001", nil
	}

	return fmt.Sprintf("OS-%06d", number+1), nil
}

func (s *openingStockService) validateOpeningStockLines(payloadLines []dto.OpeningStockLinePayload, warehouseID uint64) ([]models.OpeningStockEntryLine, float64, float64, error) {
	var lines []models.OpeningStockEntryLine
	var totalQuantity, totalValue float64

	for i, line := range payloadLines {
		if line.Quantity <= 0 {
			return nil, 0, 0, fmt.Errorf("line %d: quantity must be greater than zero", i+1)
		}
		if line.UnitCost < 0 {
			return nil, 0, 0, fmt.Errorf("line %d: unit cost cannot be negative", i+1)
		}

		product, err := s.stockMovementRepo.FindProductByID(s.db, line.ProductID)
		if err != nil || product == nil || product.Status != "active" {
			return nil, 0, 0, fmt.Errorf("line %d: invalid or inactive product", i+1)
		}

		var expiryDate *time.Time

		if product.RequiresBatchTracking {
			if line.ProductBatchID == nil {
				return nil, 0, 0, fmt.Errorf("line %d: batch is required for this product", i+1)
			}
			batch, err := s.stockMovementRepo.FindBatchByID(s.db, *line.ProductBatchID)
			if err != nil || batch == nil {
				return nil, 0, 0, fmt.Errorf("line %d: invalid batch", i+1)
			}
			if batch.IsBlocked {
				return nil, 0, 0, fmt.Errorf("line %d: batch is blocked", i+1)
			}
			if product.RequiresExpiryTracking {
				if batch.ExpiryDate == nil {
					return nil, 0, 0, fmt.Errorf("line %d: expiry date is required for this product", i+1)
				}
				expiryDate = batch.ExpiryDate
			}
		}

		if line.WarehouseLocationID != nil {
			location, err := s.stockMovementRepo.FindWarehouseLocationByID(s.db, *line.WarehouseLocationID)
			if err != nil || location == nil || location.WarehouseID != warehouseID {
				return nil, 0, 0, fmt.Errorf("line %d: invalid warehouse location", i+1)
			}
		}

		totalCost := line.Quantity * line.UnitCost
		totalQuantity += line.Quantity
		totalValue += totalCost

		lines = append(lines, models.OpeningStockEntryLine{
			WarehouseLocationID: line.WarehouseLocationID,
			ProductID:           line.ProductID,
			ProductBatchID:      line.ProductBatchID,
			Quantity:            line.Quantity,
			UnitCost:            line.UnitCost,
			TotalCost:           totalCost,
			ExpiryDate:          expiryDate,
			LineRemarks:         line.LineRemarks,
			LineOrder:           i + 1,
		})
	}

	return lines, totalQuantity, totalValue, nil
}

func (s *openingStockService) CreateOpeningStockEntry(payload dto.CreateOpeningStockPayload) (*models.OpeningStockEntry, error) {
	warehouse, err := s.stockMovementRepo.FindWarehouseByID(s.db, payload.WarehouseID)
	if err != nil || warehouse == nil || warehouse.BranchID != payload.BranchID {
		return nil, errors.New("invalid warehouse for branch")
	}

	openingStockDate, err := time.Parse("2006-01-02", payload.OpeningStockDate)
	if err != nil {
		return nil, errors.New("invalid opening stock date")
	}

	lines, totalQty, totalVal, err := s.validateOpeningStockLines(payload.Lines, payload.WarehouseID)
	if err != nil {
		return nil, err
	}

	osNumber, err := s.GenerateOpeningStockNumber(payload.CompanyID)
	if err != nil {
		return nil, err
	}

	entry := &models.OpeningStockEntry{
		CompanyID:          payload.CompanyID,
		BranchID:           payload.BranchID,
		FinancialYearID:    payload.FinancialYearID,
		AccountingPeriodID: payload.AccountingPeriodID,
		OpeningStockNumber: osNumber,
		OpeningStockDate:   openingStockDate,
		WarehouseID:        payload.WarehouseID,
		ReferenceNumber:    payload.ReferenceNumber,
		Remarks:            payload.Remarks,
		TotalQuantity:      totalQty,
		TotalStockValue:    totalVal,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          payload.CreatedBy,
		UpdatedBy:          payload.CreatedBy,
		Lines:              lines,
	}

	err = s.repo.CreateOpeningStockEntryWithLines(s.db, entry)
	if err != nil {
		return nil, err
	}

	s.auditLogger.LogAction(payload.CompanyID, payload.CreatedBy, "OPENING_STOCK_CREATED", "Opening Stock Entry", entry.ID)

	return entry, nil
}

func (s *openingStockService) UpdateOpeningStockEntry(id uint64, payload dto.UpdateOpeningStockPayload) (*models.OpeningStockEntry, error) {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, payload.CompanyID, id)
	if err != nil {
		return nil, err
	}
	if entry == nil {
		return nil, errors.New("opening stock entry not found")
	}

	if entry.ApprovalStatus != "draft" && entry.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected entries can be updated")
	}

	warehouse, err := s.stockMovementRepo.FindWarehouseByID(s.db, payload.WarehouseID)
	if err != nil || warehouse == nil || warehouse.BranchID != payload.BranchID {
		return nil, errors.New("invalid warehouse for branch")
	}

	openingStockDate, err := time.Parse("2006-01-02", payload.OpeningStockDate)
	if err != nil {
		return nil, errors.New("invalid opening stock date")
	}

	lines, totalQty, totalVal, err := s.validateOpeningStockLines(payload.Lines, payload.WarehouseID)
	if err != nil {
		return nil, err
	}

	entry.BranchID = payload.BranchID
	entry.FinancialYearID = payload.FinancialYearID
	entry.AccountingPeriodID = payload.AccountingPeriodID
	entry.OpeningStockDate = openingStockDate
	entry.WarehouseID = payload.WarehouseID
	entry.ReferenceNumber = payload.ReferenceNumber
	entry.Remarks = payload.Remarks
	entry.TotalQuantity = totalQty
	entry.TotalStockValue = totalVal
	entry.UpdatedBy = payload.UpdatedBy
	entry.Lines = lines

	err = s.repo.UpdateOpeningStockEntryWithLines(s.db, entry)
	if err != nil {
		return nil, err
	}

	s.auditLogger.LogAction(payload.CompanyID, payload.UpdatedBy, "OPENING_STOCK_UPDATED", "Opening Stock Entry", entry.ID)

	return entry, nil
}

func (s *openingStockService) DeleteOpeningStockEntry(companyID, id uint64, deletedBy uint64) error {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, companyID, id)
	if err != nil {
		return err
	}
	if entry == nil {
		return errors.New("opening stock entry not found")
	}

	if entry.PostedStatus == "posted" {
		return errors.New("posted entries cannot be deleted")
	}
	if entry.ApprovalStatus != "draft" && entry.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected entries can be deleted")
	}

	err = s.repo.SoftDeleteOpeningStockEntry(s.db, companyID, id, deletedBy)
	if err != nil {
		return err
	}

	s.auditLogger.LogAction(companyID, deletedBy, "OPENING_STOCK_DELETED", "Opening Stock Entry", id)
	return nil
}

func (s *openingStockService) SubmitOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, submittedBy uint64) error {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, companyID, id)
	if err != nil {
		return err
	}
	if entry == nil {
		return errors.New("opening stock entry not found")
	}

	if entry.ApprovalStatus != "draft" && entry.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected entries can be submitted")
	}

	if len(entry.Lines) == 0 {
		return errors.New("entry must have at least one line")
	}
	if entry.TotalQuantity <= 0 {
		return errors.New("total quantity must be greater than zero")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		entry.ApprovalStatus = "pending"
		entry.UpdatedBy = submittedBy
		if err := tx.Save(entry).Error; err != nil {
			return err
		}

		approval := &models.OpeningStockEntryApproval{
			OpeningStockEntryID: entry.ID,
			Action:              "submitted",
			Remarks:             payload.Remarks,
			ActionBy:            submittedBy,
			ActionAt:            time.Now(),
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditLogger.LogAction(companyID, submittedBy, "OPENING_STOCK_SUBMITTED", "Opening Stock Entry", entry.ID)
		return nil
	})
}

func (s *openingStockService) ApproveOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, approvedBy uint64) error {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, companyID, id)
	if err != nil {
		return err
	}
	if entry == nil {
		return errors.New("opening stock entry not found")
	}

	if entry.ApprovalStatus != "pending" {
		return errors.New("only pending entries can be approved")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		entry.ApprovalStatus = "approved"
		entry.ApprovedBy = &approvedBy
		entry.ApprovedAt = &now
		entry.UpdatedBy = approvedBy
		if err := tx.Save(entry).Error; err != nil {
			return err
		}

		approval := &models.OpeningStockEntryApproval{
			OpeningStockEntryID: entry.ID,
			Action:              "approved",
			Remarks:             payload.Remarks,
			ActionBy:            approvedBy,
			ActionAt:            now,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditLogger.LogAction(companyID, approvedBy, "OPENING_STOCK_APPROVED", "Opening Stock Entry", entry.ID)
		return nil
	})
}

func (s *openingStockService) RejectOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, rejectedBy uint64) error {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, companyID, id)
	if err != nil {
		return err
	}
	if entry == nil {
		return errors.New("opening stock entry not found")
	}

	if entry.ApprovalStatus != "pending" {
		return errors.New("only pending entries can be rejected")
	}

	if payload.Remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		entry.ApprovalStatus = "rejected"
		entry.UpdatedBy = rejectedBy
		if err := tx.Save(entry).Error; err != nil {
			return err
		}

		approval := &models.OpeningStockEntryApproval{
			OpeningStockEntryID: entry.ID,
			Action:              "rejected",
			Remarks:             payload.Remarks,
			ActionBy:            rejectedBy,
			ActionAt:            time.Now(),
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditLogger.LogAction(companyID, rejectedBy, "OPENING_STOCK_REJECTED", "Opening Stock Entry", entry.ID)
		return nil
	})
}

func (s *openingStockService) PostOpeningStockEntry(companyID, id uint64, payload dto.ActionOpeningStockPayload, postedBy uint64) error {
	entry, err := s.repo.FindOpeningStockEntryByID(s.db, companyID, id)
	if err != nil {
		return err
	}
	if entry == nil {
		return errors.New("opening stock entry not found")
	}

	if entry.ApprovalStatus != "approved" {
		return errors.New("only approved entries can be posted")
	}
	if entry.PostedStatus == "posted" {
		return errors.New("entry is already posted")
	}

	exists, err := s.repo.CheckOpeningStockLedgerExists(s.db, companyID, entry.ID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("opening stock entry is already posted to stock ledger")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Process each line as a Stock In movement
		for _, line := range entry.Lines {
			movementPayload := dto.StockInPayload{
				CompanyID:           companyID,
				BranchID:            entry.BranchID,
				WarehouseID:         entry.WarehouseID,
				WarehouseLocationID: line.WarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				TransactionDate:     entry.OpeningStockDate,
				SourceType:          "opening_stock",
				SourceID:            entry.ID,
				SourceNumber:        entry.OpeningStockNumber,
				Quantity:            line.Quantity,
				UnitCost:            line.UnitCost,
				Remarks:             line.LineRemarks,
				CreatedBy:           postedBy,
			}

			if err := s.stockMovementService.ProcessStockIn(tx, movementPayload); err != nil {
				return fmt.Errorf("failed to process stock in for product %d: %w", line.ProductID, err)
			}
		}

		// Update entry status
		now := time.Now()
		entry.PostedStatus = "posted"
		entry.PostedBy = &postedBy
		entry.PostedAt = &now
		entry.UpdatedBy = postedBy
		if err := tx.Save(entry).Error; err != nil {
			return err
		}

		// Add approval record
		approval := &models.OpeningStockEntryApproval{
			OpeningStockEntryID: entry.ID,
			Action:              "posted",
			Remarks:             payload.Remarks,
			ActionBy:            postedBy,
			ActionAt:            now,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditLogger.LogAction(companyID, postedBy, "OPENING_STOCK_POSTED", "Opening Stock Entry", entry.ID)
		return nil
	})
}
