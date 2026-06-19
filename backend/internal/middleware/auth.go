package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto/response"
	"github.com/pixandco/erp-phrma/internal/service"
)

func AuthMiddleware(authService *service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authorization header is required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authorization header must be Bearer token")
			c.Abort()
			return
		}

		claims, err := authService.ValidateAccessToken(parts[1])
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid or expired access token")
			c.Abort()
			return
		}

		// Inject tenant metadata and user details into the context
		c.Set("user_id", claims.UserID)
		c.Set("company_id", claims.CompanyID)
		c.Set("branch_id", claims.BranchID)
		c.Set("email", claims.Email)
		c.Set("token_id", claims.ID)

		c.Next()
	}
}
