package compliance

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/compliance/handlers"
	"go.uber.org/zap"
)

func SetupRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	dashboardHandler := handlers.NewComplianceDashboardHandler(logger)

	dashGroup := rg.Group("/dashboard")
	{
		dashGroup.GET("/summary", dashboardHandler.GetSummary)
	}
}
