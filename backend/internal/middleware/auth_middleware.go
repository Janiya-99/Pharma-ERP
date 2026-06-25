package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/database"
	"github.com/pixandco/erp-phrma/internal/security"
)

type AuthContext struct {
	UserID             uint64
	CompanyCode        string
	CompanyID          uint64
	ActiveBranchID     uint64
	ActiveSoftwareCode string
}

func CompanyAuthMiddleware(resolver *database.CompanyResolver) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized - Missing or invalid token format"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := security.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized - Invalid token"})
			c.Abort()
			return
		}

		// Resolve the company database
		db, _, err := resolver.ResolveCompanyDB(claims.CompanyCode)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized - Invalid company"})
			c.Abort()
			return
		}

		// Set context variables
		authCtx := &AuthContext{
			UserID:             claims.UserID,
			CompanyCode:        claims.CompanyCode,
			CompanyID:          claims.CompanyID,
			ActiveBranchID:     claims.ActiveBranchID,
			ActiveSoftwareCode: claims.ActiveSoftwareCode,
		}

		c.Set("authContext", authCtx)
		c.Set("companyDB", db)
		c.Set("tokenString", tokenString)
		c.Set("company_id", claims.CompanyID)
		c.Set("user_id", claims.UserID)

		c.Next()
	}
}
