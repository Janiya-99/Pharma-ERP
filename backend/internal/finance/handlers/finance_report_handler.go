package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	control_dto "github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type FinanceReportHandler struct {
	logger *zap.Logger
}

func NewFinanceReportHandler(logger *zap.Logger) *FinanceReportHandler {
	return &FinanceReportHandler{logger: logger}
}

func (h *FinanceReportHandler) getService(c *gin.Context) (*financeServices.FinanceReportService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewFinanceReportRepository(db)
	glRepo := repositories.NewGeneralLedgerRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)

	service := financeServices.NewFinanceReportService(repo, glRepo, coaRepo, financeAudit, h.logger)
	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *FinanceReportHandler) AccountLedger(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.AccountLedgerReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetAccountLedgerReport(companyID, req)
	if err != nil {
		h.logger.Error("Failed to generate account ledger report", zap.Error(err))
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_ACCOUNT_LEDGER_VIEWED", "Account Ledger Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Account ledger loaded successfully", res))
}

func (h *FinanceReportHandler) TrialBalance(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.TrialBalanceReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetTrialBalanceReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_TRIAL_BALANCE_VIEWED", "Trial Balance Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Trial balance loaded successfully", res))
}

func (h *FinanceReportHandler) ProfitLoss(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.ProfitLossReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetProfitLossReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_PROFIT_LOSS_VIEWED", "Profit & Loss Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Profit and loss report loaded successfully", res))
}

func (h *FinanceReportHandler) BalanceSheet(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.BalanceSheetReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetBalanceSheetReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_BALANCE_SHEET_VIEWED", "Balance Sheet Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Balance sheet report loaded successfully", res))
}

func (h *FinanceReportHandler) CashBankBook(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.CashBankBookReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetCashBankBookReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_CASH_BANK_BOOK_VIEWED", "Cash/Bank Book Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Cash/Bank Book loaded successfully", res))
}

func (h *FinanceReportHandler) DayBook(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.DayBookReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetDayBookReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_DAY_BOOK_VIEWED", "Day Book Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Day Book loaded successfully", res))
}

func (h *FinanceReportHandler) JournalRegister(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.RegisterReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetJournalRegisterReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_JOURNAL_REGISTER_VIEWED", "Journal Register Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Journal Register loaded successfully", res))
}

func (h *FinanceReportHandler) PaymentRegister(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.RegisterReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetPaymentRegisterReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_PAYMENT_REGISTER_VIEWED", "Payment Register Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Payment Register loaded successfully", res))
}

func (h *FinanceReportHandler) ReceiptRegister(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.RegisterReportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	res, err := service.GetReceiptRegisterReport(companyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	service.AuditLog(companyID, userID, "FINANCE_REPORT_RECEIPT_REGISTER_VIEWED", "Receipt Register Viewed")
	c.JSON(http.StatusOK, control_dto.SuccessResponse("Receipt Register loaded successfully", res))
}
