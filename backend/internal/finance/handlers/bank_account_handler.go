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

type BankAccountHandler struct {
	logger *zap.Logger
}

func NewBankAccountHandler(logger *zap.Logger) *BankAccountHandler {
	return &BankAccountHandler{logger: logger}
}

func (h *BankAccountHandler) getService(c *gin.Context) (*financeServices.BankAccountService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	bankRepo := repositories.NewBankAccountRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)
	auditSvc := financeServices.NewAuditLogService(db, h.logger)
	service := financeServices.NewBankAccountService(bankRepo, coaRepo, auditSvc)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *BankAccountHandler) ListBankAccounts(c *gin.Context) {
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
	if d := c.Query("is_default"); d != "" {
		filters["is_default"] = d == "true"
	}
	if q := c.Query("search"); q != "" {
		filters["search"] = q
	}

	accounts, total, err := service.ListBankAccounts(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list bank accounts", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load bank accounts"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Bank accounts loaded successfully",
		"data":    accounts,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *BankAccountHandler) GetBankAccountByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	account, err := service.GetBankAccountByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Bank account not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank account loaded successfully", "data": account})
}

func (h *BankAccountHandler) CreateBankAccount(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateBankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	account, err := service.CreateBankAccount(companyID, userID, req)
	if err != nil {
		h.logger.Error("Failed to create bank account", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Bank account created successfully", "data": account})
}

func (h *BankAccountHandler) UpdateBankAccount(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateBankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	account, err := service.UpdateBankAccount(companyID, userID, id, req)
	if err != nil {
		h.logger.Error("Failed to update bank account", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank account updated successfully", "data": account})
}

func (h *BankAccountHandler) DeleteBankAccount(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.DeleteBankAccount(companyID, userID, id); err != nil {
		h.logger.Error("Failed to delete bank account", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank account deleted successfully"})
}
