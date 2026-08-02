package handlers

import (
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	controlRepositories "github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CashAccountHandler struct {
	logger *zap.Logger
}

func NewCashAccountHandler(logger *zap.Logger) *CashAccountHandler {
	return &CashAccountHandler{logger: logger}
}

func (h *CashAccountHandler) getService(c *gin.Context) (*financeServices.CashAccountService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	cashRepo := repositories.NewCashAccountRepository(db)
	chartRepo := repositories.NewChartOfAccountRepository(db)
	branchRepo := controlRepositories.NewBranchRepository(db)
	userRepo := controlRepositories.NewUserRepository(db)
	auditLogService := financeServices.NewAuditLogService(db, h.logger)

	service := financeServices.NewCashAccountService(cashRepo, chartRepo, branchRepo, userRepo, auditLogService)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *CashAccountHandler) ListCashAccounts(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := map[string]interface{}{}
	if b := c.Query("branch_id"); b != "" {
		filters["branch_id"] = b
	}
	if s := c.Query("status"); s != "" {
		filters["status"] = s
	}
	if q := c.Query("search"); q != "" {
		filters["search"] = q
	}

	accounts, total, err := service.ListCashAccounts(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list cash accounts", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load cash accounts"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Cash accounts loaded successfully",
		"data":    accounts,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *CashAccountHandler) GetCashAccountByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	account, err := service.GetCashAccountByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Cash account not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cash account loaded successfully", "data": account})
}

func (h *CashAccountHandler) CreateCashAccount(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateCashAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	account, err := service.CreateCashAccount(companyID, userID, req)
	if err != nil {
		h.logger.Error("Failed to create cash account", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Cash account created successfully", "data": account})
}

func (h *CashAccountHandler) UpdateCashAccount(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateCashAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	account, err := service.UpdateCashAccount(companyID, userID, id, req)
	if err != nil {
		h.logger.Error("Failed to update cash account", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cash account updated successfully", "data": account})
}

func (h *CashAccountHandler) DeactivateCashAccount(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	account, err := service.DeactivateCashAccount(companyID, userID, id)
	if err != nil {
		h.logger.Error("Failed to deactivate cash account", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cash account deactivated successfully", "data": account})
}
