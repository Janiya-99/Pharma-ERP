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
	stockMovementRepo := invrepositories.NewStockMovementRepository()

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

	// Initialize handlers
	dashboardHdl := handlers.NewInvoiceDashboardHandler(dashboardSvc, logger)
	categoryHdl := handlers.NewCustomerCategoryHandler(categorySvc, logger)
	addressHdl := handlers.NewCustomerAddressHandler(addressSvc, logger)
	contactHdl := handlers.NewCustomerContactHandler(contactSvc, logger)
	customerHdl := handlers.NewCustomerHandler(customerSvc, logger)
	salesOrderHdl := handlers.NewSalesOrderHandler(salesOrderSvc, logger)
	salesInvoiceHdl := handlers.NewSalesInvoiceHandler(salesInvoiceSvc, logger)
	creditNoteHdl := handlers.NewCreditNoteHandler(creditNoteSvc, logger)

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
}
