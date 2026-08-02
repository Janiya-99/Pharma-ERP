package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"net/http"
)

type DashboardHandler struct {
	logger *zap.Logger
}

func NewDashboardHandler(logger *zap.Logger) *DashboardHandler {
	return &DashboardHandler{logger: logger}
}
func (h *DashboardHandler) Summary(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var totalProducts, activeProducts, totalWarehouses, totalBatches, nearExpiryBatches, expiredBatches, blockedBatches, lowStockProducts int64
	var totalStockValue float64

	db.Model(&models.Product{}).Where("company_id = ?", companyID).Count(&totalProducts)
	db.Model(&models.Product{}).Where("company_id = ? AND status = 'active'", companyID).Count(&activeProducts)
	db.Model(&models.Warehouse{}).Where("company_id = ?", companyID).Count(&totalWarehouses)
	db.Model(&models.ProductBatch{}).Where("company_id = ?", companyID).Count(&totalBatches)
	db.Model(&models.ProductBatch{}).Where("company_id = ? AND is_blocked = ?", companyID, true).Count(&blockedBatches)

	db.Model(&models.ProductBatch{}).Where("company_id = ? AND expiry_date < NOW()", companyID).Count(&expiredBatches)
	db.Model(&models.ProductBatch{}).Where("company_id = ? AND expiry_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 90 DAY)", companyID).Count(&nearExpiryBatches)

	db.Model(&models.StockBalance{}).Select("COALESCE(SUM(quantity_available * average_cost), 0)").Where("company_id = ?", companyID).Scan(&totalStockValue)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Dashboard data loaded",
		"data": gin.H{
			"total_products":      totalProducts,
			"active_products":     activeProducts,
			"total_warehouses":    totalWarehouses,
			"total_batches":       totalBatches,
			"near_expiry_batches": nearExpiryBatches,
			"expired_batches":     expiredBatches,
			"blocked_batches":     blockedBatches,
			"low_stock_products":  lowStockProducts,
			"total_stock_value":   totalStockValue,
		},
	})
}
