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

type BankTransactionHandler struct {
	logger *zap.Logger
}

func NewBankTransactionHandler(logger *zap.Logger) *BankTransactionHandler {
	return &BankTransactionHandler{logger: logger}
}

func (h *BankTransactionHandler) getService(c *gin.Context) (*financeServices.BankTransactionService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	transRepo := repositories.NewBankTransactionRepository(db)
	bankRepo := repositories.NewBankAccountRepository(db)
	auditSvc := financeServices.NewAuditLogService(db, h.logger)
	service := financeServices.NewBankTransactionService(transRepo, bankRepo, auditSvc)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *BankTransactionHandler) ListBankTransactions(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filters := map[string]interface{}{}
	if b := c.Query("bank_account_id"); b != "" {
		filters["bank_account_id"] = b
	}
	if t := c.Query("transaction_type"); t != "" {
		filters["transaction_type"] = t
	}
	if r := c.Query("is_reconciled"); r != "" {
		filters["is_reconciled"] = r == "true"
	}
	if df := c.Query("transaction_date_from"); df != "" {
		filters["transaction_date_from"] = df
	}
	if dt := c.Query("transaction_date_to"); dt != "" {
		filters["transaction_date_to"] = dt
	}
	if q := c.Query("search"); q != "" {
		filters["search"] = q
	}

	transactions, total, err := service.ListBankTransactions(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list bank transactions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load bank transactions"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Bank transactions loaded successfully",
		"data":    transactions,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *BankTransactionHandler) GetBankTransactionByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	transaction, err := service.GetBankTransactionByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Bank transaction not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank transaction loaded successfully", "data": transaction})
}

func (h *BankTransactionHandler) CreateManualBankTransaction(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateBankTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	transaction, err := service.CreateManualBankTransaction(companyID, userID, req)
	if err != nil {
		h.logger.Error("Failed to create manual bank transaction", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Bank transaction created successfully", "data": transaction})
}

func (h *BankTransactionHandler) UpdateManualBankTransaction(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateBankTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	transaction, err := service.UpdateManualBankTransaction(companyID, userID, id, req)
	if err != nil {
		h.logger.Error("Failed to update manual bank transaction", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank transaction updated successfully", "data": transaction})
}

func (h *BankTransactionHandler) DeleteManualBankTransaction(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.DeleteManualBankTransaction(companyID, userID, id); err != nil {
		h.logger.Error("Failed to delete manual bank transaction", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank transaction deleted successfully"})
}
