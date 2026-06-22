package services

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type StockTransferService interface {
	ListStockTransfers(db *gorm.DB, companyID uint64, filters dto.ListStockTransfersFilters) ([]models.StockTransfer, int64, error)
	GetStockTransferByID(db *gorm.DB, companyID, id uint64) (*models.StockTransfer, error)
	CreateStockTransfer(db *gorm.DB, companyID, userID uint64, req dto.CreateStockTransferRequest) (*models.StockTransfer, error)
	UpdateStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.UpdateStockTransferRequest) error
	DeleteStockTransfer(db *gorm.DB, companyID, userID, id uint64) error
	SubmitStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.SubmitStockTransferRequest) error
	ApproveStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.ApproveStockTransferRequest) error
	RejectStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.RejectStockTransferRequest) error
	PostStockTransfer(db *gorm.DB, companyID, userID, id uint64) error
}

type stockTransferService struct {
	repo               repositories.StockTransferRepository
	stockMovementSvc   InventoryStockMovementService
	stockMovementRepo  repositories.StockMovementRepository
	auditLogger        *AuditLogService
}

func NewStockTransferService(repo repositories.StockTransferRepository, smSvc InventoryStockMovementService, smRepo repositories.StockMovementRepository, auditLogger *AuditLogService) StockTransferService {
	return &stockTransferService{
		repo:               repo,
		stockMovementSvc:   smSvc,
		stockMovementRepo:  smRepo,
		auditLogger:        auditLogger,
	}
}

func (s *stockTransferService) ListStockTransfers(db *gorm.DB, companyID uint64, filters dto.ListStockTransfersFilters) ([]models.StockTransfer, int64, error) {
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.Limit <= 0 {
		filters.Limit = 10
	}
	return s.repo.FindStockTransfers(db, companyID, filters)
}

func (s *stockTransferService) GetStockTransferByID(db *gorm.DB, companyID, id uint64) (*models.StockTransfer, error) {
	return s.repo.FindStockTransferByID(db, companyID, id)
}

func (s *stockTransferService) GenerateStockTransferNumber(db *gorm.DB, companyID uint64) (string, error) {
	lastNumber, err := s.repo.GetLastStockTransferNumber(db, companyID)
	if err != nil {
		return "", err
	}

	if lastNumber == "" {
		return "ST-000001", nil
	}

	parts := strings.Split(lastNumber, "-")
	if len(parts) != 2 {
		return "ST-000001", nil
	}

	numPart, err := strconv.Atoi(parts[1])
	if err != nil {
		return "ST-000001", nil
	}

	nextNum := numPart + 1
	return fmt.Sprintf("ST-%06d", nextNum), nil
}

