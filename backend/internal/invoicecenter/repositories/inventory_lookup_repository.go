package repositories

import (
	"time"

	invmodels "github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type InventoryLookupRepository struct{}

func NewInventoryLookupRepository() *InventoryLookupRepository {
	return &InventoryLookupRepository{}
}

func (r *InventoryLookupRepository) FindProducts(db *gorm.DB, companyID uint64, search string, limit int) ([]invmodels.Product, error) {
	var products []invmodels.Product
	query := db.Where("company_id = ? AND status = ?", companyID, "active")
	if search != "" {
		term := "%" + search + "%"
		query = query.Where("(product_code LIKE ? OR product_name LIKE ?)", term, term)
	}
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	err := query.Order("product_name asc").Limit(limit).Find(&products).Error
	return products, err
}

func (r *InventoryLookupRepository) FindProductBatches(db *gorm.DB, companyID uint64, productID *uint64, allowExpired bool) ([]invmodels.ProductBatch, error) {
	var batches []invmodels.ProductBatch
	query := db.Where("company_id = ? AND is_blocked = ? AND batch_status NOT IN ?", companyID, false, []string{"blocked", "recalled", "disposed", "inactive"})
	if productID != nil {
		query = query.Where("product_id = ?", *productID)
	}
	if !allowExpired {
		now := time.Now()
		query = query.Where("batch_status != ?", "expired").
			Where("(expiry_date IS NULL OR expiry_date >= ?)", now)
	}
	err := query.Order("expiry_date asc, batch_number asc").Find(&batches).Error
	return batches, err
}

func (r *InventoryLookupRepository) FindStockAvailability(db *gorm.DB, companyID, branchID uint64, productID, warehouseID, locationID, batchID *uint64, allowExpired bool) ([]invmodels.StockBalance, error) {
	var balances []invmodels.StockBalance
	query := db.Model(&invmodels.StockBalance{}).
		Where("stock_balances.company_id = ? AND stock_balances.branch_id = ? AND stock_balances.quantity_available > 0", companyID, branchID).
		Joins("JOIN products ON products.id = stock_balances.product_id AND products.company_id = stock_balances.company_id AND products.status = ?", "active")

	if productID != nil {
		query = query.Where("stock_balances.product_id = ?", *productID)
	}
	if warehouseID != nil {
		query = query.Where("stock_balances.warehouse_id = ?", *warehouseID)
	}
	if locationID != nil {
		query = query.Where("stock_balances.warehouse_location_id = ?", *locationID)
	}
	if batchID != nil {
		query = query.Where("stock_balances.product_batch_id = ?", *batchID)
	}

	query = query.Joins("LEFT JOIN product_batches ON product_batches.id = stock_balances.product_batch_id")
	query = query.Where("(stock_balances.product_batch_id IS NULL OR (product_batches.is_blocked = ? AND product_batches.batch_status NOT IN ?))", false, []string{"blocked", "recalled", "disposed", "inactive"})
	if !allowExpired {
		now := time.Now()
		query = query.Where("(stock_balances.product_batch_id IS NULL OR (product_batches.batch_status != ? AND (product_batches.expiry_date IS NULL OR product_batches.expiry_date >= ?)))", "expired", now)
	}

	err := query.Order("stock_balances.product_id asc, product_batches.expiry_date asc").Find(&balances).Error
	return balances, err
}

func (r *InventoryLookupRepository) FindWarehouses(db *gorm.DB, companyID, branchID uint64) ([]invmodels.Warehouse, error) {
	var warehouses []invmodels.Warehouse
	err := db.Where("company_id = ? AND branch_id = ? AND status = ?", companyID, branchID, "active").
		Order("is_default desc, warehouse_name asc").
		Find(&warehouses).Error
	return warehouses, err
}

func (r *InventoryLookupRepository) FindWarehouseLocations(db *gorm.DB, companyID uint64, warehouseID *uint64) ([]invmodels.WarehouseLocation, error) {
	var locations []invmodels.WarehouseLocation
	query := db.Where("company_id = ? AND status = ?", companyID, "active")
	if warehouseID != nil {
		query = query.Where("warehouse_id = ?", *warehouseID)
	}
	err := query.Order("location_name asc, location_code asc").Find(&locations).Error
	return locations, err
}

func (r *InventoryLookupRepository) BatchMap(db *gorm.DB, companyID uint64, ids []uint64) (map[uint64]invmodels.ProductBatch, error) {
	result := map[uint64]invmodels.ProductBatch{}
	if len(ids) == 0 {
		return result, nil
	}
	var batches []invmodels.ProductBatch
	if err := db.Where("company_id = ? AND id IN ?", companyID, ids).Find(&batches).Error; err != nil {
		return nil, err
	}
	for _, batch := range batches {
		result[batch.ID] = batch
	}
	return result, nil
}
