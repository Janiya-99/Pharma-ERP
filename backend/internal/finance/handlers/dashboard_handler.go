package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	logger *zap.Logger
}

func NewDashboardHandler(logger *zap.Logger) *DashboardHandler {
	return &DashboardHandler{
		logger: logger,
	}
}

func (h *DashboardHandler) GetDashboardData(c *gin.Context) {
	var filter dto.DashboardFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		h.logger.Warn("Failed to bind query parameters for dashboard", zap.Error(err))
		// We could default to the user's company context if binding fails, or return error.
		// Let's assume company_id is provided by the frontend or injected from claims.
	}

	// Get company context
	authCtx, exists := c.Get("authContext")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	claims := authCtx.(*middleware.AuthContext)
	filter.CompanyID = claims.CompanyID

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	dashboardService := services.NewDashboardService(db, h.logger)

	data, err := dashboardService.GetDashboardData(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get dashboard data", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve dashboard data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Dashboard data retrieved successfully",
		"data":    data,
	})
}