func (s *stockTransferService) CreateStockTransfer(db *gorm.DB, companyID, userID uint64, req dto.CreateStockTransferRequest) (*models.StockTransfer, error) {
	err := s.ValidateSourceDestination(req.FromWarehouseID, req.ToWarehouseID)
	if err != nil {
		return nil, err
	}

	transferDate, err := time.Parse("2006-01-02", req.TransferDate)
	if err != nil {
		return nil, errors.New("invalid transfer_date format. Expected YYYY-MM-DD")
	}

	transferNumber, err := s.GenerateStockTransferNumber(db, companyID)
	if err != nil {
		return nil, errors.New("failed to generate transfer number")
	}

	transfer := &models.StockTransfer{
		CompanyID:          companyID,
		BranchID:           req.BranchID,
		FromWarehouseID:    req.FromWarehouseID,
		ToWarehouseID:      req.ToWarehouseID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		TransferNumber:     transferNumber,
		TransferDate:       transferDate,
		ReferenceNumber:    req.ReferenceNumber,
		Remarks:            req.Remarks,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          userID,
		UpdatedBy:          userID,
	}

	var lines []models.StockTransferLine
	for i, lineReq := range req.Lines {
		err := s.validateLocations(req.FromWarehouseID, lineReq.FromWarehouseLocationID, req.ToWarehouseID, lineReq.ToWarehouseLocationID)
		if err != nil {
			return nil, fmt.Errorf("line %d error: %w", i+1, err)
		}

		err = s.stockMovementSvc.ValidateStockAvailability(db, dto.StockOutPayload{
			CompanyID:           companyID,
			BranchID:            req.BranchID,
			WarehouseID:         req.FromWarehouseID,
			WarehouseLocationID: lineReq.FromWarehouseLocationID,
			ProductID:           lineReq.ProductID,
			ProductBatchID:      lineReq.ProductBatchID,
			Quantity:            lineReq.Quantity,
		})
		if err != nil {
			return nil, fmt.Errorf("line %d stock validation failed: %w", i+1, err)
		}

		// get average cost from stock balance
		balance, err := s.stockMovementRepo.FindStockBalance(db, companyID, req.FromWarehouseID, lineReq.FromWarehouseLocationID, lineReq.ProductID, lineReq.ProductBatchID)
		if err != nil || balance == nil {
			return nil, fmt.Errorf("stock balance not found for line %d", i+1)
		}

		unitCost := balance.AverageCost
		totalCost := unitCost * lineReq.Quantity

		line := models.StockTransferLine{
			FromWarehouseLocationID: lineReq.FromWarehouseLocationID,
			ToWarehouseLocationID:   lineReq.ToWarehouseLocationID,
			ProductID:               lineReq.ProductID,
			ProductBatchID:          lineReq.ProductBatchID,
			Quantity:                lineReq.Quantity,
			UnitCost:                unitCost,
			TotalCost:               totalCost,
			LineRemarks:             lineReq.LineRemarks,
			LineOrder:               lineReq.LineOrder,
		}
		lines = append(lines, line)
	}

	transfer.Lines = lines
	
	s.CalculateStockTransferHeaderTotals(transfer)

	err = s.repo.CreateStockTransferWithLines(db, transfer)
	if err != nil {
		return nil, err
	}

	s.auditLogger.LogAction(db, companyID, userID, "STOCK_TRANSFER_CREATED", "Stock Transfer", transfer.ID)

	return transfer, nil
}

func (s *stockTransferService) UpdateStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.UpdateStockTransferRequest) error {
	transfer, err := s.repo.FindStockTransferByID(db, companyID, id)
	if err != nil {
		return err
	}
	if transfer == nil {
		return errors.New("stock transfer not found")
	}

	if transfer.ApprovalStatus != "draft" && transfer.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected stock transfers can be updated")
	}

	err = s.ValidateSourceDestination(req.FromWarehouseID, req.ToWarehouseID)
	if err != nil {
		return err
	}

	transferDate, err := time.Parse("2006-01-02", req.TransferDate)
	if err != nil {
		return errors.New("invalid transfer_date format. Expected YYYY-MM-DD")
	}

	transfer.BranchID = req.BranchID
	transfer.FromWarehouseID = req.FromWarehouseID
	transfer.ToWarehouseID = req.ToWarehouseID
	transfer.FinancialYearID = req.FinancialYearID
	transfer.AccountingPeriodID = req.AccountingPeriodID
	transfer.TransferDate = transferDate
	transfer.ReferenceNumber = req.ReferenceNumber
	transfer.Remarks = req.Remarks
	transfer.UpdatedBy = userID

	var lines []models.StockTransferLine
	for i, lineReq := range req.Lines {
		err := s.validateLocations(req.FromWarehouseID, lineReq.FromWarehouseLocationID, req.ToWarehouseID, lineReq.ToWarehouseLocationID)
		if err != nil {
			return fmt.Errorf("line %d error: %w", i+1, err)
		}

		err = s.stockMovementSvc.ValidateStockAvailability(db, dto.StockOutPayload{
			CompanyID:           companyID,
			BranchID:            req.BranchID,
			WarehouseID:         req.FromWarehouseID,
			WarehouseLocationID: lineReq.FromWarehouseLocationID,
			ProductID:           lineReq.ProductID,
			ProductBatchID:      lineReq.ProductBatchID,
			Quantity:            lineReq.Quantity,
		})
		if err != nil {
			return fmt.Errorf("line %d stock validation failed: %w", i+1, err)
		}

		balance, err := s.stockMovementRepo.FindStockBalance(db, companyID, req.FromWarehouseID, lineReq.FromWarehouseLocationID, lineReq.ProductID, lineReq.ProductBatchID)
		if err != nil || balance == nil {
			return fmt.Errorf("stock balance not found for line %d", i+1)
		}

		unitCost := balance.AverageCost
		totalCost := unitCost * lineReq.Quantity

		line := models.StockTransferLine{
			StockTransferID:         transfer.ID,
			FromWarehouseLocationID: lineReq.FromWarehouseLocationID,
			ToWarehouseLocationID:   lineReq.ToWarehouseLocationID,
			ProductID:               lineReq.ProductID,
			ProductBatchID:          lineReq.ProductBatchID,
			Quantity:                lineReq.Quantity,
			UnitCost:                unitCost,
			TotalCost:               totalCost,
			LineRemarks:             lineReq.LineRemarks,
			LineOrder:               lineReq.LineOrder,
		}
		lines = append(lines, line)
	}

	transfer.Lines = lines
	s.CalculateStockTransferHeaderTotals(transfer)

	err = s.repo.UpdateStockTransferWithLines(db, transfer)
	if err == nil {
		s.auditLogger.LogAction(db, companyID, userID, "STOCK_TRANSFER_SUBMITTED", "Stock Transfer", transfer.ID)
	}

	return err
}

