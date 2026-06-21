package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ChartOfAccountHandler struct {
	logger *zap.Logger
}

func NewChartOfAccountHandler(logger *zap.Logger) *ChartOfAccountHandler {
	return &ChartOfAccountHandler{logger: logger}
}

func (h *ChartOfAccountHandler) getService(c *gin.Context) (*financeServices.ChartOfAccountService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewChartOfAccountRepository(db)
	classRepo := repositories.NewAccountClassificationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewChartOfAccountService(repo, classRepo, auditService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *ChartOfAccountHandler) List(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	filters := make(map[string]interface{})
	if classID := c.Query("account_classification_id"); classID != "" {
		filters["account_classification_id"] = classID
	}
	if accType := c.Query("account_type"); accType != "" {
		filters["account_type"] = accType
	}
	if normBal := c.Query("normal_balance"); normBal != "" {
		filters["normal_balance"] = normBal
	}
	if isControl := c.Query("is_control_account"); isControl != "" {
		filters["is_control_account"] = isControl == "true"
	}
	if isBank := c.Query("is_bank_account"); isBank != "" {
		filters["is_bank_account"] = isBank == "true"
	}
	if isCash := c.Query("is_cash_account"); isCash != "" {
		filters["is_cash_account"] = isCash == "true"
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	accounts, total, err := service.List(companyID, filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch accounts"})
		return
	}

	var response []dto.ChartOfAccountResponse
	for _, coa := range accounts {
		resp := dto.ChartOfAccountResponse{
			ID:                      coa.ID,
			CompanyID:               coa.CompanyID,
			BranchID:                coa.BranchID,
			AccountCode:             coa.AccountCode,
			AccountName:             coa.AccountName,
			AccountClassificationID: coa.AccountClassificationID,
			ParentAccountID:         coa.ParentAccountID,
			AccountLevel:            coa.AccountLevel,
			AccountType:             coa.AccountType,
			NormalBalance:           coa.NormalBalance,
			IsControlAccount:        coa.IsControlAccount,
			IsBankAccount:           coa.IsBankAccount,
			IsCashAccount:           coa.IsCashAccount,
			OpeningBalance:          coa.OpeningBalance,
			CurrentBalance:          coa.CurrentBalance,
			Status:                  coa.Status,
			CreatedAt:               coa.CreatedAt,
		}
		if coa.AccountClassification.ID > 0 {
			resp.Classification = &dto.AccountClassificationResponse{
				ID:            coa.AccountClassification.ID,
				Type:          coa.AccountClassification.Type,
				Name:          coa.AccountClassification.Name,
				Level:         coa.AccountClassification.Level,
				NormalBalance: coa.AccountClassification.NormalBalance,
			}
		}
		response = append(response, resp)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Accounts loaded successfully",
		"data":    response,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *ChartOfAccountHandler) Get(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	coa, err := service.GetByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Account not found"})
		return
	}

	response := dto.ChartOfAccountResponse{
		ID:                      coa.ID,
		CompanyID:               coa.CompanyID,
		BranchID:                coa.BranchID,
		AccountCode:             coa.AccountCode,
		AccountName:             coa.AccountName,
		AccountClassificationID: coa.AccountClassificationID,
		ParentAccountID:         coa.ParentAccountID,
		AccountLevel:            coa.AccountLevel,
		AccountType:             coa.AccountType,
		NormalBalance:           coa.NormalBalance,
		IsControlAccount:        coa.IsControlAccount,
		IsBankAccount:           coa.IsBankAccount,
		IsCashAccount:           coa.IsCashAccount,
		OpeningBalance:          coa.OpeningBalance,
		CurrentBalance:          coa.CurrentBalance,
		Status:                  coa.Status,
		CreatedAt:               coa.CreatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}

func (h *ChartOfAccountHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateChartOfAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	coa, err := service.Create(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Account created successfully", "data": gin.H{"id": coa.ID}})
}

func (h *ChartOfAccountHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateChartOfAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	_, err = service.Update(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account updated successfully"})
}

func (h *ChartOfAccountHandler) Delete(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.Delete(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account deleted successfully"})
}
