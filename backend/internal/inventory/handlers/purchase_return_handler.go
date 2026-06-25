package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"gorm.io/gorm"
)

type PurchaseReturnHandler struct {
	service services.PurchaseReturnService
}

func NewPurchaseReturnHandler(service services.PurchaseReturnService) *PurchaseReturnHandler {
	return &PurchaseReturnHandler{service: service}
}

func (h *PurchaseReturnHandler) FetchAll(c *gin.Context) {
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

	var branchID *uint64
	if bID, err := strconv.ParseUint(c.Query("branch_id"), 10, 64); err == nil {
		branchID = &bID
	}

	returns, err := h.service.FetchAll(db, companyID, branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch purchase returns", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase returns loaded successfully", "data": returns})
}

func (h *PurchaseReturnHandler) FetchByID(c *gin.Context) {
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

	pr, err := h.service.FetchByID(db, companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Purchase return not found", "error": err.Error()})
		return
	}

	var response dto.PurchaseReturnResponse
	response.PurchaseReturn = *pr
	for _, line := range pr.Lines {
		response.Lines = append(response.Lines, dto.PurchaseReturnLineResponse{
			PurchaseReturnLine:   line,
			Product:              &line.Product,
			ProductBatch:         line.ProductBatch,
			WarehouseLocation:    line.WarehouseLocation,
			GoodsReceiptNoteLine: line.GoodsReceiptNoteLine,
		})
	}
	response.ApprovalHistory = pr.Approvals

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return loaded successfully", "data": response})
}

func (h *PurchaseReturnHandler) Create(c *gin.Context) {
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

	var payload dto.PurchaseReturnCreateRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	pr, err := h.service.Create(db, companyID, payload.BranchID, userID, &payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to create purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return created successfully", "data": pr})
}

func (h *PurchaseReturnHandler) Update(c *gin.Context) {
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

	var payload dto.PurchaseReturnUpdateRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input data", "error": err.Error()})
		return
	}

	pr, err := h.service.Update(db, companyID, id, userID, &payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to update purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return updated successfully", "data": pr})
}

func (h *PurchaseReturnHandler) Delete(c *gin.Context) {
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

	if err := h.service.Delete(db, companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to delete purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return deleted successfully"})
}

func (h *PurchaseReturnHandler) Submit(c *gin.Context) {
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

	var payload dto.PurchaseReturnActionRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.SubmitForApproval(db, companyID, id, userID, payload.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to submit purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return submitted successfully"})
}

func (h *PurchaseReturnHandler) Approve(c *gin.Context) {
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

	var payload dto.PurchaseReturnActionRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.Approve(db, companyID, id, userID, payload.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to approve purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return approved successfully"})
}

func (h *PurchaseReturnHandler) Reject(c *gin.Context) {
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

	var payload dto.PurchaseReturnActionRequest
	_ = c.ShouldBindJSON(&payload)

	if err := h.service.Reject(db, companyID, id, userID, payload.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to reject purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return rejected successfully"})
}

func (h *PurchaseReturnHandler) Post(c *gin.Context) {
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

	if err := h.service.Post(db, companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to post purchase return", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Purchase return posted successfully"})
}
