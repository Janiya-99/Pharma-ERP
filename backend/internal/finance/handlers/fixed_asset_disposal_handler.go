package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type FixedAssetDisposalHandler struct {
	logger *zap.Logger
}

func NewFixedAssetDisposalHandler(logger *zap.Logger) *FixedAssetDisposalHandler {
	return &FixedAssetDisposalHandler{logger: logger}
}

func (h *FixedAssetDisposalHandler) getService(c *gin.Context) (*financeServices.FixedAssetDisposalService, uint64, uint64, []uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, nil, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	branchAccess, _ := c.Get("branch_access")
	bAccess := branchAccess.([]uint64)

	repo := repositories.NewFixedAssetDisposalRepository(db)
	assetRepo := repositories.NewFixedAssetRepository(db)

	fyRepo := repositories.NewFinancialYearRepository(db)
	apRepo := repositories.NewAccountingPeriodRepository(db)
	journalRepo := repositories.NewJournalEntryRepository(db)
	chartRepo := repositories.NewChartOfAccountRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)
	glRepo := repositories.NewGeneralLedgerRepository(db)
	glService := financeServices.NewGeneralLedgerService(glRepo, chartRepo, fyRepo, financeAudit, h.logger)

	service := financeServices.NewFixedAssetDisposalService(repo, assetRepo, fyRepo, apRepo, journalRepo, chartRepo, financeAudit, glService, db)

	return service, ctx.CompanyID, ctx.UserID, bAccess, nil
}

func (h *FixedAssetDisposalHandler) ListFixedAssetDisposals(c *gin.Context) {
	service, companyID, _, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	branchID, _ := strconv.ParseFloat(c.Query("branch_id"), 64)
	fixedAssetID, _ := strconv.ParseFloat(c.Query("fixed_asset_id"), 64)

	filters := map[string]interface{}{
		"branch_id":          branchID,
		"fixed_asset_id":     fixedAssetID,
		"disposal_type":      c.Query("disposal_type"),
		"approval_status":    c.Query("approval_status"),
		"posted_status":      c.Query("posted_status"),
		"disposal_date_from": c.Query("disposal_date_from"),
		"disposal_date_to":   c.Query("disposal_date_to"),
		"search":             c.Query("search"),
	}

	disposals, total, err := service.ListFixedAssetDisposals(companyID, branchAccess, filters, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposals loaded successfully",
		"data":    disposals,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *FixedAssetDisposalHandler) GetFixedAssetDisposalByID(c *gin.Context) {
	service, companyID, _, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	disposal, err := service.GetFixedAssetDisposalByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == disposal.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to this branch's disposal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal loaded successfully",
		"data":    disposal,
	})
}

func (h *FixedAssetDisposalHandler) CreateFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateFixedAssetDisposalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == req.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
		return
	}

	disposal, err := service.CreateFixedAssetDisposal(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Fixed asset disposal created successfully",
		"data":    disposal,
	})
}

func (h *FixedAssetDisposalHandler) UpdateFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var req dto.UpdateFixedAssetDisposalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	disposal, err := service.GetFixedAssetDisposalByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == disposal.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
		return
	}

	updatedDisposal, err := service.UpdateFixedAssetDisposal(id, companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal updated successfully",
		"data":    updatedDisposal,
	})
}

func (h *FixedAssetDisposalHandler) DeleteFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	disposal, err := service.GetFixedAssetDisposalByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == disposal.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
		return
	}

	if err := service.DeleteFixedAssetDisposal(id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal deleted successfully",
	})
}

func (h *FixedAssetDisposalHandler) SubmitFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var req dto.ActionFixedAssetDisposalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.SubmitFixedAssetDisposal(id, companyID, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal submitted successfully",
	})
}

func (h *FixedAssetDisposalHandler) ApproveFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var req dto.ActionFixedAssetDisposalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.ApproveFixedAssetDisposal(id, companyID, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal approved successfully",
	})
}

func (h *FixedAssetDisposalHandler) RejectFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	var req dto.ActionFixedAssetDisposalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.RejectFixedAssetDisposal(id, companyID, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal rejected successfully",
	})
}

func (h *FixedAssetDisposalHandler) PostFixedAssetDisposal(c *gin.Context) {
	service, companyID, userID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID format"})
		return
	}

	if err := service.PostFixedAssetDisposal(id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset disposal posted successfully",
	})
}
