package handlers

import (
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"gorm.io/gorm"
)

type StockAdjustmentHandler struct {
	service services.StockAdjustmentService
}

func NewStockAdjustmentHandler(service services.StockAdjustmentService) *StockAdjustmentHandler {
	return &StockAdjustmentHandler{service: service}
}

func (h *StockAdjustmentHandler) ListStockAdjustments(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := make(map[string]interface{})
	if bID, err := strconv.ParseUint(c.Query("branch_id"), 10, 64); err == nil {
		filters["branch_id"] = bID
	}
	if wID, err := strconv.ParseUint(c.Query("warehouse_id"), 10, 64); err == nil {
		filters["warehouse_id"] = wID
	}
	if fID, err := strconv.ParseUint(c.Query("financial_year_id"), 10, 64); err == nil {
		filters["financial_year_id"] = fID
	}
	if aID, err := strconv.ParseUint(c.Query("accounting_period_id"), 10, 64); err == nil {
		filters["accounting_period_id"] = aID
	}
	if val := c.Query("adjustment_type"); val != "" {
		filters["adjustment_type"] = val
	}
	if val := c.Query("approval_status"); val != "" {
		filters["approval_status"] = val
	}
	if val := c.Query("posted_status"); val != "" {
		filters["posted_status"] = val
	}
	if val := c.Query("adjustment_date_from"); val != "" {
		filters["adjustment_date_from"] = val
	}
	if val := c.Query("adjustment_date_to"); val != "" {
		filters["adjustment_date_to"] = val
	}

	search := c.Query("search")

	var branchID *uint64
	if bID, ok := filters["branch_id"].(uint64); ok {
		branchID = &bID
	}

	adjustments, total, err := h.service.ListStockAdjustments(db, companyID, branchID, filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch stock adjustments", "error": err.Error()})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Stock adjustments loaded successfully",
		"data":    adjustments,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *StockAdjustmentHandler) GetStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	adj, err := h.service.GetStockAdjustmentByID(db, id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Stock adjustment not found", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment loaded successfully", "data": adj})
}

func (h *StockAdjustmentHandler) CreateStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	var payload dto.StockAdjustmentCreateRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	adj, err := h.service.CreateStockAdjustment(db, &payload, companyID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to create stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment created successfully", "data": adj})
}

func (h *StockAdjustmentHandler) UpdateStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var payload dto.StockAdjustmentUpdateRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	err = h.service.UpdateStockAdjustment(db, id, &payload, companyID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to update stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment updated successfully"})
}

func (h *StockAdjustmentHandler) DeleteStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	if err := h.service.DeleteStockAdjustment(db, id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to delete stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment deleted successfully"})
}

func (h *StockAdjustmentHandler) SubmitStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var payload dto.StockAdjustmentActionRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.SubmitStockAdjustment(db, id, &payload, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to submit stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment submitted successfully"})
}

func (h *StockAdjustmentHandler) ApproveStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var payload dto.StockAdjustmentActionRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.ApproveStockAdjustment(db, id, &payload, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to approve stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment approved successfully"})
}

func (h *StockAdjustmentHandler) RejectStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var payload dto.StockAdjustmentActionRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.RejectStockAdjustment(db, id, &payload, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to reject stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment rejected successfully"})
}

func (h *StockAdjustmentHandler) PostStockAdjustment(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	if err := h.service.PostStockAdjustment(db, id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to post stock adjustment", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock adjustment posted successfully"})
}
