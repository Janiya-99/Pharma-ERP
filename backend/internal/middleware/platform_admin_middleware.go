package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/security"
)

func PlatformAdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized - Missing or invalid platform admin token"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := security.ValidatePlatformToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized - Invalid platform admin token"})
			c.Abort()
			return
		}

		c.Set("platformAdminClaims", claims)
		c.Set("platformAdminID", claims.UserID)
		c.Set("platformAdminEmail", claims.Email)
		c.Next()
	}
}
