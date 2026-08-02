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

type AccountGroupHandler struct {
	logger *zap.Logger
}

func NewAccountGroupHandler(logger *zap.Logger) *AccountGroupHandler {
	return &AccountGroupHandler{logger: logger}
}

func (h *AccountGroupHandler) getService(c *gin.Context) (*financeServices.AccountGroupService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewAccountGroupRepository(db)
	auditSvc := financeServices.NewAuditLogService(db, h.logger)
	service := financeServices.NewAccountGroupService(repo, auditSvc)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *AccountGroupHandler) List(c *gin.Context) {
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
	if accountType := c.Query("account_type"); accountType != "" {
		filters["account_type"] = accountType
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if parentID := c.Query("parent_group_id"); parentID != "" {
		filters["parent_group_id"] = parentID
	}

	groups, total, err := service.List(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list account groups", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load account groups"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Account groups loaded successfully",
		"data":    groups,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *AccountGroupHandler) Get(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	group, err := service.GetByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Account group not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account group loaded successfully", "data": group})
}

func (h *AccountGroupHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateAccountGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}

	group, err := service.Create(companyID, userID, req)
	if err != nil {
		h.logger.Error("Failed to create account group", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Account group created successfully", "data": group})
}

func (h *AccountGroupHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateAccountGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}

	group, err := service.Update(companyID, userID, id, req)
	if err != nil {
		h.logger.Error("Failed to update account group", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account group updated successfully", "data": group})
}

func (h *AccountGroupHandler) Deactivate(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	group, err := service.Deactivate(companyID, userID, id)
	if err != nil {
		h.logger.Error("Failed to deactivate account group", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account group deactivated successfully", "data": group})
}
