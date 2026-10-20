package router

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/auth/handlers"
	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/control"
	"github.com/pixandco/erp-phrma/internal/controller"
	"github.com/pixandco/erp-phrma/internal/database"
	complianceModule "github.com/pixandco/erp-phrma/internal/compliance"
	financeModule "github.com/pixandco/erp-phrma/internal/finance"
	inventoryModule "github.com/pixandco/erp-phrma/internal/inventory"
	invoiceCenterRoutes "github.com/pixandco/erp-phrma/internal/invoicecenter/routes"
	"github.com/pixandco/erp-phrma/internal/middleware"
	platformAdmin "github.com/pixandco/erp-phrma/internal/platform/admin"
	platformModels "github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/service"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Setup configures the Gin engine with middlewares and routes.
func Setup(
	newAuthHandler *handlers.AuthHandler,
	resolver *database.CompanyResolver,
	authCtrl *controller.AuthController,
	userCtrl *controller.UserController,
	roleCtrl *controller.RoleController,
	coaCtrl *controller.CoAController,
	journalCtrl *controller.JournalController,
	desCtrl *controller.DesignationController,
	compCtrl *controller.CompanyController,
	branchCtrl *controller.BranchController,
	whCtrl *controller.WarehouseController,
	prodCtrl *controller.ProductController,
	suppCtrl *controller.SupplierController,
	grnCtrl *controller.GRNController,
	authService *service.AuthService,
	cacheService *service.CacheService,
	cfg *config.Config,
	platformDB *gorm.DB,
	logger *zap.Logger,
) *gin.Engine {
	r := gin.Default()

	// Configure CORS for frontend
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if origin == "" {
				return true
			}
			// Allow localhost, local loopback, VPS IP, and pixandco domains
			if strings.HasPrefix(origin, "http://localhost") ||
				strings.HasPrefix(origin, "http://127.0.0.1") ||
				strings.HasPrefix(origin, "http://50.6.230.198") ||
				strings.HasPrefix(origin, "https://50.6.230.198") ||
				strings.Contains(origin, "pixandco.lk") {
				return true
			}
			for _, o := range cfg.CORS.AllowedOrigins {
				if o == "*" || o == origin || strings.TrimSpace(o) == origin {
					return true
				}
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Cache-Control", "Pragma"},
		ExposeHeaders:    []string{"Content-Length", "X-Cache"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API Version 1 group
	v1 := r.Group("/api/v1")
	{
		// Platform Admin routes
		platformAdminGrp := v1.Group("/platform-admin")
		platformAdmin.SetupRoutes(platformAdminGrp, platformDB, logger)

		// Health check — returns service and Redis cache status
		v1.GET("/health", func(c *gin.Context) {
			cacheStatus := "ok"
			if cacheService != nil {
				if err := cacheService.Ping(c.Request.Context()); err != nil {
					cacheStatus = "unavailable"
				}
			}
			c.JSON(200, gin.H{
				"status":  "ok",
				"service": cfg.App.Name + " Backend",
				"cache":   cacheStatus,
			})
		})

		commonCtrl := controller.NewCommonController()
		// Cache country lookups in Redis for 24 hours
		v1.GET("/countries", middleware.CacheResponse(cacheService, 24*time.Hour), commonCtrl.GetCountries)
		v1.GET("/common/countries", middleware.CacheResponse(cacheService, 24*time.Hour), commonCtrl.GetCountries)
		platformAdminGrp.GET("/countries", middleware.CacheResponse(cacheService, 24*time.Hour), commonCtrl.GetCountries)

		// Public Auth routes
		auth := v1.Group("/auth")
		{
			// New Step 7 login
			auth.POST("/login", newAuthHandler.Login)
			auth.POST("/refresh", authCtrl.Refresh) // Legacy fallback

			// New Step 7 auth me & context
			authMe := auth.Group("")
			authMe.Use(middleware.CompanyAuthMiddleware(resolver))
			authMe.Use(middleware.BranchAccessMiddleware())
			authMe.Use(middleware.SoftwareAccessMiddleware())

			authMe.GET("/me", newAuthHandler.AuthMe)
			authMe.GET("/context", newAuthHandler.AuthContext)
			authMe.POST("/switch-branch", newAuthHandler.SwitchBranch)
			authMe.POST("/switch-software", newAuthHandler.SwitchSoftware)
		}

		// Control Center routes
		controlGrp := v1.Group("/control")
		controlGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		controlGrp.Use(middleware.BranchAccessMiddleware())
		controlGrp.Use(middleware.SoftwareAccessMiddleware())
		control.SetupRoutes(controlGrp, logger)
		controlGrp.GET("/countries", commonCtrl.GetCountries)

		// Admin & Access Management routes
		admin := v1.Group("/admin")
		admin.Use(middleware.CompanyAuthMiddleware(resolver))
		admin.Use(middleware.BranchAccessMiddleware())
		admin.Use(middleware.SoftwareAccessMiddleware())
		{
			// Users
			users := admin.Group("/users")
			{
				users.GET("", userCtrl.List)
				users.POST("", userCtrl.Create)
				users.GET("/:id", userCtrl.Get)
				users.PUT("/:id", userCtrl.Update)
				users.DELETE("/:id", userCtrl.Delete)
			}

			// Roles
			roles := admin.Group("/roles")
			{
				roles.GET("", roleCtrl.List)
				roles.POST("", roleCtrl.Create)
				roles.GET("/:id", roleCtrl.Get)
				roles.PUT("/:id", roleCtrl.Update)
				roles.DELETE("/:id", roleCtrl.Delete)
				roles.GET("/permissions", roleCtrl.ListPermissions)
			}

			// Designations
			designations := admin.Group("/designations")
			{
				designations.GET("", desCtrl.List)
				designations.POST("", desCtrl.Create)
				designations.GET("/:id", desCtrl.Get)
				designations.PUT("/:id", desCtrl.Update)
				designations.DELETE("/:id", desCtrl.Delete)
			}

			// Companies
			companies := admin.Group("/companies")
			{
				companies.GET("", compCtrl.List)
				companies.POST("", compCtrl.Create)
				companies.GET("/:id", compCtrl.Get)
				companies.PUT("/:id", compCtrl.Update)
				companies.DELETE("/:id", compCtrl.Delete)
			}

			// Branches
			branches := admin.Group("/branches")
			{
				branches.GET("", branchCtrl.List)
				branches.POST("", branchCtrl.Create)
				branches.GET("/:id", branchCtrl.Get)
				branches.PUT("/:id", branchCtrl.Update)
				branches.DELETE("/:id", branchCtrl.Delete)
			}
		}

		// Finance routes (new module)
		financeGrp := v1.Group("/finance")
		financeGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		financeGrp.Use(middleware.BranchAccessMiddleware())
		financeGrp.Use(middleware.SoftwareAccessMiddleware())
		financeModule.SetupRoutes(financeGrp, logger)
		financeGrp.GET("/countries", commonCtrl.GetCountries)

		// Inventory routes
		inventoryGrp := v1.Group("/inventory")
		inventoryGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		inventoryGrp.Use(middleware.BranchAccessMiddleware())
		inventoryGrp.Use(middleware.SoftwareAccessMiddleware())

		// Initialize the audit log service to pass down to inventory routes
		inventoryModule.SetupRoutes(inventoryGrp, service.NewAuditService(nil, logger), logger)
		inventoryGrp.GET("/countries", commonCtrl.GetCountries)

		// Invoice Center routes
		invoiceCenterGrp := v1.Group("/invoice-center")
		invoiceCenterGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		invoiceCenterGrp.Use(middleware.BranchAccessMiddleware())
		invoiceCenterGrp.Use(middleware.SoftwareAccessMiddleware())
		invoiceCenterRoutes.SetupRoutes(invoiceCenterGrp, logger)
		invoiceCenterGrp.GET("/countries", commonCtrl.GetCountries)

		// Compliance Center routes
		complianceGrp := v1.Group("/compliance")
		complianceGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		complianceGrp.Use(middleware.BranchAccessMiddleware())
		complianceGrp.Use(middleware.SoftwareAccessMiddleware())
		complianceModule.SetupRoutes(complianceGrp, logger)
		complianceGrp.GET("/countries", commonCtrl.GetCountries)

		// Support Ticket & Helpdesk routes (accessible by authenticated tenant users)
		parseCtxID := func(val interface{}) uint {
			if val == nil {
				return 0
			}
			switch v := val.(type) {
			case uint:
				return v
			case uint64:
				return uint(v)
			case int:
				return uint(v)
			case int64:
				return uint(v)
			default:
				return 0
			}
		}

		supportGrp := v1.Group("/support")
		supportGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		{
			// List support tickets for the current company
			supportGrp.GET("/tickets", func(c *gin.Context) {
				companyIDVal, _ := c.Get("company_id")
				companyID := parseCtxID(companyIDVal)

				var list []platformAdmin.SupportTicketDetail
				q := platformDB.Table("support_tickets").
					Select("support_tickets.*, tenant_companies.company_name, tenant_companies.company_code").
					Joins("LEFT JOIN tenant_companies ON support_tickets.tenant_company_id = tenant_companies.id")
				
				if companyID > 0 {
					q = q.Where("support_tickets.tenant_company_id = ? OR support_tickets.tenant_company_id = 0", companyID)
				}
				q.Order("support_tickets.id DESC").Scan(&list)
				c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
			})

			// Unread replies and notifications
			supportGrp.GET("/notifications", func(c *gin.Context) {
				companyIDVal, _ := c.Get("company_id")
				companyID := parseCtxID(companyIDVal)

				type NotificationItem struct {
					TicketID     uint      `json:"ticket_id"`
					TicketNumber string    `json:"ticket_number"`
					Subject      string    `json:"subject"`
					SenderType   string    `json:"sender_type"`
					MessageText  string    `json:"message_text"`
					CreatedAt    time.Time `json:"created_at"`
				}

				var notifications []NotificationItem
				platformDB.Table("support_ticket_messages").
					Select("support_ticket_messages.support_ticket_id as ticket_id, support_tickets.ticket_number, support_tickets.subject, support_ticket_messages.sender_type, support_ticket_messages.message_text, support_ticket_messages.created_at").
					Joins("JOIN support_tickets ON support_tickets.id = support_ticket_messages.support_ticket_id").
					Where("(support_tickets.tenant_company_id = ? OR support_tickets.tenant_company_id = 0) AND support_ticket_messages.sender_type = 'platform_admin'", companyID).
					Order("support_ticket_messages.id DESC").
					Limit(10).
					Scan(&notifications)

				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"unread_count": len(notifications),
					"notifications": notifications,
				})
			})

			// Create ticket from tenant client
			supportGrp.POST("/tickets", func(c *gin.Context) {
				companyIDVal, _ := c.Get("company_id")
				companyID := parseCtxID(companyIDVal)
				userIDVal, _ := c.Get("user_id")
				userID := parseCtxID(userIDVal)

				var req struct {
					Subject        string `json:"subject"`
					Description    string `json:"description"`
					Priority       string `json:"priority"`
					AttachmentURL  string `json:"attachment_url"`
					AttachmentName string `json:"attachment_name"`
					AttachmentType string `json:"attachment_type"`
					AttachmentSize int64  `json:"attachment_size"`
				}
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
					return
				}
				if req.Priority == "" {
					req.Priority = "medium"
				}

				ticket := platformModels.SupportTicket{
					TenantCompanyID: companyID,
					TicketNumber:    "TKT-" + strconv.FormatInt(time.Now().Unix(), 10),
					Subject:         req.Subject,
					Description:     req.Description,
					Priority:        req.Priority,
					Status:          "open",
					AttachmentURL:   req.AttachmentURL,
					AttachmentName:  req.AttachmentName,
					AttachmentType:  req.AttachmentType,
					AttachmentSize:  req.AttachmentSize,
					CreatedAt:       time.Now(),
					UpdatedAt:       time.Now(),
				}
				if err := platformDB.Create(&ticket).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
					return
				}

				if req.Description != "" || req.AttachmentURL != "" {
					platformDB.Create(&platformModels.SupportTicketMessage{
						SupportTicketID: ticket.ID,
						SenderType:      "client",
						SenderID:        userID,
						MessageText:     req.Description,
						AttachmentURL:   req.AttachmentURL,
						AttachmentName:  req.AttachmentName,
						AttachmentType:  req.AttachmentType,
						AttachmentSize:  req.AttachmentSize,
						CreatedAt:       time.Now(),
						UpdatedAt:       time.Now(),
					})
				}

				c.JSON(http.StatusCreated, gin.H{"success": true, "data": ticket})
			})

			// Get messages for a ticket (verifying company ownership)
			supportGrp.GET("/tickets/:id/messages", func(c *gin.Context) {
				companyIDVal, _ := c.Get("company_id")
				companyID := parseCtxID(companyIDVal)
				ticketID, err := strconv.Atoi(c.Param("id"))
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
					return
				}

				var ticket platformModels.SupportTicket
				q := platformDB.Where("id = ?", ticketID)
				if companyID > 0 {
					q = q.Where("tenant_company_id = ? OR tenant_company_id = 0", companyID)
				}
				if err := q.First(&ticket).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"message": "Ticket not found"})
					return
				}

				var list []platformModels.SupportTicketMessage
				platformDB.Where("support_ticket_id = ?", ticketID).Order("id ASC").Find(&list)
				c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
			})

			// Client send message reply to ticket
			supportGrp.POST("/tickets/:id/messages", func(c *gin.Context) {
				companyIDVal, _ := c.Get("company_id")
				companyID := parseCtxID(companyIDVal)
				userIDVal, _ := c.Get("user_id")
				userID := parseCtxID(userIDVal)

				ticketID, err := strconv.Atoi(c.Param("id"))
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
					return
				}

				var ticket platformModels.SupportTicket
				q := platformDB.Where("id = ?", ticketID)
				if companyID > 0 {
					q = q.Where("tenant_company_id = ? OR tenant_company_id = 0", companyID)
				}
				if err := q.First(&ticket).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"message": "Ticket not found"})
					return
				}

				var req struct {
					MessageText    string `json:"message_text"`
					AttachmentURL  string `json:"attachment_url"`
					AttachmentName string `json:"attachment_name"`
					AttachmentType string `json:"attachment_type"`
					AttachmentSize int64  `json:"attachment_size"`
					SenderType     string `json:"sender_type"`
				}
				if err := c.ShouldBindJSON(&req); err != nil || (req.MessageText == "" && req.AttachmentURL == "") {
					c.JSON(http.StatusBadRequest, gin.H{"message": "Message text or attachment is required"})
					return
				}

				senderType := "client"
				if req.SenderType == "platform_admin" || req.SenderType == "support" {
					senderType = "platform_admin"
				}

				msg := platformModels.SupportTicketMessage{
					SupportTicketID: uint(ticketID),
					SenderType:      senderType,
					SenderID:        userID,
					MessageText:     req.MessageText,
					AttachmentURL:   req.AttachmentURL,
					AttachmentName:  req.AttachmentName,
					AttachmentType:  req.AttachmentType,
					AttachmentSize:  req.AttachmentSize,
					CreatedAt:       time.Now(),
					UpdatedAt:       time.Now(),
				}
				if err := platformDB.Create(&msg).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
					return
				}

				// Touch ticket updated_at and move to open if was resolved
				platformDB.Model(&platformModels.SupportTicket{}).Where("id = ?", ticketID).Updates(map[string]interface{}{
					"updated_at": time.Now(),
				})

				c.JSON(http.StatusCreated, gin.H{"success": true, "data": msg})
			})

			// Client update ticket status (e.g. resolve/close or reopen)
			supportGrp.PUT("/tickets/:id/status", func(c *gin.Context) {
				companyIDVal, _ := c.Get("company_id")
				companyID := parseCtxID(companyIDVal)
				ticketID, err := strconv.Atoi(c.Param("id"))
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
					return
				}

				var req struct {
					Status string `json:"status"`
				}
				if err := c.ShouldBindJSON(&req); err != nil || req.Status == "" {
					c.JSON(http.StatusBadRequest, gin.H{"message": "Status is required"})
					return
				}

				q := platformDB.Model(&platformModels.SupportTicket{}).Where("id = ?", ticketID)
				if companyID > 0 {
					q = q.Where("tenant_company_id = ? OR tenant_company_id = 0", companyID)
				}
				if err := q.Update("status", req.Status).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ticket status updated"})
			})
		}
	}

	return r
}
