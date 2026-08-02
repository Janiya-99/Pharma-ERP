package handlers

import (
	"math"
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

type PaymentVoucherHandler struct {
	logger *zap.Logger
}

func NewPaymentVoucherHandler(logger *zap.Logger) *PaymentVoucherHandler {
	return &PaymentVoucherHandler{logger: logger}
}

func (h *PaymentVoucherHandler) getService(c *gin.Context) (financeServices.PaymentVoucherService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	paymentRepo := repositories.NewPaymentVoucherRepository(db)
	fyRepo := repositories.NewFinancialYearRepository(db)
	apRepo := repositories.NewAccountingPeriodRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)

	bankRepo := repositories.NewBankAccountRepository(db)
	transRepo := repositories.NewBankTransactionRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)
	bankTxSvc := financeServices.NewBankTransactionService(transRepo, bankRepo, financeAudit)

	glRepo := repositories.NewGeneralLedgerRepository(db)
	glService := financeServices.NewGeneralLedgerService(glRepo, coaRepo, fyRepo, financeAudit, h.logger)

	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewPaymentVoucherService(paymentRepo, fyRepo, apRepo, coaRepo, bankTxSvc, auditService, glService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *PaymentVoucherHandler) ListPaymentVouchers(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	filter := map[string]interface{}{}
	if fy := c.Query("financial_year_id"); fy != "" {
		filter["financial_year_id"] = fy
	}
	if ap := c.Query("accounting_period_id"); ap != "" {
		filter["accounting_period_id"] = ap
	}
	if pt := c.Query("payment_type"); pt != "" {
		filter["payment_type"] = pt
	}
	if pm := c.Query("payment_method"); pm != "" {
		filter["payment_method"] = pm
	}
	if as := c.Query("approval_status"); as != "" {
		filter["approval_status"] = as
	}
	if ps := c.Query("posted_status"); ps != "" {
		filter["posted_status"] = ps
	}
	if df := c.Query("payment_date_from"); df != "" {
		filter["payment_date_from"] = df
	}
	if dt := c.Query("payment_date_to"); dt != "" {
		filter["payment_date_to"] = dt
	}
	if search := c.Query("search"); search != "" {
		filter["search"] = search
	}

	vouchers, total, err := service.ListPaymentVouchers(companyID, filter, page, limit)
	if err != nil {
		h.logger.Error("Failed to list payment vouchers", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load payment vouchers"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment vouchers loaded successfully",
		"data":    vouchers,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *PaymentVoucherHandler) GetPaymentVoucherByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	voucher, err := service.GetPaymentVoucherByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Payment voucher not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher loaded successfully", "data": voucher})
}

func (h *PaymentVoucherHandler) CreatePaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreatePaymentVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	voucher, err := service.CreatePaymentVoucher(companyID, req.BranchID, userID, req, ip, userAgent)
	if err != nil {
		h.logger.Error("Failed to create payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Payment voucher created successfully", "data": voucher})
}

func (h *PaymentVoucherHandler) UpdatePaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdatePaymentVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	voucher, err := service.UpdatePaymentVoucher(companyID, req.BranchID, id, userID, req, ip, userAgent)
	if err != nil {
		h.logger.Error("Failed to update payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher updated successfully", "data": voucher})
}

func (h *PaymentVoucherHandler) DeletePaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.DeletePaymentVoucher(companyID, id, userID, ip, userAgent); err != nil {
		h.logger.Error("Failed to delete payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher deleted successfully"})
}

func (h *PaymentVoucherHandler) SubmitPaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.PaymentActionRequest
	c.ShouldBindJSON(&req)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.SubmitPaymentVoucher(companyID, id, userID, req, ip, userAgent); err != nil {
		h.logger.Error("Failed to submit payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher submitted successfully"})
}

func (h *PaymentVoucherHandler) ApprovePaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.PaymentActionRequest
	c.ShouldBindJSON(&req)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.ApprovePaymentVoucher(companyID, id, userID, req, ip, userAgent); err != nil {
		h.logger.Error("Failed to approve payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher approved successfully"})
}

func (h *PaymentVoucherHandler) RejectPaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.PaymentActionRequest
	c.ShouldBindJSON(&req)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.RejectPaymentVoucher(companyID, id, userID, req, ip, userAgent); err != nil {
		h.logger.Error("Failed to reject payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher rejected successfully"})
}

func (h *PaymentVoucherHandler) PostPaymentVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.PostPaymentVoucher(companyID, id, userID, ip, userAgent); err != nil {
		h.logger.Error("Failed to post payment voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Payment voucher posted successfully"})
}
