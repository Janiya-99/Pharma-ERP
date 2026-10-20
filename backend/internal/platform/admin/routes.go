package admin

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"github.com/pixandco/erp-phrma/internal/platform/admin/services"
	"github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/security"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, platformDB *gorm.DB, logger *zap.Logger) {
	// Public auth login
	router.POST("/auth/login", loginHandler(platformDB))

	// Authenticated routes
	adminGroup := router.Group("")
	adminGroup.Use(middleware.PlatformAdminAuthMiddleware())
	{
		adminGroup.GET("/auth/me", meHandler(platformDB))

		// Companies
		adminGroup.GET("/companies", listCompanies(platformDB))
		adminGroup.POST("/companies", createCompany(platformDB, logger))
		adminGroup.GET("/companies/:id", getCompany(platformDB))
		adminGroup.PUT("/companies/:id", updateCompany(platformDB))
		adminGroup.POST("/companies/:id/suspend", suspendCompany(platformDB))
		adminGroup.POST("/companies/:id/activate", activateCompany(platformDB))
		adminGroup.POST("/companies/:id/extend-license", extendCompanyLicense(platformDB))

		// Company Databases catalog overview
		adminGroup.GET("/company-databases", listCompanyDatabases(platformDB))

		// Subscription Plans
		adminGroup.GET("/subscription-plans", listPlans(platformDB))
		adminGroup.POST("/subscription-plans", createPlan(platformDB))
		adminGroup.PUT("/subscription-plans/:id", updatePlan(platformDB))

		// Company Subscriptions
		adminGroup.GET("/subscriptions", listSubscriptions(platformDB))

		// Billing & Payments
		adminGroup.GET("/billing/invoices", listInvoices(platformDB))
		adminGroup.POST("/billing/invoices", createInvoice(platformDB))
		adminGroup.GET("/billing/payments", listPayments(platformDB))
		adminGroup.POST("/billing/payments", createPayment(platformDB))

		// Software modules, features, versions, flags
		adminGroup.GET("/modules", listModules(platformDB))
		adminGroup.GET("/features", listFeatures(platformDB))
		adminGroup.GET("/versions", listVersions(platformDB))
		adminGroup.GET("/feature-flags", listFeatureFlags(platformDB))
		adminGroup.POST("/feature-flags", createFeatureFlag(platformDB))

		// Admin users, roles, permissions
		adminGroup.GET("/users", listAdminUsers(platformDB))
		adminGroup.POST("/users", createAdminUser(platformDB))
		adminGroup.GET("/roles", listRoles(platformDB))
		adminGroup.GET("/permissions", listPermissions(platformDB))

		// Settings (branding, email, backups, gateways)
		adminGroup.GET("/settings", getSettings(platformDB))
		adminGroup.PUT("/settings/branding", updateBranding(platformDB))
		adminGroup.PUT("/settings/email", updateEmail(platformDB))
		adminGroup.PUT("/settings/payment-gateway", updatePaymentGateway(platformDB))
		adminGroup.PUT("/settings/backup", updateBackupSettings(platformDB))

		// Support tickets
		adminGroup.GET("/support/tickets", listSupportTickets(platformDB))
		adminGroup.POST("/support/tickets", createSupportTicket(platformDB))
		adminGroup.PUT("/support/tickets/:id/status", updateTicketStatus(platformDB))
		adminGroup.PUT("/support/tickets/:id", updateTicketStatus(platformDB))
		adminGroup.GET("/support/tickets/:id/messages", listSupportMessages(platformDB))
		adminGroup.POST("/support/tickets/:id/messages", sendSupportMessage(platformDB))
		adminGroup.DELETE("/support/tickets/:id", deleteSupportTicket(platformDB))

		// Security Logs & IP Restrictions
		adminGroup.GET("/audit-logs", listAuditLogs(platformDB))
		adminGroup.GET("/login-logs", listLoginLogs(platformDB))
		adminGroup.GET("/blocked-ips", listPlatformBlockedIPs(platformDB))
		adminGroup.POST("/blocked-ips/unblock", unblockPlatformIP(platformDB))
	}
}

func loginHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid credentials format"})
			return
		}

		var admin models.PlatformAdminUser
		if err := db.Where("email = ? AND status = ?", req.Email, "active").First(&admin).Error; err != nil {
			db.Create(&models.PlatformLoginLog{
				Email:        req.Email,
				Status:       "failed",
				IPAddress:    c.ClientIP(),
				UserAgent:    c.Request.UserAgent(),
				ErrorMessage: "Platform Admin user not found or suspended",
				CreatedAt:    time.Now(),
			})
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
			return
		}

		if !security.CheckPasswordHash(req.Password, admin.PasswordHash) {
			db.Create(&models.PlatformLoginLog{
				UserID:       admin.ID,
				Email:        req.Email,
				Status:       "failed",
				IPAddress:    c.ClientIP(),
				UserAgent:    c.Request.UserAgent(),
				ErrorMessage: "Incorrect credentials",
				CreatedAt:    time.Now(),
			})
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
			return
		}

		token, err := security.GeneratePlatformToken(admin.ID, admin.Username, admin.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error creating auth token"})
			return
		}

		db.Create(&models.PlatformLoginLog{
			UserID:    admin.ID,
			Email:     req.Email,
			Status:    "success",
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
			CreatedAt: time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"token":   token,
			"user": gin.H{
				"id":       admin.ID,
				"username": admin.Username,
				"email":    admin.Email,
			},
		})
	}
}

func meHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		adminID, _ := c.Get("platformAdminID")
		var admin models.PlatformAdminUser
		if err := db.First(&admin, adminID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"user":    admin,
		})
	}
}

func listCompanies(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.TenantCompany
		statusQuery := c.Query("status")
		q := db.Model(&models.TenantCompany{})
		if statusQuery != "" {
			q = q.Where("status = ?", statusQuery)
		}
		q.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createCompany(db *gorm.DB, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req services.CompanyCreationRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		company, err := services.CreateTenantCompany(db, req, logger, adminID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": company})
	}
}

func getCompany(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var company models.TenantCompany
		if err := db.First(&company, c.Param("id")).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Company not found"})
			return
		}

		var billing models.TenantCompanyBillingProfile
		db.Where("tenant_company_id = ?", company.ID).First(&billing)

		var sub models.TenantCompanySubscription
		db.Where("tenant_company_id = ? AND status = 'active'", company.ID).First(&sub)

		var modules []models.TenantCompanyModule
		db.Where("tenant_company_id = ?", company.ID).Find(&modules)

		var dbDetails models.TenantCompanyDatabase
		db.Where("tenant_company_id = ?", company.ID).First(&dbDetails)

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"company":         company,
				"billing_profile": billing,
				"subscription":    sub,
				"modules":         modules,
				"database":        dbDetails,
			},
		})
	}
}

