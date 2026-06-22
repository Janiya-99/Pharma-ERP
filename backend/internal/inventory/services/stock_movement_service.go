package services

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type InventoryStockMovementService interface {
	ProcessStockIn(db *gorm.DB, payload dto.StockInPayload) error
	ProcessStockOut(db *gorm.DB, payload interface{}) error
	ProcessStockTransfer(db *gorm.DB, payload interface{}) error
}

type inventoryStockMovementService struct {
	repo repositories.StockMovementRepository
}

func NewInventoryStockMovementService(repo repositories.StockMovementRepository) InventoryStockMovementService {
	return &inventoryStockMovementService{repo: repo}
}

func (s *inventoryStockMovementService) ProcessStockIn(db *gorm.DB, payload dto.StockInPayload) error {
	// 1. Validate Stock In Movement
	product, batch, err := s.validateStockInMovement(db, payload)
	if err != nil {
		return err
	}

	// 2. Get or Create Stock Balance
	balance, err := s.getOrCreateStockBalance(db, payload, product, batch)
	if err != nil {
		return err
	}

	// 3. Calculate new average cost
	newAverageCost := s.calculateAverageCost(balance.QuantityOnHand, balance.AverageCost, payload.Quantity, payload.UnitCost)

	// 4. Update Stock Balance
	balance.QuantityOnHand += payload.Quantity
	balance.AverageCost = newAverageCost
	balance.StockValue = s.calculateStockValue(balance.QuantityOnHand, balance.AverageCost)
	balance.QuantityAvailable = s.calculateAvailableQuantity(balance.QuantityOnHand, balance.QuantityAllocated)

	err = s.repo.UpdateStockBalance(db, balance)
	if err != nil {
		return err
	}

	// 5. Create Stock Ledger Entry
	return s.createStockLedgerEntry(db, payload, balance)
}

func (s *inventoryStockMovementService) ProcessStockOut(db *gorm.DB, payload interface{}) error {
	// Stub for future modules
	return errors.New("not implemented")
}

func (s *inventoryStockMovementService) ProcessStockTransfer(db *gorm.DB, payload interface{}) error {
	// Stub for future modules
	return errors.New("not implemented")
}

// Internal helper methods

func (s *inventoryStockMovementService) validateStockInMovement(db *gorm.DB, payload dto.StockInPayload) (*models.Product, *models.ProductBatch, error) {
	if payload.Quantity <= 0 {
		return nil, nil, errors.New("quantity must be greater than zero")
	}
	if payload.UnitCost < 0 {
		return nil, nil, errors.New("unit cost cannot be negative")
	}

	warehouse, err := s.repo.FindWarehouseByID(db, payload.WarehouseID)
	if err != nil {
		return nil, nil, err
	}
	if warehouse == nil || warehouse.Status != "active" {
		return nil, nil, errors.New("invalid or inactive warehouse")
	}

	if payload.WarehouseLocationID != nil {
		location, err := s.repo.FindWarehouseLocationByID(db, *payload.WarehouseLocationID)
		if err != nil {
			return nil, nil, err
		}
		if location == nil || location.WarehouseID != payload.WarehouseID || location.Status != "active" {
			return nil, nil, errors.New("invalid warehouse location")
		}
	}

	product, err := s.repo.FindProductByID(db, payload.ProductID)
	if err != nil {
		return nil, nil, err
	}
	if product == nil || product.Status != "active" {
		return nil, nil, errors.New("invalid or inactive product")
	}

	var batch *models.ProductBatch
	if product.RequiresBatchTracking {
		if payload.ProductBatchID == nil {
			return nil, nil, errors.New("product batch is required for batch-tracked product")
		}
		batch, err = s.repo.FindBatchByID(db, *payload.ProductBatchID)
		if err != nil {
			return nil, nil, err
		}
		if batch == nil {
			return nil, nil, errors.New("invalid product batch")
		}
		if batch.IsBlocked {
			return nil, nil, errors.New("product batch is blocked")
		}
		if batch.BatchStatus == "expired" || batch.BatchStatus == "recalled" || batch.BatchStatus == "disposed" || batch.BatchStatus == "inactive" {
			return nil, nil, errors.New("product batch is in invalid state for stock in")
		}
		if product.RequiresExpiryTracking && batch.ExpiryDate != nil && batch.ExpiryDate.Before(time.Now()) {
			return nil, nil, errors.New("product batch is expired")
		}
	}

	return product, batch, nil
}

func (s *inventoryStockMovementService) getOrCreateStockBalance(db *gorm.DB, payload dto.StockInPayload, product *models.Product, batch *models.ProductBatch) (*models.StockBalance, error) {
	balance, err := s.repo.FindStockBalance(db, payload.CompanyID, payload.WarehouseID, payload.WarehouseLocationID, payload.ProductID, payload.ProductBatchID)
	if err != nil {
		return nil, err
	}

	if balance == nil {
		balance = &models.StockBalance{
			CompanyID:           payload.CompanyID,
			BranchID:            payload.BranchID,
			WarehouseID:         payload.WarehouseID,
			WarehouseLocationID: payload.WarehouseLocationID,
			ProductID:           payload.ProductID,
			ProductBatchID:      payload.ProductBatchID,
			QuantityOnHand:      0,
			QuantityAllocated:   0,
			QuantityAvailable:   0,
			AverageCost:         0,
			StockValue:          0,
		}
		err = s.repo.CreateStockBalance(db, balance)
		if err != nil {
			return nil, err
		}
	}

	return balance, nil
}

func (s *inventoryStockMovementService) createStockLedgerEntry(db *gorm.DB, payload dto.StockInPayload, balance *models.StockBalance) error {
	totalCost := payload.Quantity * payload.UnitCost

	entry := &models.StockLedgerEntry{
		CompanyID:           payload.CompanyID,
		BranchID:            payload.BranchID,
		WarehouseID:         payload.WarehouseID,
		WarehouseLocationID: payload.WarehouseLocationID,
		ProductID:           payload.ProductID,
		ProductBatchID:      payload.ProductBatchID,
		TransactionDate:     payload.TransactionDate,
		SourceType:          payload.SourceType,
		SourceID:            &payload.SourceID,
		SourceNumber:        payload.SourceNumber,
		MovementType:        "in",
		QuantityIn:          payload.Quantity,
		QuantityOut:         0,
		BalanceQuantity:     balance.QuantityOnHand,
		UnitCost:            payload.UnitCost,
		TotalCost:           totalCost,
		Remarks:             payload.Remarks,
		CreatedBy:           &payload.CreatedBy,
	}

	return s.repo.CreateStockLedgerEntry(db, entry)
}

func (s *inventoryStockMovementService) calculateAverageCost(existingQty, existingCost, newQty, newCost float64) float64 {
	totalExistingValue := existingQty * existingCost
	totalNewValue := newQty * newCost
	totalQty := existingQty + newQty

	if totalQty == 0 {
		return 0
	}

	return (totalExistingValue + totalNewValue) / totalQty
}

func (s *inventoryStockMovementService) calculateStockValue(qty, avgCost float64) float64 {
	return qty * avgCost
}

func (s *inventoryStockMovementService) calculateAvailableQuantity(onHand, allocated float64) float64 {
	return onHand - allocated
}
