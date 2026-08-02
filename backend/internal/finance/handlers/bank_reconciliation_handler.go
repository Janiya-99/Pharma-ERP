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

type BankReconciliationHandler struct {
	logger *zap.Logger
}

func NewBankReconciliationHandler(logger *zap.Logger) *BankReconciliationHandler {
	return &BankReconciliationHandler{logger: logger}
}

func (h *BankReconciliationHandler) getService(c *gin.Context) (*financeServices.BankReconciliationService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	reconRepo := repositories.NewBankReconciliationRepository(db)
	transRepo := repositories.NewBankTransactionRepository(db)
	bankRepo := repositories.NewBankAccountRepository(db)
	auditSvc := financeServices.NewAuditLogService(db, h.logger)
	service := financeServices.NewBankReconciliationService(reconRepo, transRepo, bankRepo, auditSvc)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *BankReconciliationHandler) ListBankReconciliations(c *gin.Context) {
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
	if s := c.Query("reconciliation_status"); s != "" {
		filters["reconciliation_status"] = s
	}
	if df := c.Query("statement_date_from"); df != "" {
		filters["statement_date_from"] = df
	}
	if dt := c.Query("statement_date_to"); dt != "" {
		filters["statement_date_to"] = dt
	}
	if q := c.Query("search"); q != "" {
		filters["search"] = q
	}

	reconciliations, total, err := service.ListBankReconciliations(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list bank reconciliations", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load bank reconciliations"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Bank reconciliations loaded successfully",
		"data":    reconciliations,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *BankReconciliationHandler) GetBankReconciliationByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	reconciliation, err := service.GetBankReconciliationByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Bank reconciliation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank reconciliation loaded successfully", "data": reconciliation})
}

func (h *BankReconciliationHandler) GetUnreconciledTransactions(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	filters := map[string]interface{}{}
	if t := c.Query("transaction_type"); t != "" {
		filters["transaction_type"] = t
	}
	if df := c.Query("date_from"); df != "" {
		filters["date_from"] = df
	}
	if dt := c.Query("date_to"); dt != "" {
		filters["date_to"] = dt
	}
	if q := c.Query("search"); q != "" {
		filters["search"] = q
	}

	transactions, err := service.GetUnreconciledTransactions(companyID, id, filters)
	if err != nil {
		h.logger.Error("Failed to list unreconciled transactions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load unreconciled transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Unreconciled transactions loaded successfully", "data": transactions})
}

func (h *BankReconciliationHandler) CreateBankReconciliation(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateBankReconciliationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	reconciliation, err := service.CreateBankReconciliation(companyID, userID, req)
	if err != nil {
		h.logger.Error("Failed to create bank reconciliation", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Bank reconciliation created successfully", "data": reconciliation})
}

func (h *BankReconciliationHandler) UpdateBankReconciliation(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateBankReconciliationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	reconciliation, err := service.UpdateBankReconciliation(companyID, userID, id, req)
	if err != nil {
		h.logger.Error("Failed to update bank reconciliation", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank reconciliation updated successfully", "data": reconciliation})
}

func (h *BankReconciliationHandler) CompleteBankReconciliation(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.CompleteBankReconciliation(companyID, userID, id); err != nil {
		h.logger.Error("Failed to complete bank reconciliation", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank reconciliation completed successfully"})
}

func (h *BankReconciliationHandler) CancelBankReconciliation(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.CancelBankReconciliationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	if err := service.CancelBankReconciliation(companyID, userID, id, req); err != nil {
		h.logger.Error("Failed to cancel bank reconciliation", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank reconciliation cancelled successfully"})
}

func (h *BankReconciliationHandler) DeleteBankReconciliation(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.DeleteBankReconciliation(companyID, userID, id); err != nil {
		h.logger.Error("Failed to delete bank reconciliation", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Bank reconciliation deleted successfully"})
}
