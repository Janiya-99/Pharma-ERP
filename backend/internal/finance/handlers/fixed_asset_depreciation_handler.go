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

type FixedAssetDepreciationHandler struct {
	logger *zap.Logger
}

func NewFixedAssetDepreciationHandler(logger *zap.Logger) *FixedAssetDepreciationHandler {
	return &FixedAssetDepreciationHandler{logger: logger}
}

func (h *FixedAssetDepreciationHandler) getService(c *gin.Context) (*financeServices.FixedAssetDepreciationService, uint64, uint64, []uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, nil, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	branchAccess, _ := c.Get("branch_access")
	bAccess := branchAccess.([]uint64)

	repo := repositories.NewFixedAssetDepreciationRepository(db)
	assetRepo := repositories.NewFixedAssetRepository(db)

	fyRepo := repositories.NewFinancialYearRepository(db)
	apRepo := repositories.NewAccountingPeriodRepository(db)
	journalRepo := repositories.NewJournalEntryRepository(db)
	chartRepo := repositories.NewChartOfAccountRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)
	glRepo := repositories.NewGeneralLedgerRepository(db)
	glService := financeServices.NewGeneralLedgerService(glRepo, chartRepo, fyRepo, financeAudit, h.logger)

	service := financeServices.NewFixedAssetDepreciationService(repo, assetRepo, fyRepo, apRepo, journalRepo, chartRepo, financeAudit, glService, db)

	return service, ctx.CompanyID, ctx.UserID, bAccess, nil
}

func (h *FixedAssetDepreciationHandler) ListDepreciationRuns(c *gin.Context) {
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
	finYearID, _ := strconv.ParseFloat(c.Query("financial_year_id"), 64)
	accPeriodID, _ := strconv.ParseFloat(c.Query("accounting_period_id"), 64)

	filters := map[string]interface{}{
		"branch_id":            branchID,
		"financial_year_id":    finYearID,
		"accounting_period_id": accPeriodID,
		"posted_status":        c.Query("posted_status"),
		"run_date_from":        c.Query("run_date_from"),
		"run_date_to":          c.Query("run_date_to"),
		"search":               c.Query("search"),
	}

	runs, total, err := service.ListDepreciationRuns(companyID, branchAccess, filters, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Depreciation runs loaded successfully",
		"data":    runs,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *FixedAssetDepreciationHandler) GetDepreciationRunByID(c *gin.Context) {
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

	run, err := service.GetDepreciationRunByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	if run.BranchID != nil {
		hasAccess := false
		for _, bID := range branchAccess {
			if bID == *run.BranchID {
				hasAccess = true
				break
			}
		}
		if !hasAccess {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to this branch's depreciation run"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Depreciation run loaded successfully",
		"data":    run,
	})
}

func (h *FixedAssetDepreciationHandler) PreviewDepreciation(c *gin.Context) {
	service, companyID, _, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.PreviewDepreciationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if req.BranchID != nil {
		hasAccess := false
		for _, bID := range branchAccess {
			if bID == *req.BranchID {
				hasAccess = true
				break
			}
		}
		if !hasAccess {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
			return
		}
	}

	lines, err := service.PreviewDepreciation(companyID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Depreciation preview generated successfully",
		"data":    lines,
	})
}

func (h *FixedAssetDepreciationHandler) CreateDepreciationRun(c *gin.Context) {
	service, companyID, userID, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateDepreciationRunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if req.BranchID != nil {
		hasAccess := false
		for _, bID := range branchAccess {
			if bID == *req.BranchID {
				hasAccess = true
				break
			}
		}
		if !hasAccess {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
			return
		}
	}

	run, err := service.CreateDepreciationRun(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Depreciation run created successfully",
		"data":    run,
	})
}

func (h *FixedAssetDepreciationHandler) PostDepreciationRun(c *gin.Context) {
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

	if err := service.PostDepreciationRun(id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Depreciation run posted successfully",
	})
}

func (h *FixedAssetDepreciationHandler) DeleteDepreciationRun(c *gin.Context) {
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

	run, err := service.GetDepreciationRunByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	if run.BranchID != nil {
		hasAccess := false
		for _, bID := range branchAccess {
			if bID == *run.BranchID {
				hasAccess = true
				break
			}
		}
		if !hasAccess {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to this branch's depreciation run"})
			return
		}
	}

	if err := service.DeleteDepreciationRun(id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Depreciation run deleted successfully",
	})
}
