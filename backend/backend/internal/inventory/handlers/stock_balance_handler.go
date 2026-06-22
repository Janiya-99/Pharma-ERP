package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

type StockBalanceHandler struct {
	service *services.StockBalanceService
	logger  *zap.Logger
}

func NewStockBalanceHandler(s *services.StockBalanceService, logger *zap.Logger) *StockBalanceHandler {
	return &StockBalanceHandler{service: s, logger: logger}
}
func (h *StockBalanceHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	filters := map[string]interface{}{}
	if v := c.Query("branch_id"); v != "" {
		filters["branch_id"] = v
	}
	if v := c.Query("warehouse_id"); v != "" {
		filters["warehouse_id"] = v
	}
	if v := c.Query("product_id"); v != "" {
		filters["product_id"] = v
	}
	if v := c.Query("product_batch_id"); v != "" {
		filters["product_batch_id"] = v
	}
	if v := c.Query("near_expiry_days"); v != "" {
		filters["near_expiry_days"] = v
	}
	if v := c.Query("expired_only"); v != "" {
		filters["expired_only"] = v
	}
	if v := c.Query("low_stock_only"); v != "" {
		filters["low_stock_only"] = v
	}

	res, total, err := h.service.ListStockBalances(db, companyID.(uint64), filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock balances loaded", "data": res, "pagination": gin.H{"page": page, "limit": limit, "total": total}})
}
