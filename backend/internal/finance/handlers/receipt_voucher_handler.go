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

type ReceiptVoucherHandler struct {
	logger *zap.Logger
}

func NewReceiptVoucherHandler(logger *zap.Logger) *ReceiptVoucherHandler {
	return &ReceiptVoucherHandler{logger: logger}
}

func (h *ReceiptVoucherHandler) getService(c *gin.Context) (financeServices.ReceiptVoucherService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	paymentRepo := repositories.NewPaymentVoucherRepository(db)
	repo := repositories.NewReceiptVoucherRepository(db, paymentRepo)
	fyRepo := repositories.NewFinancialYearRepository(db)
	apRepo := repositories.NewAccountingPeriodRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)

	bankRepo := repositories.NewBankAccountRepository(db)
	transRepo := repositories.NewBankTransactionRepository(db)
	bankTxSvc := financeServices.NewBankTransactionService(transRepo, bankRepo, financeServices.NewAuditLogService(db, h.logger))

	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewReceiptVoucherService(repo, fyRepo, apRepo, coaRepo, bankTxSvc, auditService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *ReceiptVoucherHandler) ListReceiptVouchers(c *gin.Context) {
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
	if rt := c.Query("receipt_type"); rt != "" {
		filter["receipt_type"] = rt
	}
	if rm := c.Query("receipt_method"); rm != "" {
		filter["receipt_method"] = rm
	}
	if as := c.Query("approval_status"); as != "" {
		filter["approval_status"] = as
	}
	if ps := c.Query("posted_status"); ps != "" {
		filter["posted_status"] = ps
	}
	if df := c.Query("receipt_date_from"); df != "" {
		filter["receipt_date_from"] = df
	}
	if dt := c.Query("receipt_date_to"); dt != "" {
		filter["receipt_date_to"] = dt
	}
	if search := c.Query("search"); search != "" {
		filter["search"] = search
	}

	vouchers, total, err := service.ListReceiptVouchers(companyID, filter, page, limit)
	if err != nil {
		h.logger.Error("Failed to list receipt vouchers", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load receipt vouchers"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Receipt vouchers loaded successfully",
		"data":    vouchers,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *ReceiptVoucherHandler) GetReceiptVoucherByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	voucher, err := service.GetReceiptVoucherByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Receipt voucher not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher loaded successfully", "data": voucher})
}

func (h *ReceiptVoucherHandler) CreateReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateReceiptVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	voucher, err := service.CreateReceiptVoucher(companyID, req.BranchID, userID, req, ip, userAgent)
	if err != nil {
		h.logger.Error("Failed to create receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Receipt voucher created successfully", "data": voucher})
}

func (h *ReceiptVoucherHandler) UpdateReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateReceiptVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	voucher, err := service.UpdateReceiptVoucher(companyID, req.BranchID, id, userID, req, ip, userAgent)
	if err != nil {
		h.logger.Error("Failed to update receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher updated successfully", "data": voucher})
}

func (h *ReceiptVoucherHandler) DeleteReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.DeleteReceiptVoucher(companyID, id, userID, ip, userAgent); err != nil {
		h.logger.Error("Failed to delete receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher deleted successfully"})
}

func (h *ReceiptVoucherHandler) SubmitReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.ReceiptActionRequest
	c.ShouldBindJSON(&req)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.SubmitReceiptVoucher(companyID, id, userID, req, ip, userAgent); err != nil {
		h.logger.Error("Failed to submit receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher submitted successfully"})
}

func (h *ReceiptVoucherHandler) ApproveReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.ReceiptActionRequest
	c.ShouldBindJSON(&req)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.ApproveReceiptVoucher(companyID, id, userID, req, ip, userAgent); err != nil {
		h.logger.Error("Failed to approve receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher approved successfully"})
}

func (h *ReceiptVoucherHandler) RejectReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.ReceiptActionRequest
	c.ShouldBindJSON(&req)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.RejectReceiptVoucher(companyID, id, userID, req, ip, userAgent); err != nil {
		h.logger.Error("Failed to reject receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher rejected successfully"})
}

func (h *ReceiptVoucherHandler) PostReceiptVoucher(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := service.PostReceiptVoucher(companyID, id, userID, ip, userAgent); err != nil {
		h.logger.Error("Failed to post receipt voucher", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Receipt voucher posted successfully"})
}
