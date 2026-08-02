package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type StockMovementRepository interface {
	FindStockBalance(db *gorm.DB, companyID, warehouseID uint64, warehouseLocationID *uint64, productID uint64, batchID *uint64) (*models.StockBalance, error)
	CreateStockBalance(db *gorm.DB, balance *models.StockBalance) error
	UpdateStockBalance(db *gorm.DB, balance *models.StockBalance) error
	CreateStockLedgerEntry(db *gorm.DB, entry *models.StockLedgerEntry) error
	FindProductByID(db *gorm.DB, productID uint64) (*models.Product, error)
	FindBatchByID(db *gorm.DB, batchID uint64) (*models.ProductBatch, error)
	FindWarehouseByID(db *gorm.DB, warehouseID uint64) (*models.Warehouse, error)
	FindWarehouseLocationByID(db *gorm.DB, locationID uint64) (*models.WarehouseLocation, error)
}

type stockMovementRepository struct{}

func NewStockMovementRepository() StockMovementRepository {
	return &stockMovementRepository{}
}

func (r *stockMovementRepository) FindStockBalance(db *gorm.DB, companyID, warehouseID uint64, warehouseLocationID *uint64, productID uint64, batchID *uint64) (*models.StockBalance, error) {
	var balance models.StockBalance
	query := db.Where("company_id = ? AND warehouse_id = ? AND product_id = ?", companyID, warehouseID, productID)

	if warehouseLocationID != nil {
		query = query.Where("warehouse_location_id = ?", *warehouseLocationID)
	} else {
		query = query.Where("warehouse_location_id IS NULL")
	}

	if batchID != nil {
		query = query.Where("product_batch_id = ?", *batchID)
	} else {
		query = query.Where("product_batch_id IS NULL")
	}

	err := query.First(&balance).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Return nil if not found
		}
		return nil, err
	}
	return &balance, nil
}

func (r *stockMovementRepository) CreateStockBalance(db *gorm.DB, balance *models.StockBalance) error {
	return db.Create(balance).Error
}

func (r *stockMovementRepository) UpdateStockBalance(db *gorm.DB, balance *models.StockBalance) error {
	return db.Save(balance).Error
}

func (r *stockMovementRepository) CreateStockLedgerEntry(db *gorm.DB, entry *models.StockLedgerEntry) error {
	return db.Create(entry).Error
}

func (r *stockMovementRepository) FindProductByID(db *gorm.DB, productID uint64) (*models.Product, error) {
	var product models.Product
	err := db.First(&product, productID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (r *stockMovementRepository) FindBatchByID(db *gorm.DB, batchID uint64) (*models.ProductBatch, error) {
	var batch models.ProductBatch
	err := db.First(&batch, batchID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &batch, nil
}

func (r *stockMovementRepository) FindWarehouseByID(db *gorm.DB, warehouseID uint64) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := db.First(&warehouse, warehouseID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &warehouse, nil
}

func (r *stockMovementRepository) FindWarehouseLocationByID(db *gorm.DB, locationID uint64) (*models.WarehouseLocation, error) {
	var location models.WarehouseLocation
	err := db.First(&location, locationID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &location, nil
}
