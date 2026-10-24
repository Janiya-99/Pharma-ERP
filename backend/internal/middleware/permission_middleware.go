package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/auth/services"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

func matchPermission(grantedPerm, requiredPerm string) bool {
	if grantedPerm == "*" || grantedPerm == requiredPerm {
		return true
	}

	// Normalize invoice center report permissions
	// Routes: "invoice_center.report.customer_aging"
	// Seeders: "invoice_center.reports.customer_aging.view"
	cleanGranted := strings.TrimSuffix(grantedPerm, ".view")
	cleanRequired := strings.TrimSuffix(requiredPerm, ".view")

	normGranted := strings.Replace(cleanGranted, "invoice_center.reports.", "invoice_center.report.", 1)
	normRequired := strings.Replace(cleanRequired, "invoice_center.reports.", "invoice_center.report.", 1)

	if normGranted == normRequired {
		return true
	}

	// Handle outstanding_invoices vs outstanding_invoice
	if strings.ReplaceAll(normGranted, "outstanding_invoice", "outstanding_invoices") ==
		strings.ReplaceAll(normRequired, "outstanding_invoice", "outstanding_invoices") {
		return true
	}

	// General report permissions: allow access if general report permission is granted
	if strings.HasPrefix(requiredPerm, "invoice_center.report.") || strings.HasPrefix(requiredPerm, "invoice_center.reports.") {
		if grantedPerm == "invoice_center.reports.view" || grantedPerm == "invoice.report.view" || grantedPerm == "invoice_center.report.view" {
			return true
		}
	}

	return false
}

func RequirePermission(permissionKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		companyDB, exists := c.Get("companyDB")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Database context missing"})
			c.Abort()
			return
		}
		db := companyDB.(*gorm.DB)

		authCtx, exists := c.Get("authContext")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Auth context missing"})
			c.Abort()
			return
		}
		ctx := authCtx.(*AuthContext)

		var user models.User
		if err := db.Select("user_type").First(&user, ctx.UserID).Error; err == nil {
			if user.UserType == "super_admin" || user.UserType == "admin" {
				c.Next()
				return
			}
		}

		// Check roles for SUPER_ADMIN, ADMIN, or CFO / FINANCE_DIRECTOR
		var userRoles []string
		_ = db.Table("user_branch_roles ubr").
			Joins("JOIN roles r ON r.id = ubr.role_id").
			Where("ubr.user_id = ? AND ubr.status = 'active' AND r.status = 'active'", ctx.UserID).
			Pluck("r.role_code", &userRoles).Error

		for _, rCode := range userRoles {
			if rCode == "SUPER_ADMIN" || rCode == "ADMIN" {
				c.Next()
				return
			}
			// CFO / Finance Director has full authorized access to all invoice center and finance reports
			if rCode == "FINANCE_DIRECTOR" && (strings.HasPrefix(permissionKey, "invoice_center.report") || strings.HasPrefix(permissionKey, "invoice_center.reports") || strings.HasPrefix(permissionKey, "finance.report")) {
				c.Next()
				return
			}
		}

		permService := services.NewPermissionService(db)
		permissions := permService.GetPermissionsForUserContext(ctx.UserID, ctx.ActiveBranchID, ctx.ActiveSoftwareCode)

		hasPermission := false
		for _, p := range permissions {
			if matchPermission(p, permissionKey) {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{"message": "Permission denied"})
			c.Abort()
			return
		}

		c.Next()
	}
}