func (s *stockTransferService) DeleteStockTransfer(db *gorm.DB, companyID, userID, id uint64) error {
	transfer, err := s.repo.FindStockTransferByID(db, companyID, id)
	if err != nil {
		return err
	}
	if transfer == nil {
		return errors.New("stock transfer not found")
	}

	if transfer.PostedStatus == "posted" {
		return errors.New("posted stock transfers cannot be deleted")
	}

	if transfer.ApprovalStatus != "draft" && transfer.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected transfers can be deleted")
	}

	transfer.UpdatedBy = userID
	s.repo.UpdateStockTransferStatus(db, transfer)

	err = s.repo.SoftDeleteStockTransfer(db, transfer)
	if err == nil {
		s.auditLogger.LogAction(db, companyID, userID, "STOCK_TRANSFER_REJECTED", "Stock Transfer", transfer.ID)
	}

	return err
}

func (s *stockTransferService) SubmitStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.SubmitStockTransferRequest) error {
	transfer, err := s.repo.FindStockTransferByID(db, companyID, id)
	if err != nil {
		return err
	}
	if transfer == nil {
		return errors.New("stock transfer not found")
	}

	if transfer.ApprovalStatus != "draft" && transfer.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected transfers can be submitted")
	}

	if len(transfer.Lines) == 0 {
		return errors.New("transfer must have at least one line item")
	}

	if transfer.TotalQuantity <= 0 {
		return errors.New("total quantity must be greater than zero")
	}

	// Revalidate availability
	for _, line := range transfer.Lines {
		err = s.stockMovementSvc.ValidateStockAvailability(db, dto.StockOutPayload{
			CompanyID:           companyID,
			WarehouseID:         transfer.FromWarehouseID,
			WarehouseLocationID: line.FromWarehouseLocationID,
			ProductID:           line.ProductID,
			ProductBatchID:      line.ProductBatchID,
			Quantity:            line.Quantity,
		})
		if err != nil {
			return fmt.Errorf("validation failed for product ID %d: %w", line.ProductID, err)
		}
	}

	transfer.ApprovalStatus = "pending"
	transfer.UpdatedBy = userID

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateStockTransferStatus(tx, transfer); err != nil {
			return err
		}

		approval := &models.StockTransferApproval{
			StockTransferID: transfer.ID,
			Action:          "submitted",
			Remarks:         req.Remarks,
			ActionBy:        userID,
			ActionAt:        time.Now(),
		}
		return s.repo.CreateStockTransferApprovalRecord(tx, approval)
	})

	return err
}

