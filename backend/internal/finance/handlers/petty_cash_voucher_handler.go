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

type PettyCashVoucherHandler struct {
	logger *zap.Logger
}

func NewPettyCashVoucherHandler(logger *zap.Logger) *PettyCashVoucherHandler {
	return &PettyCashVoucherHandler{logger: logger}
}

func (h *PettyCashVoucherHandler) getService(c *gin.Context) (*financeServices.PettyCashVoucherService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	voucherRepo := repositories.NewPettyCashVoucherRepository(db)
	fundRepo := repositories.NewPettyCashFundRepository(db)
	chartRepo := repositories.NewChartOfAccountRepository(db)
	accountingRepo := repositories.NewAccountingPeriodRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)

	glRepo := repositories.NewGeneralLedgerRepository(db)
	fyRepo := repositories.NewFinancialYearRepository(db)
	glService := financeServices.NewGeneralLedgerService(glRepo, chartRepo, fyRepo, financeAudit, h.logger)

	service := financeServices.NewPettyCashVoucherService(voucherRepo, fundRepo, chartRepo, accountingRepo, financeAudit, glService)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *PettyCashVoucherHandler) ListPettyCashVouchers(c *gin.Context) {
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

	vType := c.Query("voucher_type")
	appStatus := c.Query("approval_status")
	postStatus := c.Query("posted_status")
	dateFrom := c.Query("voucher_date_from")
	dateTo := c.Query("voucher_date_to")
	search := c.Query("search")

	vouchers, total, err := service.ListPettyCashVouchers(companyID, fundID, fyID, apID, vType, appStatus, postStatus, dateFrom, dateTo, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash vouchers loaded successfully",
		"data":    vouchers,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *PettyCashVoucherHandler) GetPettyCashVoucherByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	voucher, err := service.GetPettyCashVoucherByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "petty cash voucher not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": voucher})
}

func (h *PettyCashVoucherHandler) CreatePettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreatePettyCashVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	voucher, err := service.CreatePettyCashVoucher(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Petty cash voucher created successfully",
		"data":    voucher,
	})
}

func (h *PettyCashVoucherHandler) UpdatePettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	var req dto.UpdatePettyCashVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	voucher, err := service.UpdatePettyCashVoucher(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash voucher updated successfully",
		"data":    voucher,
	})
}

func (h *PettyCashVoucherHandler) DeletePettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	if err := service.DeletePettyCashVoucher(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash voucher deleted successfully",
	})
}

func (h *PettyCashVoucherHandler) SubmitPettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	var req dto.ActionPettyCashVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.SubmitPettyCashVoucher(companyID, id, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash voucher submitted successfully"})
}

func (h *PettyCashVoucherHandler) ApprovePettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	var req dto.ActionPettyCashVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.ApprovePettyCashVoucher(companyID, id, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash voucher approved successfully"})
}

func (h *PettyCashVoucherHandler) RejectPettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	var req dto.ActionPettyCashVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := service.RejectPettyCashVoucher(companyID, id, userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash voucher rejected successfully"})
}

func (h *PettyCashVoucherHandler) PostPettyCashVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid voucher id"})
		return
	}

	if err := service.PostPettyCashVoucher(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Petty cash voucher posted successfully"})
}
