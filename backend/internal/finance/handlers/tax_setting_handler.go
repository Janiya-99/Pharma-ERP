package handlers

import (
	"math"
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

type TaxSettingHandler struct {
	logger *zap.Logger
}

func NewTaxSettingHandler(logger *zap.Logger) *TaxSettingHandler {
	return &TaxSettingHandler{logger: logger}
}

func (h *TaxSettingHandler) getService(c *gin.Context) (*financeServices.TaxSettingService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewTaxSettingRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)
	auditSvc := financeServices.NewAuditLogService(db, h.logger)
	service := financeServices.NewTaxSettingService(repo, coaRepo, auditSvc)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *TaxSettingHandler) List(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	filters := map[string]interface{}{}
	if q := c.Query("search"); q != "" {
		filters["search"] = q
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	settings, total, err := service.List(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list tax settings", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load tax settings"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Tax settings loaded successfully", "data": settings, "pagination": gin.H{"page": page, "limit": limit, "total": total, "total_pages": totalPages}})
}

func (h *TaxSettingHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}
	var req dto.CreateTaxSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}
	setting, err := service.Create(companyID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Tax setting created successfully", "data": setting})
}

func (h *TaxSettingHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateTaxSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}
	setting, err := service.Update(companyID, userID, id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Tax setting updated successfully", "data": setting})
}

func (h *TaxSettingHandler) Deactivate(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	setting, err := service.Deactivate(companyID, userID, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Tax setting deactivated successfully", "data": setting})
}