func (s *stockTransferService) ApproveStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.ApproveStockTransferRequest) error {
	transfer, err := s.repo.FindStockTransferByID(db, companyID, id)
	if err != nil {
		return err
	}
	if transfer == nil {
		return errors.New("stock transfer not found")
	}

	if transfer.ApprovalStatus != "pending" {
		return errors.New("only pending transfers can be approved")
	}

	// Revalidate availability
	for _, line := range transfer.Lines {
		err = s.stockMovementSvc.ValidateStockAvailability(db, dto.StockOutPayload{
			CompanyID:           companyID,
			WarehouseID:         transfer.FromWarehouseID,
			WarehouseLocationID: line.FromWarehouseLocationID,
			ProductID:           line.ProductID,
			ProductBatchID:      line.ProductBatchID,
			Quantity:            line.Quantity,
		})
		if err != nil {
			return fmt.Errorf("validation failed for product ID %d: %w", line.ProductID, err)
		}
	}

	now := time.Now()
	transfer.ApprovalStatus = "approved"
	transfer.ApprovedBy = &userID
	transfer.ApprovedAt = &now
	transfer.UpdatedBy = userID

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateStockTransferStatus(tx, transfer); err != nil {
			return err
		}

		approval := &models.StockTransferApproval{
			StockTransferID: transfer.ID,
			Action:          "approved",
			Remarks:         req.Remarks,
			ActionBy:        userID,
			ActionAt:        now,
		}
		return s.repo.CreateStockTransferApprovalRecord(tx, approval)
	})

	if err == nil {
		s.auditLogger.LogAction(db, companyID, userID, "STOCK_TRANSFER_APPROVED", "Stock Transfer", transfer.ID)
	}

	return err
}

func (s *stockTransferService) RejectStockTransfer(db *gorm.DB, companyID, userID, id uint64, req dto.RejectStockTransferRequest) error {
	transfer, err := s.repo.FindStockTransferByID(db, companyID, id)
	if err != nil {
		return err
	}
	if transfer == nil {
		return errors.New("stock transfer not found")
	}

	if transfer.ApprovalStatus != "pending" {
		return errors.New("only pending transfers can be rejected")
	}

	transfer.ApprovalStatus = "rejected"
	transfer.UpdatedBy = userID

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateStockTransferStatus(tx, transfer); err != nil {
			return err
		}

		approval := &models.StockTransferApproval{
			StockTransferID: transfer.ID,
			Action:          "rejected",
			Remarks:         req.Remarks,
			ActionBy:        userID,
			ActionAt:        time.Now(),
		}
		return s.repo.CreateStockTransferApprovalRecord(tx, approval)
	})

	return err
}

