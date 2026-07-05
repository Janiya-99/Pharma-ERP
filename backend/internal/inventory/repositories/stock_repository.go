package repositories

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type StockRepository struct{}

func NewStockRepository() *StockRepository {
	return &StockRepository{}
}

func (r *StockRepository) ListBalances(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockBalance, int64, error) {
	query := db.Where("stock_balances.company_id = ?", companyID)

	for k, v := range filters {
		if v != "" {
			if k == "expired_only" && v == "true" {
				query = query.Joins("LEFT JOIN product_batches ON product_batches.id = stock_balances.product_batch_id").
					Where("product_batches.expiry_date < NOW()")
			} else if k == "low_stock_only" && v == "true" {
				query = query.Joins("LEFT JOIN products ON products.id = stock_balances.product_id").
					Where("stock_balances.quantity_available <= products.reorder_level")
			} else {
				query = query.Where("stock_balances."+k+" = ?", v)
			}
		}
	}

	var total int64
	query.Model(&models.StockBalance{}).Count(&total)

	var balances []models.StockBalance
	offset := (page - 1) * limit
	err := query.Preload("Product.BaseUnit").Preload("Product").Preload("ProductBatch").Preload("Warehouse").Preload("WarehouseLocation").Offset(offset).Limit(limit).Find(&balances).Error
	return balances, total, err
}

func (r *StockRepository) ListLedgerEntries(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockLedgerEntry, int64, error) {
	query := db.Where("stock_ledger_entries.company_id = ?", companyID)

	for k, v := range filters {
		if v != "" {
			if k == "transaction_date_from" {
				query = query.Where("stock_ledger_entries.transaction_date >= ?", v)
			} else if k == "transaction_date_to" {
				query = query.Where("stock_ledger_entries.transaction_date <= ?", v)
			} else {
				query = query.Where("stock_ledger_entries."+k+" = ?", v)
			}
		}
	}

	var total int64
	query.Model(&models.StockLedgerEntry{}).Count(&total)

	var entries []models.StockLedgerEntry
	offset := (page - 1) * limit
	err := query.Preload("Product.BaseUnit").Preload("Product").Preload("ProductBatch").Preload("Warehouse").Preload("WarehouseLocation").Offset(offset).Limit(limit).Order("stock_ledger_entries.id desc").Find(&entries).Error
	return entries, total, err
}

// Check dependencies for deletion validation
func (r *StockRepository) CheckWarehouseHasStock(db *gorm.DB, warehouseID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockBalance{}).Where("warehouse_id = ? AND quantity_available > 0", warehouseID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckWarehouseHasLedger(db *gorm.DB, warehouseID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).Where("warehouse_id = ?", warehouseID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckLocationHasStock(db *gorm.DB, locationID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockBalance{}).Where("warehouse_location_id = ? AND quantity_available > 0", locationID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckLocationHasLedger(db *gorm.DB, locationID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).Where("warehouse_location_id = ?", locationID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckProductHasStock(db *gorm.DB, productID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockBalance{}).Where("product_id = ? AND quantity_available > 0", productID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckProductHasLedger(db *gorm.DB, productID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).Where("product_id = ?", productID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckBatchHasStock(db *gorm.DB, batchID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockBalance{}).Where("product_batch_id = ? AND quantity_available > 0", batchID).Count(&count).Error
	return count > 0, err
}
func (r *StockRepository) CheckBatchHasLedger(db *gorm.DB, batchID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.StockLedgerEntry{}).Where("product_batch_id = ?", batchID).Count(&count).Error
	return count > 0, err
}
