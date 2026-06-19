package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

// AuthController handles authentication routes.
type AuthController struct {
	BaseController
	authService *service.AuthService
}

func NewAuthController(authService *service.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
	}
}

// Login handles POST /api/v1/auth/login
func (ctrl *AuthController) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	tokens, user, err := ctrl.authService.Login(req.Email, req.Password, ip, userAgent)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	// Prepare response data (don't send password hash!)
	data := map[string]interface{}{
		"tokens": tokens,
		"user": map[string]interface{}{
			"id":         user.ID,
			"email":      user.Email,
			"full_name":  user.FullName,
			"company_id": user.CompanyID,
			"branch_id":  user.BranchID,
		},
	}

	ctrl.Success(c, "Login successful", data)
}

// Refresh handles POST /api/v1/auth/refresh
func (ctrl *AuthController) Refresh(c *gin.Context) {
	var req request.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	tokens, err := ctrl.authService.RefreshToken(req.RefreshToken, ip, userAgent)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.Success(c, "Token refreshed", map[string]interface{}{
		"tokens": tokens,
	})
}
