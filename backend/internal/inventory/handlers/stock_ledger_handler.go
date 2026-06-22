package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

type StockLedgerHandler struct {
	service *services.StockLedgerService
	logger  *zap.Logger
}

func NewStockLedgerHandler(s *services.StockLedgerService, logger *zap.Logger) *StockLedgerHandler {
	return &StockLedgerHandler{service: s, logger: logger}
}
func (h *StockLedgerHandler) List(c *gin.Context) {
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
	if v := c.Query("source_type"); v != "" {
		filters["source_type"] = v
	}
	if v := c.Query("movement_type"); v != "" {
		filters["movement_type"] = v
	}
	if v := c.Query("transaction_date_from"); v != "" {
		filters["transaction_date_from"] = v
	}
	if v := c.Query("transaction_date_to"); v != "" {
		filters["transaction_date_to"] = v
	}

	res, total, err := h.service.ListStockLedgerEntries(db, companyID.(uint64), filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock ledger loaded", "data": res, "pagination": gin.H{"page": page, "limit": limit, "total": total}})
}
