package services

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"gorm.io/gorm"
)

type InventoryLookupService struct {
	repo *repositories.InventoryLookupRepository
}

func NewInventoryLookupService(repo *repositories.InventoryLookupRepository) *InventoryLookupService {
	return &InventoryLookupService{repo: repo}
}

func dateString(t *time.Time) *string {
	if t == nil {
		return nil
	}
	formatted := t.Format("2006-01-02")
	return &formatted
}

func (s *InventoryLookupService) Products(db *gorm.DB, companyID uint64, search string, limit int) ([]dto.InvoiceInventoryProductLookup, error) {
	products, err := s.repo.FindProducts(db, companyID, search, limit)
	if err != nil {
		return nil, err
	}
	result := make([]dto.InvoiceInventoryProductLookup, 0, len(products))
	for _, product := range products {
		result = append(result, dto.InvoiceInventoryProductLookup{
			ProductID:      product.ID,
			ProductCode:    product.ProductCode,
			ProductName:    product.ProductName,
			BaseUnit:       "",
			BatchTracking:  product.RequiresBatchTracking,
			ExpiryTracking: product.RequiresExpiryTracking,
			Status:         product.Status,
		})
	}
	return result, nil
}

func (s *InventoryLookupService) ProductBatches(db *gorm.DB, companyID uint64, productID *uint64, allowExpired bool) ([]dto.InvoiceInventoryBatchLookup, error) {
	batches, err := s.repo.FindProductBatches(db, companyID, productID, allowExpired)
	if err != nil {
		return nil, err
	}
	result := make([]dto.InvoiceInventoryBatchLookup, 0, len(batches))
	for _, batch := range batches {
		result = append(result, dto.InvoiceInventoryBatchLookup{
			ProductBatchID:    batch.ID,
			ProductID:         batch.ProductID,
			BatchNumber:       batch.BatchNumber,
			ExpiryDate:        dateString(batch.ExpiryDate),
			ManufacturingDate: dateString(batch.ManufactureDate),
			BatchStatus:       batch.BatchStatus,
			MRP:               batch.MRP,
			SellingPrice:      batch.SellingPrice,
			StockUnitCost:     batch.PurchaseRate,
		})
	}
	return result, nil
}

func (s *InventoryLookupService) StockAvailability(db *gorm.DB, companyID, branchID uint64, productID, warehouseID, locationID, batchID *uint64, allowExpired bool) ([]dto.InvoiceStockAvailabilityLookup, error) {
	balances, err := s.repo.FindStockAvailability(db, companyID, branchID, productID, warehouseID, locationID, batchID, allowExpired)
	if err != nil {
		return nil, err
	}
	batchIDs := make([]uint64, 0, len(balances))
	for _, balance := range balances {
		if balance.ProductBatchID != nil {
			batchIDs = append(batchIDs, *balance.ProductBatchID)
		}
	}
	batchMap, err := s.repo.BatchMap(db, companyID, batchIDs)
	if err != nil {
		return nil, err
	}
	result := make([]dto.InvoiceStockAvailabilityLookup, 0, len(balances))
	for _, balance := range balances {
		item := dto.InvoiceStockAvailabilityLookup{
			ProductID:           balance.ProductID,
			ProductBatchID:      balance.ProductBatchID,
			WarehouseID:         balance.WarehouseID,
			WarehouseLocationID: balance.WarehouseLocationID,
			AvailableQuantity:   balance.QuantityAvailable,
			ReservedQuantity:    balance.QuantityAllocated,
			BlockedQuantity:     0,
			StockUnitCost:       balance.AverageCost,
		}
		if balance.ProductBatchID != nil {
			if batch, ok := batchMap[*balance.ProductBatchID]; ok {
				item.ExpiryDate = dateString(batch.ExpiryDate)
				item.BatchStatus = batch.BatchStatus
				item.SellingPrice = batch.SellingPrice
				item.MRP = batch.MRP
			}
		}
		result = append(result, item)
	}
	return result, nil
}

func (s *InventoryLookupService) Warehouses(db *gorm.DB, companyID, branchID uint64) ([]dto.InvoiceWarehouseLookup, error) {
	warehouses, err := s.repo.FindWarehouses(db, companyID, branchID)
	if err != nil {
		return nil, err
	}
	result := make([]dto.InvoiceWarehouseLookup, 0, len(warehouses))
	for _, warehouse := range warehouses {
		result = append(result, dto.InvoiceWarehouseLookup{
			WarehouseID:   warehouse.ID,
			BranchID:      warehouse.BranchID,
			WarehouseCode: warehouse.WarehouseCode,
			WarehouseName: warehouse.WarehouseName,
			WarehouseType: warehouse.WarehouseType,
			IsDefault:     warehouse.IsDefault,
			Status:        warehouse.Status,
		})
	}
	return result, nil
}

func (s *InventoryLookupService) WarehouseLocations(db *gorm.DB, companyID uint64, warehouseID *uint64) ([]dto.InvoiceWarehouseLocationLookup, error) {
	locations, err := s.repo.FindWarehouseLocations(db, companyID, warehouseID)
	if err != nil {
		return nil, err
	}
	result := make([]dto.InvoiceWarehouseLocationLookup, 0, len(locations))
	for _, location := range locations {
		result = append(result, dto.InvoiceWarehouseLocationLookup{
			WarehouseLocationID: location.ID,
			WarehouseID:         location.WarehouseID,
			LocationCode:        location.LocationCode,
			LocationName:        location.LocationName,
			Rack:                location.Rack,
			Shelf:               location.Shelf,
			Bin:                 location.Bin,
			StorageCondition:    location.StorageCondition,
			Status:              location.Status,
		})
	}
	return result, nil
}
