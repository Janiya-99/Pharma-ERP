package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/auth/services"
	"gorm.io/gorm"
)

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

		permService := services.NewPermissionService(db)
		permissions := permService.GetPermissionsForUserContext(ctx.UserID, ctx.ActiveBranchID, ctx.ActiveSoftwareCode)

		hasPermission := false
		for _, p := range permissions {
			if p == permissionKey {
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
