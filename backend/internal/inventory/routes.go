package inventory

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/handlers"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"github.com/pixandco/erp-phrma/internal/service"
	"go.uber.org/zap"
)

func SetupRoutes(r *gin.RouterGroup, auditService *service.AuditService, logger *zap.Logger) {

	// 1. Initialize Repositories
	warehouseRepo := repositories.NewWarehouseRepository()
	warehouseLocRepo := repositories.NewWarehouseLocationRepository()
	productMasterRepo := repositories.NewProductMasterRepository()
	productRepo := repositories.NewProductRepository()
	productBatchRepo := repositories.NewProductBatchRepository()
	stockRepo := repositories.NewStockRepository()
	stockMovementRepo := repositories.NewStockMovementRepository()
	openingStockRepo := repositories.NewOpeningStockRepository()

	// 2. Initialize Services
	warehouseSvc := services.NewWarehouseService(warehouseRepo, stockRepo, auditService)
	warehouseLocSvc := services.NewWarehouseLocationService(warehouseLocRepo, warehouseRepo, stockRepo, auditService)
	productCategorySvc := services.NewProductCategoryService(productMasterRepo, auditService)
	productUnitSvc := services.NewProductUnitService(productMasterRepo, auditService)
	dosageFormSvc := services.NewDosageFormService(productMasterRepo, auditService)
	genericNameSvc := services.NewGenericNameService(productMasterRepo, auditService)
	manufacturerSvc := services.NewManufacturerService(productMasterRepo, auditService)
	supplierSvc := services.NewSupplierService(productMasterRepo, auditService)
	productSvc := services.NewProductService(productRepo, stockRepo, auditService)
	productBatchSvc := services.NewProductBatchService(productBatchRepo, productRepo, stockRepo, auditService)
	stockBalanceSvc := services.NewStockBalanceService(stockRepo)
	stockLedgerSvc := services.NewStockLedgerService(stockRepo)
	
	invAuditLogger := services.NewAuditLogService(logger)
	stockMovementSvc := services.NewInventoryStockMovementService(stockMovementRepo)
	openingStockSvc := services.NewOpeningStockService(openingStockRepo, stockMovementRepo, stockMovementSvc, invAuditLogger)
	grnRepo := repositories.NewGRNRepository()
	grnSvc := services.NewGRNService(grnRepo, stockMovementRepo, productMasterRepo, stockMovementSvc, invAuditLogger, logger)
	stockTransferRepo := repositories.NewStockTransferRepository()
	stockTransferSvc := services.NewStockTransferService(stockTransferRepo, stockMovementSvc, stockMovementRepo, invAuditLogger)
	stockAdjRepo := repositories.NewStockAdjustmentRepository()
	stockAdjService := services.NewStockAdjustmentService(stockAdjRepo, stockMovementRepo, stockMovementSvc, invAuditLogger)
	purchaseReturnRepo := repositories.NewPurchaseReturnRepository()
	purchaseReturnSvc := services.NewPurchaseReturnService(purchaseReturnRepo, stockMovementSvc)
	salesReturnRepo := repositories.NewSalesReturnRepository()
	salesReturnSvc := services.NewSalesReturnService(salesReturnRepo, stockMovementRepo, stockMovementSvc, invAuditLogger, logger)


	// 3. Initialize Handlers
	warehouseHdl := handlers.NewWarehouseHandler(warehouseSvc, logger)
	warehouseLocHdl := handlers.NewWarehouseLocationHandler(warehouseLocSvc, logger)
	productCategoryHdl := handlers.NewProductCategoryHandler(productCategorySvc, logger)
	productUnitHdl := handlers.NewProductUnitHandler(productUnitSvc, logger)
	dosageFormHdl := handlers.NewDosageFormHandler(dosageFormSvc, logger)
	genericNameHdl := handlers.NewGenericNameHandler(genericNameSvc, logger)
	manufacturerHdl := handlers.NewManufacturerHandler(manufacturerSvc, logger)
	supplierHdl := handlers.NewSupplierHandler(supplierSvc, logger)
	productHdl := handlers.NewProductHandler(productSvc, logger)
	productBatchHdl := handlers.NewProductBatchHandler(productBatchSvc, logger)
	stockBalanceHdl := handlers.NewStockBalanceHandler(stockBalanceSvc, logger)
	stockLedgerHdl := handlers.NewStockLedgerHandler(stockLedgerSvc, logger)
	openingStockHdl := handlers.NewOpeningStockHandler(openingStockSvc)
	grnHdl := handlers.NewGRNHandler(grnSvc)
	stockTransferHdl := handlers.NewStockTransferHandler(stockTransferSvc)
	stockAdjHandler := handlers.NewStockAdjustmentHandler(stockAdjService)
	purchaseReturnHandler := handlers.NewPurchaseReturnHandler(purchaseReturnSvc)
	salesReturnHandler := handlers.NewSalesReturnHandler(salesReturnSvc)
	dashboardHdl := handlers.NewDashboardHandler(logger)


	inventory := r.Group("")

	// Dashboard
	dashboard := inventory.Group("/dashboard")
	{
		dashboard.GET("", middleware.RequirePermission("inventory.dashboard.view"), dashboardHdl.Summary)
	}

	// Warehouses
	warehouses := inventory.Group("/warehouses")
	{
		warehouses.GET("", middleware.RequirePermission("inventory.warehouse.view"), warehouseHdl.List)
		warehouses.GET("/:id", middleware.RequirePermission("inventory.warehouse.view"), warehouseHdl.Get)
		warehouses.POST("", middleware.RequirePermission("inventory.warehouse.create"), warehouseHdl.Create)
		warehouses.PUT("/:id", middleware.RequirePermission("inventory.warehouse.update"), warehouseHdl.Update)
		warehouses.DELETE("/:id", middleware.RequirePermission("inventory.warehouse.delete"), warehouseHdl.Delete)
	}

	// Warehouse Locations
	warehouseLocs := inventory.Group("/warehouse-locations")
	{
		warehouseLocs.GET("", middleware.RequirePermission("inventory.warehouse.view"), warehouseLocHdl.List)
		warehouseLocs.POST("", middleware.RequirePermission("inventory.warehouse.create"), warehouseLocHdl.Create)
		warehouseLocs.PUT("/:id", middleware.RequirePermission("inventory.warehouse.update"), warehouseLocHdl.Update)
		warehouseLocs.DELETE("/:id", middleware.RequirePermission("inventory.warehouse.delete"), warehouseLocHdl.Delete)
	}

	// Product Categories
	productCategories := inventory.Group("/product-categories")
	{
		productCategories.GET("", middleware.RequirePermission("inventory.product_category.view"), productCategoryHdl.List)
		productCategories.GET("/:id", middleware.RequirePermission("inventory.product_category.view"), productCategoryHdl.Get)
		productCategories.POST("", middleware.RequirePermission("inventory.product_category.create"), productCategoryHdl.Create)
		productCategories.PUT("/:id", middleware.RequirePermission("inventory.product_category.update"), productCategoryHdl.Update)
		productCategories.DELETE("/:id", middleware.RequirePermission("inventory.product_category.delete"), productCategoryHdl.Delete)
	}

	// Product Units
	productUnits := inventory.Group("/product-units")
	{
		productUnits.GET("", middleware.RequirePermission("inventory.product_master.view"), productUnitHdl.List)
		productUnits.GET("/:id", middleware.RequirePermission("inventory.product_master.view"), productUnitHdl.Get)
		productUnits.POST("", middleware.RequirePermission("inventory.product_master.create"), productUnitHdl.Create)
		productUnits.PUT("/:id", middleware.RequirePermission("inventory.product_master.update"), productUnitHdl.Update)
		productUnits.DELETE("/:id", middleware.RequirePermission("inventory.product_master.delete"), productUnitHdl.Delete)
	}

	// Dosage Forms
	dosageForms := inventory.Group("/dosage-forms")
	{
		dosageForms.GET("", middleware.RequirePermission("inventory.product_master.view"), dosageFormHdl.List)
		dosageForms.GET("/:id", middleware.RequirePermission("inventory.product_master.view"), dosageFormHdl.Get)
		dosageForms.POST("", middleware.RequirePermission("inventory.product_master.create"), dosageFormHdl.Create)
		dosageForms.PUT("/:id", middleware.RequirePermission("inventory.product_master.update"), dosageFormHdl.Update)
		dosageForms.DELETE("/:id", middleware.RequirePermission("inventory.product_master.delete"), dosageFormHdl.Delete)
	}

	// Generic Names
	genericNames := inventory.Group("/generic-names")
	{
		genericNames.GET("", middleware.RequirePermission("inventory.product_master.view"), genericNameHdl.List)
		genericNames.GET("/:id", middleware.RequirePermission("inventory.product_master.view"), genericNameHdl.Get)
		genericNames.POST("", middleware.RequirePermission("inventory.product_master.create"), genericNameHdl.Create)
		genericNames.PUT("/:id", middleware.RequirePermission("inventory.product_master.update"), genericNameHdl.Update)
		genericNames.DELETE("/:id", middleware.RequirePermission("inventory.product_master.delete"), genericNameHdl.Delete)
	}

	// Manufacturers
	manufacturers := inventory.Group("/manufacturers")
	{
		manufacturers.GET("", middleware.RequirePermission("inventory.product_master.view"), manufacturerHdl.List)
		manufacturers.GET("/:id", middleware.RequirePermission("inventory.product_master.view"), manufacturerHdl.Get)
		manufacturers.POST("", middleware.RequirePermission("inventory.product_master.create"), manufacturerHdl.Create)
		manufacturers.PUT("/:id", middleware.RequirePermission("inventory.product_master.update"), manufacturerHdl.Update)
		manufacturers.DELETE("/:id", middleware.RequirePermission("inventory.product_master.delete"), manufacturerHdl.Delete)
	}

	// Suppliers
	suppliers := inventory.Group("/suppliers")
	{
		suppliers.GET("", middleware.RequirePermission("inventory.product_master.view"), supplierHdl.List)
		suppliers.GET("/:id", middleware.RequirePermission("inventory.product_master.view"), supplierHdl.Get)
		suppliers.POST("", middleware.RequirePermission("inventory.product_master.create"), supplierHdl.Create)
		suppliers.PUT("/:id", middleware.RequirePermission("inventory.product_master.update"), supplierHdl.Update)
		suppliers.DELETE("/:id", middleware.RequirePermission("inventory.product_master.delete"), supplierHdl.Delete)
	}

	// Products
	products := inventory.Group("/products")
	{
		products.GET("", middleware.RequirePermission("inventory.product_master.view"), productHdl.List)
		products.GET("/:id", middleware.RequirePermission("inventory.product_master.view"), productHdl.Get)
		products.POST("", middleware.RequirePermission("inventory.product_master.create"), productHdl.Create)
		products.PUT("/:id", middleware.RequirePermission("inventory.product_master.update"), productHdl.Update)
		products.DELETE("/:id", middleware.RequirePermission("inventory.product_master.delete"), productHdl.Delete)
	}

	// Product Batches
	productBatches := inventory.Group("/product-batches")
	{
		productBatches.GET("", middleware.RequirePermission("inventory.product_batch.view"), productBatchHdl.List)
		productBatches.GET("/:id", middleware.RequirePermission("inventory.product_batch.view"), productBatchHdl.Get)
		productBatches.POST("", middleware.RequirePermission("inventory.product_batch.create"), productBatchHdl.Create)
		productBatches.PUT("/:id", middleware.RequirePermission("inventory.product_batch.update"), productBatchHdl.Update)
		productBatches.POST("/:id/block", middleware.RequirePermission("inventory.product_batch.block"), productBatchHdl.Block)
		productBatches.POST("/:id/unblock", middleware.RequirePermission("inventory.product_batch.unblock"), productBatchHdl.Unblock)
	}

	// Stock Balances
	stockBalances := inventory.Group("/stock-balances")
	{
		stockBalances.GET("", middleware.RequirePermission("inventory.stock_balance.view"), stockBalanceHdl.List)
	}

	// Stock Ledger
	stockLedger := inventory.Group("/stock-ledger")
	{
		stockLedger.GET("", middleware.RequirePermission("inventory.stock_ledger.view"), stockLedgerHdl.List)
	}

	// Opening Stock Entries
	openingStocks := inventory.Group("/opening-stock-entries")
	{
		openingStocks.GET("", middleware.RequirePermission("inventory.opening_stock.view"), openingStockHdl.ListOpeningStockEntries)
		openingStocks.GET("/:id", middleware.RequirePermission("inventory.opening_stock.view"), openingStockHdl.GetOpeningStockEntryByID)
		openingStocks.POST("", middleware.RequirePermission("inventory.opening_stock.create"), openingStockHdl.CreateOpeningStockEntry)
		openingStocks.PUT("/:id", middleware.RequirePermission("inventory.opening_stock.update"), openingStockHdl.UpdateOpeningStockEntry)
		openingStocks.DELETE("/:id", middleware.RequirePermission("inventory.opening_stock.delete"), openingStockHdl.DeleteOpeningStockEntry)
		openingStocks.POST("/:id/submit", middleware.RequirePermission("inventory.opening_stock.submit"), openingStockHdl.SubmitOpeningStockEntry)
		openingStocks.POST("/:id/approve", middleware.RequirePermission("inventory.opening_stock.approve"), openingStockHdl.ApproveOpeningStockEntry)
		openingStocks.POST("/:id/reject", middleware.RequirePermission("inventory.opening_stock.approve"), openingStockHdl.RejectOpeningStockEntry)
		openingStocks.POST("/:id/post", middleware.RequirePermission("inventory.opening_stock.post"), openingStockHdl.PostOpeningStockEntry)
	}

	// GRNs
	grns := inventory.Group("/grns")
	{
		grns.GET("", middleware.RequirePermission("inventory.grn.view"), grnHdl.ListGRNs)
		grns.GET("/:id", middleware.RequirePermission("inventory.grn.view"), grnHdl.GetGRN)
		grns.POST("", middleware.RequirePermission("inventory.grn.create"), grnHdl.CreateGRN)
		grns.PUT("/:id", middleware.RequirePermission("inventory.grn.update"), grnHdl.UpdateGRN)
		grns.DELETE("/:id", middleware.RequirePermission("inventory.grn.delete"), grnHdl.DeleteGRN)
		grns.POST("/:id/submit", middleware.RequirePermission("inventory.grn.submit"), grnHdl.SubmitGRN)
		grns.POST("/:id/approve", middleware.RequirePermission("inventory.grn.approve"), grnHdl.ApproveGRN)
		grns.POST("/:id/reject", middleware.RequirePermission("inventory.grn.reject"), grnHdl.RejectGRN)
		grns.POST("/:id/post", middleware.RequirePermission("inventory.grn.post"), grnHdl.PostGRN)
	}

	// Stock Transfers
	stockTransfers := inventory.Group("/stock-transfers")
	{
		stockTransfers.GET("", middleware.RequirePermission("inventory.stock_transfer.view"), stockTransferHdl.ListStockTransfers)
		stockTransfers.GET("/:id", middleware.RequirePermission("inventory.stock_transfer.view"), stockTransferHdl.GetStockTransfer)
		stockTransfers.POST("", middleware.RequirePermission("inventory.stock_transfer.create"), stockTransferHdl.CreateStockTransfer)
		stockTransfers.PUT("/:id", middleware.RequirePermission("inventory.stock_transfer.update"), stockTransferHdl.UpdateStockTransfer)
		stockTransfers.DELETE("/:id", middleware.RequirePermission("inventory.stock_transfer.delete"), stockTransferHdl.DeleteStockTransfer)
		stockTransfers.POST("/:id/submit", middleware.RequirePermission("inventory.stock_transfer.submit"), stockTransferHdl.SubmitStockTransfer)
		stockTransfers.POST("/:id/approve", middleware.RequirePermission("inventory.stock_transfer.approve"), stockTransferHdl.ApproveStockTransfer)
		stockTransfers.POST("/:id/reject", middleware.RequirePermission("inventory.stock_transfer.reject"), stockTransferHdl.RejectStockTransfer)
		stockTransfers.POST("/:id/post", middleware.RequirePermission("inventory.stock_transfer.post"), stockTransferHdl.PostStockTransfer)
	}

	stockAdjustments := inventory.Group("/stock-adjustments")
	{
		stockAdjustments.GET("", middleware.RequirePermission("inventory.stock_adjustment.view"), stockAdjHandler.ListStockAdjustments)
		stockAdjustments.GET("/:id", middleware.RequirePermission("inventory.stock_adjustment.view"), stockAdjHandler.GetStockAdjustment)
		stockAdjustments.POST("", middleware.RequirePermission("inventory.stock_adjustment.create"), stockAdjHandler.CreateStockAdjustment)
		stockAdjustments.PUT("/:id", middleware.RequirePermission("inventory.stock_adjustment.update"), stockAdjHandler.UpdateStockAdjustment)
		stockAdjustments.DELETE("/:id", middleware.RequirePermission("inventory.stock_adjustment.delete"), stockAdjHandler.DeleteStockAdjustment)

		stockAdjustments.POST("/:id/submit", middleware.RequirePermission("inventory.stock_adjustment.submit"), stockAdjHandler.SubmitStockAdjustment)
		stockAdjustments.POST("/:id/approve", middleware.RequirePermission("inventory.stock_adjustment.approve"), stockAdjHandler.ApproveStockAdjustment)
		stockAdjustments.POST("/:id/reject", middleware.RequirePermission("inventory.stock_adjustment.reject"), stockAdjHandler.RejectStockAdjustment)
		stockAdjustments.POST("/:id/post", middleware.RequirePermission("inventory.stock_adjustment.post"), stockAdjHandler.PostStockAdjustment)
	}

	purchaseReturns := inventory.Group("/purchase-returns")
	{
		purchaseReturns.GET("", middleware.RequirePermission("inventory.purchase_return.view"), purchaseReturnHandler.FetchAll)
		purchaseReturns.GET("/:id", middleware.RequirePermission("inventory.purchase_return.view"), purchaseReturnHandler.FetchByID)
		purchaseReturns.POST("", middleware.RequirePermission("inventory.purchase_return.create"), purchaseReturnHandler.Create)
		purchaseReturns.PUT("/:id", middleware.RequirePermission("inventory.purchase_return.update"), purchaseReturnHandler.Update)
		purchaseReturns.DELETE("/:id", middleware.RequirePermission("inventory.purchase_return.delete"), purchaseReturnHandler.Delete)
		purchaseReturns.POST("/:id/submit", middleware.RequirePermission("inventory.purchase_return.submit"), purchaseReturnHandler.Submit)
		purchaseReturns.POST("/:id/approve", middleware.RequirePermission("inventory.purchase_return.approve"), purchaseReturnHandler.Approve)
		purchaseReturns.POST("/:id/reject", middleware.RequirePermission("inventory.purchase_return.reject"), purchaseReturnHandler.Reject)
		purchaseReturns.POST("/:id/post", middleware.RequirePermission("inventory.purchase_return.post"), purchaseReturnHandler.Post)
	}

	salesReturns := inventory.Group("/sales-returns")
	{
		salesReturns.GET("", middleware.RequirePermission("inventory.sales_return.view"), salesReturnHandler.ListSalesReturns)
		salesReturns.GET("/:id", middleware.RequirePermission("inventory.sales_return.view"), salesReturnHandler.GetSalesReturn)
		salesReturns.POST("", middleware.RequirePermission("inventory.sales_return.create"), salesReturnHandler.CreateSalesReturn)
		salesReturns.PUT("/:id", middleware.RequirePermission("inventory.sales_return.update"), salesReturnHandler.UpdateSalesReturn)
		salesReturns.DELETE("/:id", middleware.RequirePermission("inventory.sales_return.delete"), salesReturnHandler.DeleteSalesReturn)
		salesReturns.POST("/:id/submit", middleware.RequirePermission("inventory.sales_return.submit"), salesReturnHandler.SubmitSalesReturn)
		salesReturns.POST("/:id/approve", middleware.RequirePermission("inventory.sales_return.approve"), salesReturnHandler.ApproveSalesReturn)
		salesReturns.POST("/:id/reject", middleware.RequirePermission("inventory.sales_return.reject"), salesReturnHandler.RejectSalesReturn)
		salesReturns.POST("/:id/post", middleware.RequirePermission("inventory.sales_return.post"), salesReturnHandler.PostSalesReturn)
	}
}
