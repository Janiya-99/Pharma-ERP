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

type PettyCashReplenishmentHandler struct {
	logger *zap.Logger
}

func NewPettyCashReplenishmentHandler(logger *zap.Logger) *PettyCashReplenishmentHandler {
	return &PettyCashReplenishmentHandler{logger: logger}
}

func (h *PettyCashReplenishmentHandler) getService(c *gin.Context) (*financeServices.PettyCashReplenishmentService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	replRepo := repositories.NewPettyCashReplenishmentRepository(db)
	fundRepo := repositories.NewPettyCashFundRepository(db)
	chartRepo := repositories.NewChartOfAccountRepository(db)
	accountingRepo := repositories.NewAccountingPeriodRepository(db)
	auditLogService := financeServices.NewAuditLogService(db, h.logger)

	service := financeServices.NewPettyCashReplenishmentService(replRepo, fundRepo, chartRepo, accountingRepo, auditLogService)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *PettyCashReplenishmentHandler) ListPettyCashReplenishments(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	var fundID *uint64
	if idStr := c.Query("petty_cash_fund_id"); idStr != "" {
		if id, err := strconv.ParseUint(idStr, 10, 64); err == nil {
			fundID = &id
		}
	}

	var fyID *uint64
	if idStr := c.Query("financial_year_id"); idStr != "" {
		if id, err := strconv.ParseUint(idStr, 10, 64); err == nil {
			fyID = &id
		}
	}

	var apID *uint64
	if idStr := c.Query("accounting_period_id"); idStr != "" {
		if id, err := strconv.ParseUint(idStr, 10, 64); err == nil {
			apID = &id
		}
	}

	appStatus := c.Query("approval_status")
	postStatus := c.Query("posted_status")
	dateFrom := c.Query("replenishment_date_from")
	dateTo := c.Query("replenishment_date_to")
	search := c.Query("search")

	repls, total, err := service.ListPettyCashReplenishments(companyID, fundID, fyID, apID, appStatus, postStatus, dateFrom, dateTo, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash replenishments loaded successfully",
		"data":    repls,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *PettyCashReplenishmentHandler) GetPettyCashReplenishmentByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	repl, err := service.GetPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "petty cash replenishment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": repl})
}

func (h *PettyCashReplenishmentHandler) CreatePettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreatePettyCashReplenishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	repl, err := service.CreatePettyCashReplenishment(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Petty cash replenishment created successfully",
		"data":    repl,
	})
}

func (h *PettyCashReplenishmentHandler) UpdatePettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	var req dto.UpdatePettyCashReplenishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	repl, err := service.UpdatePettyCashReplenishment(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash replenishment updated successfully",
		"data":    repl,
	})
}

func (h *PettyCashReplenishmentHandler) DeletePettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	if err := service.DeletePettyCashReplenishment(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash replenishment deleted successfully",
	})
}

func (h *PettyCashReplenishmentHandler) SubmitPettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	var req dto.ActionPettyCashReplenishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.SubmitPettyCashReplenishment(companyID, id, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash replenishment submitted successfully"})
}

func (h *PettyCashReplenishmentHandler) ApprovePettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	var req dto.ActionPettyCashReplenishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.ApprovePettyCashReplenishment(companyID, id, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash replenishment approved successfully"})
}

func (h *PettyCashReplenishmentHandler) RejectPettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	var req dto.ActionPettyCashReplenishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.RejectPettyCashReplenishment(companyID, id, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash replenishment rejected successfully"})
}

func (h *PettyCashReplenishmentHandler) PostPettyCashReplenishment(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid replenishment id"})
		return
	}

	if err := service.PostPettyCashReplenishment(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash replenishment posted successfully"})
}
