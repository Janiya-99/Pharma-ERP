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

type GRNHandler struct {
	service services.GRNService
}

func NewGRNHandler(service services.GRNService) *GRNHandler {
	return &GRNHandler{service: service}
}

func (h *GRNHandler) ListGRNs(c *gin.Context) {
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
	branchID, _ := strconv.ParseUint(c.Query("branch_id"), 10, 64)
	supplierID, _ := strconv.ParseUint(c.Query("supplier_id"), 10, 64)
	warehouseID, _ := strconv.ParseUint(c.Query("warehouse_id"), 10, 64)
	finYearID, _ := strconv.ParseUint(c.Query("financial_year_id"), 10, 64)
	accPeriodID, _ := strconv.ParseUint(c.Query("accounting_period_id"), 10, 64)

	filter := dto.GRNFilter{
		CompanyID:          companyID,
		BranchID:           branchID,
		SupplierID:         supplierID,
		WarehouseID:        warehouseID,
		FinancialYearID:    finYearID,
		AccountingPeriodID: accPeriodID,
		ApprovalStatus:     c.Query("approval_status"),
		PostedStatus:       c.Query("posted_status"),
		GRNDateFrom:        c.Query("grn_date_from"),
		GRNDateTo:          c.Query("grn_date_to"),
		Search:             c.Query("search"),
		Page:               page,
		Limit:              limit,
	}

	grns, total, err := h.service.ListGRNs(db, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch GRNs", "error": err.Error()})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "GRNs loaded successfully",
		"data":    grns,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *GRNHandler) GetGRN(c *gin.Context) {
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

	grn, err := h.service.GetGRNByID(db, companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "GRN not found", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN loaded successfully", "data": grn})
}

func (h *GRNHandler) CreateGRN(c *gin.Context) {
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

	var payload dto.CreateGRNPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	payload.CompanyID = companyID
	payload.CreatedBy = userID

	grn, err := h.service.CreateGRN(db, payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to create GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN created successfully", "data": grn})
}

func (h *GRNHandler) UpdateGRN(c *gin.Context) {
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

	var payload dto.UpdateGRNPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	payload.CompanyID = companyID
	payload.UpdatedBy = userID

	grn, err := h.service.UpdateGRN(db, id, payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to update GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN updated successfully", "data": grn})
}

func (h *GRNHandler) DeleteGRN(c *gin.Context) {
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

	if err := h.service.DeleteGRN(db, companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to delete GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN deleted successfully"})
}

func (h *GRNHandler) SubmitGRN(c *gin.Context) {
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

	var payload dto.ActionGRNPayload
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.SubmitGRN(db, companyID, id, userID, payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to submit GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN submitted successfully"})
}

func (h *GRNHandler) ApproveGRN(c *gin.Context) {
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

	var payload dto.ActionGRNPayload
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.ApproveGRN(db, companyID, id, userID, payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to approve GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN approved successfully"})
}

func (h *GRNHandler) RejectGRN(c *gin.Context) {
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

	var payload dto.ActionGRNPayload
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.RejectGRN(db, companyID, id, userID, payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to reject GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN rejected successfully"})
}

func (h *GRNHandler) PostGRN(c *gin.Context) {
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

	if err := h.service.PostGRN(db, companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to post GRN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "GRN posted successfully"})
}