func (s *stockTransferService) PostStockTransfer(db *gorm.DB, companyID, userID, id uint64) error {
	transfer, err := s.repo.FindStockTransferByID(db, companyID, id)
	if err != nil {
		return err
	}
	if transfer == nil {
		return errors.New("stock transfer not found")
	}

	if transfer.ApprovalStatus != "approved" {
		return errors.New("only approved transfers can be posted")
	}
	if transfer.PostedStatus == "posted" {
		return errors.New("transfer is already posted")
	}

	exists, err := s.repo.CheckStockTransferLedgerExists(db, companyID, transfer.ID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("Stock transfer is already posted to stock ledger")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		for i, line := range transfer.Lines {
			// Validate Source
			err = s.stockMovementSvc.ValidateStockAvailability(tx, dto.StockOutPayload{
				CompanyID:           companyID,
				BranchID:            transfer.BranchID,
				WarehouseID:         transfer.FromWarehouseID,
				WarehouseLocationID: line.FromWarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				Quantity:            line.Quantity,
			})
			if err != nil {
				return fmt.Errorf("validation failed for product ID %d: %w", line.ProductID, err)
			}

			balance, err := s.stockMovementRepo.FindStockBalance(tx, companyID, transfer.FromWarehouseID, line.FromWarehouseLocationID, line.ProductID, line.ProductBatchID)
			if err != nil || balance == nil {
				return fmt.Errorf("stock balance not found for line %d", i+1)
			}

			outPayload := dto.StockOutPayload{
				CompanyID:           companyID,
				BranchID:            transfer.BranchID,
				WarehouseID:         transfer.FromWarehouseID,
				WarehouseLocationID: line.FromWarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				TransactionDate:     time.Now(),
				SourceType:          "stock_transfer",
				SourceID:            transfer.ID,
				SourceNumber:        transfer.TransferNumber,
				Quantity:            line.Quantity,
				UnitCost:            balance.AverageCost,
				Remarks:             transfer.Remarks,
				CreatedBy:           userID,
			}

			if err := s.stockMovementSvc.ProcessStockOut(tx, outPayload); err != nil {
				return fmt.Errorf("failed to process stock out for line %d: %w", i+1, err)
			}

			inPayload := dto.StockInPayload{
				CompanyID:           companyID,
				BranchID:            transfer.BranchID,
				WarehouseID:         transfer.ToWarehouseID,
				WarehouseLocationID: line.ToWarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				TransactionDate:     time.Now(),
				SourceType:          "stock_transfer",
				SourceID:            transfer.ID,
				SourceNumber:        transfer.TransferNumber,
				Quantity:            line.Quantity,
				UnitCost:            balance.AverageCost, // Use exact source average_cost
				Remarks:             transfer.Remarks,
				CreatedBy:           userID,
			}

			if err := s.stockMovementSvc.ProcessStockIn(tx, inPayload); err != nil {
				return fmt.Errorf("failed to process stock in for line %d: %w", i+1, err)
			}
		}

		now := time.Now()
		transfer.PostedStatus = "posted"
		transfer.PostedBy = &userID
		transfer.PostedAt = &now
		transfer.UpdatedBy = userID

		if err := s.repo.UpdateStockTransferStatus(tx, transfer); err != nil {
			return err
		}

		approval := &models.StockTransferApproval{
			StockTransferID: transfer.ID,
			Action:          "posted",
			Remarks:         "Transfer posted to ledger",
			ActionBy:        userID,
			ActionAt:        now,
		}
		return s.repo.CreateStockTransferApprovalRecord(tx, approval)
	})

	if err == nil {
		s.auditLogger.LogAction(db, companyID, userID, "STOCK_TRANSFER_POSTED", "Stock Transfer", transfer.ID)
	}

	return err
}

func (s *stockTransferService) ValidateSourceDestination(fromWarehouseID, toWarehouseID uint64) error {
	if fromWarehouseID == toWarehouseID {
		return errors.New("source and destination warehouses cannot be the same unless transferring between different locations in the same warehouse")
	}
	return nil
}

// validateLocations checks if the exact same location is not being transferred to
func (s *stockTransferService) validateLocations(fromWh uint64, fromLoc *uint64, toWh uint64, toLoc *uint64) error {
	if fromWh == toWh {
		if fromLoc != nil && toLoc != nil && *fromLoc == *toLoc {
			return errors.New("source and destination cannot be exactly the same warehouse and location")
		}
		if fromLoc == nil && toLoc == nil {
			return errors.New("source and destination cannot be exactly the same warehouse without locations")
		}
	}
	return nil
}

func (s *stockTransferService) CalculateStockTransferHeaderTotals(transfer *models.StockTransfer) {
	var totalQty float64
	var totalValue float64

	for _, line := range transfer.Lines {
		totalQty += line.Quantity
		totalValue += line.TotalCost
	}

	transfer.TotalQuantity = totalQty
	transfer.TotalStockValue = totalValue
}
