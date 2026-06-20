package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

func BranchAccessMiddleware() gin.HandlerFunc {
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

		var ba models.UserBranchAccess
		if err := db.Preload("Branch").Where("user_id = ? AND branch_id = ? AND status = ?", ctx.UserID, ctx.ActiveBranchID, "active").First(&ba).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"message": "Active branch access is no longer valid"})
			c.Abort()
			return
		}

		if ba.Branch.Status != "active" {
			c.JSON(http.StatusForbidden, gin.H{"message": "Active branch access is no longer valid"})
			c.Abort()
			return
		}

		c.Next()
	}
}
