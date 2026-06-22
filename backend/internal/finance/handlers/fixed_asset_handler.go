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

type FixedAssetHandler struct {
	logger *zap.Logger
}

func NewFixedAssetHandler(logger *zap.Logger) *FixedAssetHandler {
	return &FixedAssetHandler{logger: logger}
}

func (h *FixedAssetHandler) getService(c *gin.Context) (*financeServices.FixedAssetService, uint64, uint64, []uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, nil, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	branchAccess, _ := c.Get("branch_access")
	bAccess := branchAccess.([]uint64)

	repo := repositories.NewFixedAssetRepository(db)
	categoryRepo := repositories.NewFixedAssetCategoryRepository(db)
	auditLogService := financeServices.NewAuditLogService(db, h.logger)
	chartRepo := repositories.NewChartOfAccountRepository(db)

	service := financeServices.NewFixedAssetService(repo, categoryRepo, auditLogService, chartRepo)

	return service, ctx.CompanyID, ctx.UserID, bAccess, nil
}

func (h *FixedAssetHandler) ListFixedAssets(c *gin.Context) {
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
	categoryID, _ := strconv.ParseFloat(c.Query("fixed_asset_category_id"), 64)

	filters := map[string]interface{}{
		"branch_id":               branchID,
		"fixed_asset_category_id": categoryID,
		"asset_status":            c.Query("asset_status"),
		"purchase_date_from":      c.Query("purchase_date_from"),
		"purchase_date_to":        c.Query("purchase_date_to"),
		"search":                  c.Query("search"),
	}

	assets, total, err := service.ListFixedAssets(companyID, branchAccess, filters, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed assets loaded successfully",
		"data":    assets,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *FixedAssetHandler) GetFixedAssetByID(c *gin.Context) {
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

	asset, err := service.GetFixedAssetByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == asset.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to this branch's asset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset loaded successfully",
		"data":    asset,
	})
}

func (h *FixedAssetHandler) CreateFixedAsset(c *gin.Context) {
	service, companyID, userID, branchAccess, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateFixedAssetRequest
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

	asset, err := service.CreateFixedAsset(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Fixed asset created successfully",
		"data":    asset,
	})
}

func (h *FixedAssetHandler) UpdateFixedAsset(c *gin.Context) {
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

	var req dto.UpdateFixedAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	asset, err := service.GetFixedAssetByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == asset.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
		return
	}

	updatedAsset, err := service.UpdateFixedAsset(id, companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset updated successfully",
		"data":    updatedAsset,
	})
}

func (h *FixedAssetHandler) DeleteFixedAsset(c *gin.Context) {
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

	asset, err := service.GetFixedAssetByID(id, companyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	hasAccess := false
	for _, bID := range branchAccess {
		if bID == asset.BranchID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Access denied to the specified branch"})
		return
	}

	if err := service.DeleteFixedAsset(id, companyID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Fixed asset deleted successfully",
	})
}