func updateCompany(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var company models.TenantCompany
		if err := db.First(&company, c.Param("id")).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Company not found"})
			return
		}

		var req struct {
			CompanyName  string `json:"company_name"`
			CompanyEmail string `json:"company_email"`
			CompanyPhone string `json:"company_phone"`
			Status       string `json:"status"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid update layout"})
			return
		}

		company.CompanyName = req.CompanyName
		company.CompanyEmail = req.CompanyEmail
		company.CompanyPhone = req.CompanyPhone
		if req.Status != "" {
			company.Status = req.Status
		}

		db.Save(&company)

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		db.Create(&models.PlatformAuditLog{
			UserID:     adminID,
			Action:     "company.update",
			TargetType: "tenant_companies",
			TargetID:   fmt.Sprintf("%d", company.ID),
			Details:    fmt.Sprintf("Updated company profile for: %s", company.CompanyName),
			CreatedAt:  time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{"success": true, "data": company})
	}
}

func suspendCompany(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var company models.TenantCompany
		if err := db.First(&company, c.Param("id")).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Company not found"})
			return
		}

		db.Model(&company).Updates(map[string]interface{}{
			"status":              "suspended",
			"subscription_status": "suspended",
		})

		// Mark subscription suspended
		db.Model(&models.TenantCompanySubscription{}).Where("tenant_company_id = ?", company.ID).Update("status", "suspended")

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		db.Create(&models.PlatformAuditLog{
			UserID:     adminID,
			Action:     "company.suspend",
			TargetType: "tenant_companies",
			TargetID:   fmt.Sprintf("%d", company.ID),
			Details:    fmt.Sprintf("Suspended client company: %s", company.CompanyName),
			CreatedAt:  time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Company suspended successfully", "status": "suspended"})
	}
}

func activateCompany(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var company models.TenantCompany
		if err := db.First(&company, c.Param("id")).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Company not found"})
			return
		}

		db.Model(&company).Updates(map[string]interface{}{
			"status":              "active",
			"subscription_status": "active",
		})

		db.Model(&models.TenantCompanySubscription{}).Where("tenant_company_id = ?", company.ID).Update("status", "active")

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		db.Create(&models.PlatformAuditLog{
			UserID:     adminID,
			Action:     "company.activate",
			TargetType: "tenant_companies",
			TargetID:   fmt.Sprintf("%d", company.ID),
			Details:    fmt.Sprintf("Activated client company: %s", company.CompanyName),
			CreatedAt:  time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Company activated successfully", "status": "active"})
	}
}

func extendCompanyLicense(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var company models.TenantCompany
		if err := db.First(&company, c.Param("id")).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Company not found"})
			return
		}

		var req struct {
			Days int `json:"days"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.Days <= 0 {
			req.Days = 30
		}

		baseTime := time.Now()
		if company.LicenseEndDate != nil && company.LicenseEndDate.After(baseTime) {
			baseTime = *company.LicenseEndDate
		}
		newExpiry := baseTime.AddDate(0, 0, req.Days)

		db.Model(&company).Updates(map[string]interface{}{
			"license_end_date":    newExpiry,
			"status":              "active",
			"subscription_status": "active",
		})
		db.Model(&models.TenantCompanySubscription{}).Where("tenant_company_id = ?", company.ID).Updates(map[string]interface{}{
			"end_date": newExpiry,
			"status":   "active",
		})

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		db.Create(&models.PlatformAuditLog{
			UserID:     adminID,
			Action:     "company.license_extend",
			TargetType: "tenant_companies",
			TargetID:   fmt.Sprintf("%d", company.ID),
			Details:    fmt.Sprintf("Extended license for %s by %d days to %s", company.CompanyName, req.Days, newExpiry.Format("2006-01-02")),
			CreatedAt:  time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{
			"success":          true,
			"message":          fmt.Sprintf("License extended by %d days until %s", req.Days, newExpiry.Format("2006-01-02")),
			"license_end_date": newExpiry,
			"status":           "active",
		})
	}
}

func listCompanyDatabases(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.TenantCompanyDatabase
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listPlans(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.SubscriptionPlan
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createPlan(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.SubscriptionPlan
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid plan definition"})
			return
		}

		if err := db.Create(&req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create subscription plan"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
	}
}

func updatePlan(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var plan models.SubscriptionPlan
		if err := db.First(&plan, c.Param("id")).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Plan not found"})
			return
		}

		if err := c.ShouldBindJSON(&plan); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request data"})
			return
		}

		db.Save(&plan)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": plan})
	}
}

