package migrations

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RunInventoryMigrations runs AutoMigrate for the inventory models
func RunInventoryMigrations(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("Running inventory database AutoMigrate...")

	err := db.AutoMigrate(
		&models.Warehouse{},
		&models.WarehouseLocation{},
		&models.ProductCategory{},
		&models.ProductUnit{},
		&models.DosageForm{},
		&models.GenericName{},
		&models.Manufacturer{},
		&models.Supplier{},
		&models.Product{},
		&models.ProductBarcode{},
		&models.ProductBatch{},
		&models.StockBalance{},
		&models.StockLedgerEntry{},
		&models.OpeningStockEntry{},
		&models.OpeningStockEntryLine{},
		&models.OpeningStockEntryApproval{},
		&models.GoodsReceiptNote{},
		&models.GoodsReceiptNoteLine{},
		&models.GoodsReceiptNoteApproval{},
		&models.StockTransfer{},
		&models.StockTransferLine{},
		&models.StockTransferApproval{},
		&models.StockAdjustment{},
		&models.StockAdjustmentLine{},
		&models.StockAdjustmentApproval{},
	)

	if err != nil {
		logger.Error("Inventory AutoMigrate failed", zap.Error(err))
		return err
	}

	logger.Info("Inventory AutoMigrate completed successfully")
	return nil
}
