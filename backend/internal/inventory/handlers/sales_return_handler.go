package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"gorm.io/gorm"
)

type SalesReturnHandler struct {
	svc services.SalesReturnService
}

func NewSalesReturnHandler(svc services.SalesReturnService) *SalesReturnHandler {
	return &SalesReturnHandler{svc: svc}
}

func (h *SalesReturnHandler) ListSalesReturns(c *gin.Context) {
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

	filter := dto.SalesReturnFilter{
		Search: c.Query("search"),
	}

	if val := c.Query("branch_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.BranchID = &id
		}
	}
	if val := c.Query("warehouse_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.WarehouseID = &id
		}
	}
	if val := c.Query("financial_year_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.FinancialYearID = &id
		}
	}
	if val := c.Query("accounting_period_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.AccountingPeriodID = &id
		}
	}
	if val := c.Query("approval_status"); val != "" {
		filter.ApprovalStatus = &val
	}
	if val := c.Query("posted_status"); val != "" {
		filter.PostedStatus = &val
	}
	if val := c.Query("return_reason"); val != "" {
		filter.ReturnReason = &val
	}
	if val := c.Query("return_condition"); val != "" {
		filter.ReturnCondition = &val
	}
	if val := c.Query("sales_return_date_from"); val != "" {
		if d, err := time.Parse("2006-01-02", val); err == nil {
			filter.DateFrom = &d
		}
	}
	if val := c.Query("sales_return_date_to"); val != "" {
		if d, err := time.Parse("2006-01-02", val); err == nil {
			filter.DateTo = &d
		}
	}
	if val := c.DefaultQuery("page", "1"); val != "" {
		if page, err := strconv.Atoi(val); err == nil {
			filter.Page = page
		}
	}
	if val := c.DefaultQuery("limit", "10"); val != "" {
		if limit, err := strconv.Atoi(val); err == nil {
			filter.Limit = limit
		}
	}

	returns, total, err := h.svc.ListSalesReturns(db, companyID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch sales returns", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales returns loaded successfully",
		"data":    returns,
		"meta": gin.H{
			"current_page": filter.Page,
			"per_page":     filter.Limit,
			"total":        total,
		},
	})
}

func (h *SalesReturnHandler) GetSalesReturn(c *gin.Context) {
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

	salesReturn, err := h.svc.GetSalesReturnByID(db, companyID, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load sales return", "error": err.Error()})
		return
	}
	if salesReturn == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Sales return not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return loaded successfully", "data": salesReturn})
}

func (h *SalesReturnHandler) CreateSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database connection missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	var req dto.CreateSalesReturnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}

	salesReturn, err := h.svc.CreateSalesReturn(db, companyID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to create sales return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Sales return created successfully", "data": salesReturn})
}

func (h *SalesReturnHandler) UpdateSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	var req dto.UpdateSalesReturnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}

	salesReturn, err := h.svc.UpdateSalesReturn(db, companyID, userID, id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to update sales return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return updated successfully", "data": salesReturn})
}

func (h *SalesReturnHandler) DeleteSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	if err := h.svc.DeleteSalesReturn(db, companyID, userID, id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to delete sales return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return deleted successfully"})
}

func (h *SalesReturnHandler) SubmitSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	var req dto.SalesReturnActionRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.svc.SubmitSalesReturn(db, companyID, userID, id, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to submit sales return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return submitted successfully"})
}

func (h *SalesReturnHandler) ApproveSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	var req dto.SalesReturnActionRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.svc.ApproveSalesReturn(db, companyID, userID, id, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to approve sales return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return approved successfully"})
}

func (h *SalesReturnHandler) RejectSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	var req dto.SalesReturnActionRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.svc.RejectSalesReturn(db, companyID, userID, id, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to reject sales return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return rejected successfully"})
}

func (h *SalesReturnHandler) PostSalesReturn(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	if err := h.svc.PostSalesReturn(db, companyID, userID, id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to post sales return", "error": fmt.Sprintf("%v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales return posted successfully"})
}

func (h *SalesReturnHandler) GenerateCreditNote(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company context missing"})
		return
	}
	companyID := companyIDRaw.(uint64)

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "User context missing"})
		return
	}
	userID := userIDRaw.(uint64)

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

	creditNote, err := h.svc.GenerateCreditNote(db, companyID, userID, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to generate credit note", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Credit note generated successfully", "data": creditNote})
}