func listSubscriptions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.TenantCompanySubscription
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listInvoices(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.SubscriptionInvoice
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createInvoice(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.SubscriptionInvoice
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		req.InvoiceNumber = fmt.Sprintf("INV-%d", time.Now().UnixNano())
		req.InvoiceDate = time.Now()
		req.BalanceAmount = req.TotalAmount

		if err := db.Create(&req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
	}
}

func listPayments(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.SubscriptionPayment
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createPayment(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.SubscriptionPayment
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		req.PaymentDate = time.Now()
		req.PaymentStatus = "confirmed"

		tx := db.Begin()
		if err := tx.Create(&req).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		// Update invoice
		var invoice models.SubscriptionInvoice
		if err := tx.First(&invoice, req.SubscriptionInvoiceID).Error; err == nil {
			invoice.PaidAmount += req.Amount
			invoice.BalanceAmount = invoice.TotalAmount - invoice.PaidAmount
			if invoice.BalanceAmount <= 0 {
				invoice.InvoiceStatus = "paid"
			} else {
				invoice.InvoiceStatus = "partially_paid"
			}
			tx.Save(&invoice)
		}

		tx.Commit()
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
	}
}

func listModules(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.ErpModule
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listFeatures(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.ErpFeature
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listVersions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.ErpVersion
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listFeatureFlags(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.FeatureFlag
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createFeatureFlag(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.FeatureFlag
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		if err := db.Create(&req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
	}
}

func listAdminUsers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.PlatformAdminUser
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createAdminUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		hash, err := security.HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Password hash failed"})
			return
		}

		user := models.PlatformAdminUser{
			Username:     req.Username,
			Email:        req.Email,
			PasswordHash: hash,
			Status:       "active",
		}

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": user})
	}
}

func listRoles(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.PlatformRole
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listPermissions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.PlatformPermission
		db.Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func getSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var email models.SystemEmailSetting
		db.First(&email)

		var branding models.SystemBrandingSetting
		db.First(&branding)

		var backup models.SystemBackupSetting
		db.First(&backup)

		var gateway models.SystemPaymentGatewaySetting
		db.First(&gateway)

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"email":           email,
				"branding":        branding,
				"backup":          backup,
				"payment_gateway": gateway,
			},
		})
	}
}

func updateBranding(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var setting models.SystemBrandingSetting
		db.First(&setting)

		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		db.Save(&setting)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": setting})
	}
}

func updateEmail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var setting models.SystemEmailSetting
		db.First(&setting)

		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		db.Save(&setting)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": setting})
	}
}

func updatePaymentGateway(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var setting models.SystemPaymentGatewaySetting
		db.First(&setting)

		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		db.Save(&setting)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": setting})
	}
}

func updateBackupSettings(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var setting models.SystemBackupSetting
		db.First(&setting)

		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		db.Save(&setting)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": setting})
	}
}

type SupportTicketDetail struct {
	models.SupportTicket
	CompanyName string `json:"company_name"`
	CompanyCode string `json:"company_code"`
}

func listSupportTickets(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []SupportTicketDetail
		db.Table("support_tickets").
			Select("support_tickets.*, tenant_companies.company_name, tenant_companies.company_code").
			Joins("LEFT JOIN tenant_companies ON support_tickets.tenant_company_id = tenant_companies.id").
			Order("support_tickets.id DESC").
			Scan(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func createSupportTicket(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			TenantCompanyID uint   `json:"tenant_company_id"`
			Subject         string `json:"subject"`
			Description     string `json:"description"`
			Priority        string `json:"priority"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		if req.Priority == "" {
			req.Priority = "medium"
		}

		ticket := models.SupportTicket{
			TenantCompanyID: req.TenantCompanyID,
			TicketNumber:    "TKT-" + strconv.FormatInt(time.Now().Unix(), 10),
			Subject:         req.Subject,
			Description:     req.Description,
			Priority:        req.Priority,
			Status:          "open",
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		if err := db.Create(&ticket).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		if req.Description != "" {
			adminIDVal, _ := c.Get("platformAdminID")
			adminID, _ := adminIDVal.(uint)
			db.Create(&models.SupportTicketMessage{
				SupportTicketID: ticket.ID,
				SenderType:      "platform_admin",
				SenderID:        adminID,
				MessageText:     req.Description,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			})
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": ticket})
	}
}

func updateTicketStatus(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ticketID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
			return
		}

		var req struct {
			Status   string `json:"status"`
			Priority string `json:"priority"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		updates := map[string]interface{}{
			"updated_at": time.Now(),
		}
		if req.Status != "" {
			updates["status"] = req.Status
		}
		if req.Priority != "" {
			updates["priority"] = req.Priority
		}

		if err := db.Model(&models.SupportTicket{}).Where("id = ?", ticketID).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		var updated models.SupportTicket
		db.First(&updated, ticketID)

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		db.Create(&models.PlatformAuditLog{
			UserID:     adminID,
			Action:     "ticket.status_update",
			TargetType: "support_tickets",
			TargetID:   fmt.Sprintf("%d", ticketID),
			Details:    fmt.Sprintf("Updated ticket %s status to %s", updated.TicketNumber, updated.Status),
			CreatedAt:  time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{"success": true, "data": updated})
	}
}

func listSupportMessages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ticketID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
			return
		}

		var list []models.SupportTicketMessage
		db.Where("support_ticket_id = ?", ticketID).Order("id ASC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func sendSupportMessage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ticketID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
			return
		}

		var msg models.SupportTicketMessage
		if err := c.ShouldBindJSON(&msg); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}

		msg.SupportTicketID = uint(ticketID)
		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		msg.SenderType = "platform_admin"
		msg.SenderID = adminID

		if err := db.Create(&msg).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		// Update ticket updatedAt
		db.Model(&models.SupportTicket{}).Where("id = ?", ticketID).Update("updated_at", time.Now())

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": msg})
	}
}

