package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

func SoftwareAccessMiddleware() gin.HandlerFunc {
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
			if user.UserType == "super_admin" {
				c.Next()
				return
			}
		}

		var software models.SoftwareModule
		if err := db.Where("software_code = ? AND status = ?", ctx.ActiveSoftwareCode, "active").First(&software).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"message": "Active software access is no longer valid"})
			c.Abort()
			return
		}

		var sa models.UserSoftwareAccess
		if err := db.Where("user_id = ? AND software_id = ? AND status = ? AND can_access = ?", ctx.UserID, software.ID, "active", true).First(&sa).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"message": "Active software access is no longer valid"})
			c.Abort()
			return
		}

		c.Next()
	}
}
