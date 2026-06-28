package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	invrepositories "github.com/pixandco/erp-phrma/internal/inventory/repositories"
	invservices "github.com/pixandco/erp-phrma/internal/inventory/services"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/handlers"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
)

func RequireInvoiceCenter() gin.HandlerFunc {
	return func(c *gin.Context) {
		authCtx, exists := c.Get("authContext")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing", "errors": []string{}})
			c.Abort()
			return
		}
		ctx, ok := authCtx.(*middleware.AuthContext)
		if !ok || ctx.ActiveSoftwareCode != "INVOICE_CENTER" {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Please switch to Invoice Center module to access this resource",
				"errors":  []string{},
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

func SetupRoutes(r *gin.RouterGroup, logger *zap.Logger) {
	r.Use(RequireInvoiceCenter())

	// Initialize audit log service
	auditSvc := services.NewAuditLogService(logger)

	// Initialize repositories
	dashboardRepo := repositories.NewInvoiceDashboardRepository()
	categoryRepo := repositories.NewCustomerCategoryRepository()
	addressRepo := repositories.NewCustomerAddressRepository()
	contactRepo := repositories.NewCustomerContactRepository()
	customerRepo := repositories.NewCustomerRepository()
	salesOrderRepo := repositories.NewSalesOrderRepository()
	salesInvoiceRepo := repositories.NewSalesInvoiceRepository()
	creditNoteRepo := repositories.NewCreditNoteRepository()
	debitNoteRepo := repositories.NewDebitNoteRepository()
	stockMovementRepo := invrepositories.NewStockMovementRepository()
	customerReceiptRepo := repositories.NewCustomerReceiptRepository()
	financeSettingRepo := repositories.NewInvoiceCenterFinanceSettingRepository()
	financePostingRepo := repositories.NewInvoiceCenterFinancePostingRepository()
	reportRepo := repositories.NewInvoiceCenterReportRepository()

	// Initialize services
	dashboardSvc := services.NewInvoiceDashboardService(dashboardRepo, logger)
	categorySvc := services.NewCustomerCategoryService(categoryRepo, auditSvc, logger)
	addressSvc := services.NewCustomerAddressService(addressRepo, auditSvc, logger)
	contactSvc := services.NewCustomerContactService(contactRepo, auditSvc, logger)
	customerSvc := services.NewCustomerService(customerRepo, categoryRepo, addressRepo, contactRepo, auditSvc, logger)
	salesOrderSvc := services.NewSalesOrderService(salesOrderRepo, auditSvc, logger)
	stockMovementSvc := invservices.NewInventoryStockMovementService(stockMovementRepo)
	salesInvoiceSvc := services.NewSalesInvoiceService(salesInvoiceRepo, stockMovementSvc, auditSvc, logger)
	creditNoteSvc := services.NewCreditNoteService(creditNoteRepo, auditSvc, logger)
	debitNoteSvc := services.NewDebitNoteService(debitNoteRepo, auditSvc, logger)
	customerReceiptSvc := services.NewCustomerReceiptService(customerReceiptRepo, salesInvoiceRepo, auditSvc)
	financeSettingSvc := services.NewInvoiceCenterFinanceSettingService(financeSettingRepo, auditSvc, logger)
	financePostingSvc := services.NewInvoiceCenterFinancePostingService(
		financePostingRepo,
		financeSettingRepo,
		salesInvoiceRepo,
		creditNoteRepo,
		debitNoteRepo,
		customerReceiptRepo,
		auditSvc,
		logger,
	)
	reportSvc := services.NewInvoiceCenterReportService(reportRepo)

	// Initialize handlers
	dashboardHdl := handlers.NewInvoiceDashboardHandler(dashboardSvc, logger)
	categoryHdl := handlers.NewCustomerCategoryHandler(categorySvc, logger)
	addressHdl := handlers.NewCustomerAddressHandler(addressSvc, logger)
	contactHdl := handlers.NewCustomerContactHandler(contactSvc, logger)
	customerHdl := handlers.NewCustomerHandler(customerSvc, logger)
	salesOrderHdl := handlers.NewSalesOrderHandler(salesOrderSvc, logger)
	salesInvoiceHdl := handlers.NewSalesInvoiceHandler(salesInvoiceSvc, logger)
	creditNoteHdl := handlers.NewCreditNoteHandler(creditNoteSvc, logger)
	debitNoteHdl := handlers.NewDebitNoteHandler(debitNoteSvc, logger)
	customerReceiptHdl := handlers.NewCustomerReceiptHandler(customerReceiptSvc)
	financeSettingHdl := handlers.NewInvoiceCenterFinanceSettingHandler(financeSettingSvc)
	financePostingHdl := handlers.NewInvoiceCenterFinancePostingHandler(financePostingSvc)
	reportHdl := handlers.NewInvoiceCenterReportHandler(reportSvc)

	// Dashboard Routes
	dashboard := r.Group("/dashboard")
	{
		dashboard.GET("", middleware.RequirePermission("invoice_center.dashboard.view"), dashboardHdl.GetSummary)
		dashboard.GET("/summary", middleware.RequirePermission("invoice_center.dashboard.view"), dashboardHdl.GetSummary)
	}

	// Customer Category Routes
	categories := r.Group("/customer-categories")
	{
		categories.GET("", middleware.RequirePermission("invoice_center.customer_category.view"), categoryHdl.List)
		categories.GET("/:id", middleware.RequirePermission("invoice_center.customer_category.view"), categoryHdl.Get)
		categories.POST("", middleware.RequirePermission("invoice_center.customer_category.create"), categoryHdl.Create)
		categories.PUT("/:id", middleware.RequirePermission("invoice_center.customer_category.update"), categoryHdl.Update)
		categories.DELETE("/:id", middleware.RequirePermission("invoice_center.customer_category.delete"), categoryHdl.Delete)
	}

	// Customer Routes
	customers := r.Group("/customers")
	{
		customers.GET("", middleware.RequirePermission("invoice_center.customer.view"), customerHdl.List)
		customers.GET("/:customer_id", middleware.RequirePermission("invoice_center.customer.view"), customerHdl.Get)
		customers.POST("", middleware.RequirePermission("invoice_center.customer.create"), customerHdl.Create)
		customers.PUT("/:customer_id", middleware.RequirePermission("invoice_center.customer.update"), customerHdl.Update)
		customers.PATCH("/:customer_id/status", middleware.RequirePermission("invoice_center.customer.update"), customerHdl.ChangeStatus)
		customers.DELETE("/:customer_id", middleware.RequirePermission("invoice_center.customer.delete"), customerHdl.Delete)

		// Customer Addresses
		customers.GET("/:customer_id/addresses", middleware.RequirePermission("invoice_center.customer.view"), addressHdl.List)
		customers.POST("/:customer_id/addresses", middleware.RequirePermission("invoice_center.customer.update"), addressHdl.Create)
		customers.PUT("/:customer_id/addresses/:id", middleware.RequirePermission("invoice_center.customer.update"), addressHdl.Update)
		customers.DELETE("/:customer_id/addresses/:id", middleware.RequirePermission("invoice_center.customer.update"), addressHdl.Delete)

		// Customer Contacts
		customers.GET("/:customer_id/contacts", middleware.RequirePermission("invoice_center.customer.view"), contactHdl.List)
		customers.POST("/:customer_id/contacts", middleware.RequirePermission("invoice_center.customer.update"), contactHdl.Create)
		customers.PUT("/:customer_id/contacts/:id", middleware.RequirePermission("invoice_center.customer.update"), contactHdl.Update)
		customers.DELETE("/:customer_id/contacts/:id", middleware.RequirePermission("invoice_center.customer.update"), contactHdl.Delete)
	}

	// Sales Order Routes
	salesOrders := r.Group("/sales-orders")
	{
		salesOrders.GET("", middleware.RequirePermission("invoice_center.sales_order.view"), salesOrderHdl.List)
		salesOrders.GET("/:id", middleware.RequirePermission("invoice_center.sales_order.view"), salesOrderHdl.Get)
		salesOrders.POST("", middleware.RequirePermission("invoice_center.sales_order.create"), salesOrderHdl.Create)
		salesOrders.PUT("/:id", middleware.RequirePermission("invoice_center.sales_order.update"), salesOrderHdl.Update)
		salesOrders.DELETE("/:id", middleware.RequirePermission("invoice_center.sales_order.delete"), salesOrderHdl.Delete)
		salesOrders.POST("/:id/submit", middleware.RequirePermission("invoice_center.sales_order.submit"), salesOrderHdl.Submit)
		salesOrders.POST("/:id/approve", middleware.RequirePermission("invoice_center.sales_order.approve"), salesOrderHdl.Approve)
		salesOrders.POST("/:id/reject", middleware.RequirePermission("invoice_center.sales_order.reject"), salesOrderHdl.Reject)
		salesOrders.POST("/:id/close", middleware.RequirePermission("invoice_center.sales_order.close"), salesOrderHdl.Close)
		salesOrders.POST("/:id/cancel", middleware.RequirePermission("invoice_center.sales_order.cancel"), salesOrderHdl.Cancel)
	}

	// Sales Invoice Routes
	salesInvoices := r.Group("/sales-invoices")
	{
		salesInvoices.GET("", middleware.RequirePermission("invoice_center.sales_invoice.view"), salesInvoiceHdl.List)
		salesInvoices.GET("/:id", middleware.RequirePermission("invoice_center.sales_invoice.view"), salesInvoiceHdl.Get)
		salesInvoices.POST("", middleware.RequirePermission("invoice_center.sales_invoice.create"), salesInvoiceHdl.Create)
		salesInvoices.PUT("/:id", middleware.RequirePermission("invoice_center.sales_invoice.update"), salesInvoiceHdl.Update)
		salesInvoices.DELETE("/:id", middleware.RequirePermission("invoice_center.sales_invoice.delete"), salesInvoiceHdl.Delete)
		salesInvoices.POST("/:id/submit", middleware.RequirePermission("invoice_center.sales_invoice.submit"), salesInvoiceHdl.Submit)
		salesInvoices.POST("/:id/approve", middleware.RequirePermission("invoice_center.sales_invoice.approve"), salesInvoiceHdl.Approve)
		salesInvoices.POST("/:id/reject", middleware.RequirePermission("invoice_center.sales_invoice.reject"), salesInvoiceHdl.Reject)
		salesInvoices.POST("/:id/post", middleware.RequirePermission("invoice_center.sales_invoice.post"), salesInvoiceHdl.Post)
		salesInvoices.POST("/:id/cancel", middleware.RequirePermission("invoice_center.sales_invoice.update"), salesInvoiceHdl.Cancel)
	}

	// Credit Note Routes
	creditNotes := r.Group("/credit-notes")
	{
		creditNotes.GET("", middleware.RequirePermission("invoice_center.credit_note.view"), creditNoteHdl.List)
		creditNotes.GET("/:id", middleware.RequirePermission("invoice_center.credit_note.view"), creditNoteHdl.Get)
		creditNotes.POST("", middleware.RequirePermission("invoice_center.credit_note.create"), creditNoteHdl.Create)
		creditNotes.PUT("/:id", middleware.RequirePermission("invoice_center.credit_note.update"), creditNoteHdl.Update)
		creditNotes.DELETE("/:id", middleware.RequirePermission("invoice_center.credit_note.delete"), creditNoteHdl.Delete)
		creditNotes.POST("/:id/submit", middleware.RequirePermission("invoice_center.credit_note.submit"), creditNoteHdl.Submit)
		creditNotes.POST("/:id/approve", middleware.RequirePermission("invoice_center.credit_note.approve"), creditNoteHdl.Approve)
		creditNotes.POST("/:id/reject", middleware.RequirePermission("invoice_center.credit_note.reject"), creditNoteHdl.Reject)
		creditNotes.POST("/:id/post", middleware.RequirePermission("invoice_center.credit_note.post"), creditNoteHdl.Post)
		creditNotes.POST("/:id/cancel", middleware.RequirePermission("invoice_center.credit_note.update"), creditNoteHdl.Cancel)
	}

	// Debit Note Routes
	debitNotes := r.Group("/debit-notes")
	{
		debitNotes.GET("", middleware.RequirePermission("invoice_center.debit_note.view"), debitNoteHdl.List)
		debitNotes.GET("/:id", middleware.RequirePermission("invoice_center.debit_note.view"), debitNoteHdl.Get)
		debitNotes.POST("", middleware.RequirePermission("invoice_center.debit_note.create"), debitNoteHdl.Create)
		debitNotes.PUT("/:id", middleware.RequirePermission("invoice_center.debit_note.update"), debitNoteHdl.Update)
		debitNotes.DELETE("/:id", middleware.RequirePermission("invoice_center.debit_note.delete"), debitNoteHdl.Delete)
		debitNotes.POST("/:id/submit", middleware.RequirePermission("invoice_center.debit_note.submit"), debitNoteHdl.Submit)
		debitNotes.POST("/:id/approve", middleware.RequirePermission("invoice_center.debit_note.approve"), debitNoteHdl.Approve)
		debitNotes.POST("/:id/reject", middleware.RequirePermission("invoice_center.debit_note.reject"), debitNoteHdl.Reject)
		debitNotes.POST("/:id/post", middleware.RequirePermission("invoice_center.debit_note.post"), debitNoteHdl.Post)
		debitNotes.POST("/:id/cancel", middleware.RequirePermission("invoice_center.debit_note.update"), debitNoteHdl.Cancel)
	}

	// Customer Receipt Routes
	customerReceipts := r.Group("/customer-receipts")
	{
		customerReceipts.GET("", middleware.RequirePermission("invoice_center.customer_receipt.view"), customerReceiptHdl.ListCustomerReceipts)
		customerReceipts.GET("/:id", middleware.RequirePermission("invoice_center.customer_receipt.view"), customerReceiptHdl.GetCustomerReceiptByID)
		customerReceipts.POST("", middleware.RequirePermission("invoice_center.customer_receipt.create"), customerReceiptHdl.CreateCustomerReceipt)
		customerReceipts.PUT("/:id", middleware.RequirePermission("invoice_center.customer_receipt.update"), customerReceiptHdl.UpdateCustomerReceipt)
		customerReceipts.DELETE("/:id", middleware.RequirePermission("invoice_center.customer_receipt.delete"), customerReceiptHdl.DeleteCustomerReceipt)
		customerReceipts.POST("/:id/submit", middleware.RequirePermission("invoice_center.customer_receipt.submit"), customerReceiptHdl.SubmitCustomerReceipt)
		customerReceipts.POST("/:id/approve", middleware.RequirePermission("invoice_center.customer_receipt.approve"), customerReceiptHdl.ApproveCustomerReceipt)
		customerReceipts.POST("/:id/reject", middleware.RequirePermission("invoice_center.customer_receipt.reject"), customerReceiptHdl.RejectCustomerReceipt)
		customerReceipts.POST("/:id/post", middleware.RequirePermission("invoice_center.customer_receipt.post"), customerReceiptHdl.PostCustomerReceipt)
		customerReceipts.POST("/:id/cancel", middleware.RequirePermission("invoice_center.customer_receipt.update"), customerReceiptHdl.CancelCustomerReceipt)
	}

	// Finance Settings Routes
	financeSettings := r.Group("/finance-settings")
	{
		financeSettings.GET("", middleware.RequirePermission("invoice_center.finance_settings.view"), financeSettingHdl.GetFinanceSettings)
		financeSettings.POST("", middleware.RequirePermission("invoice_center.finance_settings.update"), financeSettingHdl.SaveFinanceSettings)
	}

	// Finance Posting Routes
	financePosting := r.Group("/finance-posting")
	{
		financePosting.GET("/pending", middleware.RequirePermission("invoice_center.finance_posting.view"), financePostingHdl.GetPendingFinancePostings)
		financePosting.GET("/history", middleware.RequirePermission("invoice_center.finance_posting.view"), financePostingHdl.GetFinancePostingHistory)
		
		financePosting.POST("/sales-invoice/:id/post", middleware.RequirePermission("invoice_center.finance_posting.post"), financePostingHdl.PostSalesInvoiceToFinance)
		financePosting.POST("/credit-note/:id/post", middleware.RequirePermission("invoice_center.finance_posting.post"), financePostingHdl.PostCreditNoteToFinance)
		financePosting.POST("/debit-note/:id/post", middleware.RequirePermission("invoice_center.finance_posting.post"), financePostingHdl.PostDebitNoteToFinance)
		financePosting.POST("/customer-receipt/:id/post", middleware.RequirePermission("invoice_center.finance_posting.post"), financePostingHdl.PostCustomerReceiptToFinance)
	}

	// Reports Routes
	reports := r.Group("/reports")
	{
		reports.GET("/customer-balance", middleware.RequirePermission("invoice_center.report.customer_balance"), reportHdl.GetCustomerBalances)
		reports.GET("/customer-statement", middleware.RequirePermission("invoice_center.report.customer_statement"), reportHdl.GetCustomerStatement)
		reports.GET("/customer-aging", middleware.RequirePermission("invoice_center.report.customer_aging"), reportHdl.GetCustomerAging)
		reports.GET("/sales-order-register", middleware.RequirePermission("invoice_center.report.sales_order_register"), reportHdl.GetSalesOrderRegister)
		reports.GET("/sales-invoice-register", middleware.RequirePermission("invoice_center.report.sales_invoice_register"), reportHdl.GetSalesInvoiceRegister)
		reports.GET("/credit-note-register", middleware.RequirePermission("invoice_center.report.credit_note_register"), reportHdl.GetCreditNoteRegister)
		reports.GET("/debit-note-register", middleware.RequirePermission("invoice_center.report.debit_note_register"), reportHdl.GetDebitNoteRegister)
		reports.GET("/customer-receipt-register", middleware.RequirePermission("invoice_center.report.customer_receipt_register"), reportHdl.GetCustomerReceiptRegister)
		reports.GET("/outstanding-invoices", middleware.RequirePermission("invoice_center.report.outstanding_invoices"), reportHdl.GetOutstandingInvoices)
		reports.GET("/sales-by-customer", middleware.RequirePermission("invoice_center.report.sales_by_customer"), reportHdl.GetSalesByCustomer)
		reports.GET("/sales-by-product", middleware.RequirePermission("invoice_center.report.sales_by_product"), reportHdl.GetSalesByProduct)
		reports.GET("/collection-summary", middleware.RequirePermission("invoice_center.report.collection_summary"), reportHdl.GetCollectionSummary)
		reports.GET("/finance-posting-status", middleware.RequirePermission("invoice_center.report.finance_posting_status"), reportHdl.GetFinancePostingStatus)
	}
}