func deleteSupportTicket(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ticketID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid ticket ID"})
			return
		}

		var ticket models.SupportTicket
		if err := db.First(&ticket, ticketID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Ticket not found"})
			return
		}

		db.Where("support_ticket_id = ?", ticket.ID).Delete(&models.SupportTicketMessage{})
		if err := db.Delete(&ticket).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete ticket"})
			return
		}

		adminIDVal, _ := c.Get("platformAdminID")
		adminID, _ := adminIDVal.(uint)

		db.Create(&models.PlatformAuditLog{
			UserID:     adminID,
			Action:     "ticket.delete",
			TargetType: "support_tickets",
			TargetID:   fmt.Sprintf("%d", ticketID),
			Details:    fmt.Sprintf("Deleted ticket %s", ticket.TicketNumber),
			CreatedAt:  time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ticket deleted successfully"})
	}
}

func listAuditLogs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.PlatformAuditLog
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

func listLoginLogs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var list []models.PlatformLoginLog
		db.Order("id DESC").Find(&list)
		c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
	}
}

type PlatformBlockedIPItem struct {
	IP          string `json:"ip"`
	FailedCount int    `json:"failed_count"`
	LastAttempt string `json:"last_attempt"`
	Reason      string `json:"reason"`
	Status      string `json:"status"`
}

func listPlatformBlockedIPs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		type row struct {
			IPAddress string
			Cnt       int
			LastAt    time.Time
			LastErr   string
		}
		var rows []row
		db.Raw(`
			SELECT ip_address, COUNT(*) as cnt, MAX(created_at) as last_at, MAX(error_message) as last_err
			FROM platform_login_logs
			WHERE status = 'failed' AND created_at >= ?
			GROUP BY ip_address
			ORDER BY last_at DESC
		`, time.Now().Add(-72*time.Hour)).Scan(&rows)

		var items []PlatformBlockedIPItem
		for _, r := range rows {
			status := "SUSPICIOUS"
			if r.Cnt >= 3 {
				status = "BLOCKED"
			}
			reason := "Authentication threshold breach"
			if r.LastErr != "" {
				reason = r.LastErr
			}
			items = append(items, PlatformBlockedIPItem{
				IP:          r.IPAddress,
				FailedCount: r.Cnt,
				LastAttempt: r.LastAt.Format("Jan 02, 15:04"),
				Reason:      reason,
				Status:      status,
			})
		}
		if items == nil {
			items = []PlatformBlockedIPItem{}
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
	}
}

func unblockPlatformIP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			IP string `json:"ip"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.IP == "" {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Valid IP address is required"})
			return
		}

		db.Exec("UPDATE platform_login_logs SET status = 'unblocked' WHERE ip_address = ? AND status = 'failed'", req.IP)
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "IP " + req.IP + " unblocked successfully. Access restrictions removed."})
	}
}

