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

type AccountingPeriodHandler struct {
	logger *zap.Logger
}

func NewAccountingPeriodHandler(logger *zap.Logger) *AccountingPeriodHandler {
	return &AccountingPeriodHandler{logger: logger}
}

func (h *AccountingPeriodHandler) getService(c *gin.Context) (*financeServices.AccountingPeriodService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	apRepo := repositories.NewAccountingPeriodRepository(db)
	fyRepo := repositories.NewFinancialYearRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewAccountingPeriodService(apRepo, fyRepo, auditService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *AccountingPeriodHandler) List(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	financialYearID, _ := strconv.ParseUint(c.Query("financial_year_id"), 10, 64)
	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	periods, total, err := service.List(companyID, financialYearID, status, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch accounting periods"})
		return
	}

	var response []dto.AccountingPeriodResponse
	for _, ap := range periods {
		resp := dto.AccountingPeriodResponse{
			ID:              ap.ID,
			CompanyID:       ap.CompanyID,
			FinancialYearID: ap.FinancialYearID,
			PeriodName:      ap.PeriodName,
			StartDate:       ap.StartDate.Format("2006-01-02"),
			EndDate:         ap.EndDate.Format("2006-01-02"),
			IsClosed:        ap.IsClosed,
			Status:          ap.Status,
			CreatedAt:       ap.CreatedAt,
		}
		if ap.FinancialYear.ID > 0 {
			resp.FinancialYear = &dto.FinancialYearResponse{
				ID:        ap.FinancialYear.ID,
				YearName:  ap.FinancialYear.YearName,
				StartDate: ap.FinancialYear.StartDate.Format("2006-01-02"),
				EndDate:   ap.FinancialYear.EndDate.Format("2006-01-02"),
				IsActive:  ap.FinancialYear.IsActive,
				IsClosed:  ap.FinancialYear.IsClosed,
			}
		}
		response = append(response, resp)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Accounting periods loaded successfully",
		"data":    response,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *AccountingPeriodHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateAccountingPeriodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	ap, err := service.Create(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Accounting period created successfully", "data": gin.H{"id": ap.ID}})
}

func (h *AccountingPeriodHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateAccountingPeriodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	_, err = service.Update(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Accounting period updated successfully"})
}

func (h *AccountingPeriodHandler) Close(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.Close(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Accounting period closed successfully"})
}
