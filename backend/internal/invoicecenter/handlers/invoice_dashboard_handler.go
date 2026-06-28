package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InvoiceDashboardHandler struct {
	service *services.InvoiceDashboardService
	logger  *zap.Logger
}

func NewInvoiceDashboardHandler(s *services.InvoiceDashboardService, logger *zap.Logger) *InvoiceDashboardHandler {
	return &InvoiceDashboardHandler{service: s, logger: logger}
}

func (h *InvoiceDashboardHandler) GetSummary(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	summary, err := h.service.GetSummary(db, companyID.(uint64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
			"errors":  []string{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Invoice Center dashboard loaded successfully",
		"data":    summary,
	})
}
