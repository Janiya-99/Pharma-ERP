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

type OpeningBalanceHandler struct {
	logger *zap.Logger
}

func NewOpeningBalanceHandler(logger *zap.Logger) *OpeningBalanceHandler {
	return &OpeningBalanceHandler{logger: logger}
}

func (h *OpeningBalanceHandler) getService(c *gin.Context) (*financeServices.OpeningBalanceService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewOpeningBalanceRepository(db)
	fyRepo := repositories.NewFinancialYearRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)

	glRepo := repositories.NewGeneralLedgerRepository(db)
	glService := financeServices.NewGeneralLedgerService(glRepo, coaRepo, fyRepo, financeAudit, h.logger)

	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewOpeningBalanceService(repo, fyRepo, coaRepo, glService, auditService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *OpeningBalanceHandler) List(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	filters := make(map[string]interface{})
	if fyID := c.Query("financial_year_id"); fyID != "" {
		filters["financial_year_id"] = fyID
	}
	if branchID := c.Query("branch_id"); branchID != "" {
		filters["branch_id"] = branchID
	}
	if accID := c.Query("account_id"); accID != "" {
		filters["account_id"] = accID
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	balances, total, err := service.List(companyID, filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch opening balances"})
		return
	}

	var response []dto.OpeningBalanceResponse
	for _, ob := range balances {
		resp := dto.OpeningBalanceResponse{
			ID:              ob.ID,
			CompanyID:       ob.CompanyID,
			BranchID:        ob.BranchID,
			FinancialYearID: ob.FinancialYearID,
			AccountID:       ob.AccountID,
			DebitAmount:     ob.DebitAmount,
			CreditAmount:    ob.CreditAmount,
			Remarks:         ob.Remarks,
			Status:          ob.Status,
			CreatedAt:       ob.CreatedAt,
		}
		if ob.FinancialYear.ID > 0 {
			resp.FinancialYear = &dto.FinancialYearResponse{
				ID:        ob.FinancialYear.ID,
				YearName:  ob.FinancialYear.YearName,
				StartDate: ob.FinancialYear.StartDate.Format("2006-01-02"),
				EndDate:   ob.FinancialYear.EndDate.Format("2006-01-02"),
				IsClosed:  ob.FinancialYear.IsClosed,
			}
		}
		if ob.ChartOfAccount.ID > 0 {
			resp.ChartOfAccount = &dto.ChartOfAccountResponse{
				ID:          ob.ChartOfAccount.ID,
				AccountCode: ob.ChartOfAccount.AccountCode,
				AccountName: ob.ChartOfAccount.AccountName,
			}
		}
		response = append(response, resp)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Opening balances loaded successfully",
		"data":    response,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *OpeningBalanceHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateOpeningBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	ob, err := service.Create(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Opening balance created successfully", "data": gin.H{"id": ob.ID}})
}

func (h *OpeningBalanceHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateOpeningBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	_, err = service.Update(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Opening balance updated successfully"})
}

func (h *OpeningBalanceHandler) Delete(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Opening balance deleted successfully"})
}
