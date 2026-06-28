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

type StockTransferHandler struct {
	service services.StockTransferService
}

func NewStockTransferHandler(service services.StockTransferService) *StockTransferHandler {
	return &StockTransferHandler{service: service}
}

func (h *StockTransferHandler) ListStockTransfers(c *gin.Context) {
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

	var branchID *uint64
	if bID, err := strconv.ParseUint(c.Query("branch_id"), 10, 64); err == nil {
		branchID = &bID
	}
	var fromWarehouseID *uint64
	if fID, err := strconv.ParseUint(c.Query("from_warehouse_id"), 10, 64); err == nil {
		fromWarehouseID = &fID
	}
	var toWarehouseID *uint64
	if tID, err := strconv.ParseUint(c.Query("to_warehouse_id"), 10, 64); err == nil {
		toWarehouseID = &tID
	}
	var finYearID *uint64
	if fYID, err := strconv.ParseUint(c.Query("financial_year_id"), 10, 64); err == nil {
		finYearID = &fYID
	}
	var accPeriodID *uint64
	if aPID, err := strconv.ParseUint(c.Query("accounting_period_id"), 10, 64); err == nil {
		accPeriodID = &aPID
	}

	filter := dto.ListStockTransfersFilters{
		BranchID:           branchID,
		FromWarehouseID:    fromWarehouseID,
		ToWarehouseID:      toWarehouseID,
		FinancialYearID:    finYearID,
		AccountingPeriodID: accPeriodID,
		ApprovalStatus:     c.Query("approval_status"),
		PostedStatus:       c.Query("posted_status"),
		TransferDateFrom:   c.Query("transfer_date_from"),
		TransferDateTo:     c.Query("transfer_date_to"),
		Search:             c.Query("search"),
		Page:               page,
		Limit:              limit,
	}

	transfers, total, err := h.service.ListStockTransfers(db, companyID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch stock transfers", "error": err.Error()})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Stock transfers loaded successfully",
		"data":    transfers,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *StockTransferHandler) GetStockTransfer(c *gin.Context) {
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

	transfer, err := h.service.GetStockTransferByID(db, companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Stock transfer not found", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer loaded successfully", "data": transfer})
}

func (h *StockTransferHandler) CreateStockTransfer(c *gin.Context) {
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

	var payload dto.CreateStockTransferRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	transfer, err := h.service.CreateStockTransfer(db, companyID, userID, payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to create stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer created successfully", "data": transfer})
}

func (h *StockTransferHandler) UpdateStockTransfer(c *gin.Context) {
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

	var payload dto.UpdateStockTransferRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	err = h.service.UpdateStockTransfer(db, companyID, userID, id, payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to update stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer updated successfully"})
}

func (h *StockTransferHandler) DeleteStockTransfer(c *gin.Context) {
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

	if err := h.service.DeleteStockTransfer(db, companyID, userID, id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to delete stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer deleted successfully"})
}

func (h *StockTransferHandler) SubmitStockTransfer(c *gin.Context) {
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

	var payload dto.SubmitStockTransferRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.SubmitStockTransfer(db, companyID, userID, id, payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to submit stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer submitted successfully"})
}

func (h *StockTransferHandler) ApproveStockTransfer(c *gin.Context) {
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

	var payload dto.ApproveStockTransferRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.ApproveStockTransfer(db, companyID, userID, id, payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to approve stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer approved successfully"})
}

func (h *StockTransferHandler) RejectStockTransfer(c *gin.Context) {
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

	var payload dto.RejectStockTransferRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.RejectStockTransfer(db, companyID, userID, id, payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to reject stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer rejected successfully"})
}

func (h *StockTransferHandler) PostStockTransfer(c *gin.Context) {
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

	if err := h.service.PostStockTransfer(db, companyID, userID, id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to post stock transfer", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stock transfer posted successfully"})
}
