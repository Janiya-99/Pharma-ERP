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

type GeneralLedgerHandler struct {
	logger *zap.Logger
}

func NewGeneralLedgerHandler(logger *zap.Logger) *GeneralLedgerHandler {
	return &GeneralLedgerHandler{logger: logger}
}

func (h *GeneralLedgerHandler) getService(c *gin.Context) (*financeServices.GeneralLedgerService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	glRepo := repositories.NewGeneralLedgerRepository(db)
	coaRepo := repositories.NewChartOfAccountRepository(db)
	fyRepo := repositories.NewFinancialYearRepository(db)
	financeAudit := financeServices.NewAuditLogService(db, h.logger)

	service := financeServices.NewGeneralLedgerService(glRepo, coaRepo, fyRepo, financeAudit, h.logger)
	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *GeneralLedgerHandler) ListEntries(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.GetLedgerEntriesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid filter parameters", err.Error()))
		return
	}

	entries, total, err := service.ListEntries(companyID, req)
	if err != nil {
		h.logger.Error("Failed to list general ledger entries", zap.Error(err))
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to load general ledger entries", err.Error()))
		return
	}

	pagination := &control_dto.Pagination{
		Page:       req.Page,
		Limit:      req.Limit,
		Total:      total,
		TotalPages: int((total + int64(req.Limit) - 1) / int64(req.Limit)),
	}

	c.JSON(http.StatusOK, control_dto.PaginatedResponse("General ledger entries loaded successfully", entries, pagination))
}

func (h *GeneralLedgerHandler) RebuildLedger(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, control_dto.ErrorResponse("Auth context missing", nil))
		return
	}

	var req dto.RebuildLedgerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, control_dto.ErrorResponse("Invalid request", err.Error()))
		return
	}

	err = service.RebuildLedger(companyID, req.FinancialYearID, userID)
	if err != nil {
		h.logger.Error("Failed to rebuild general ledger", zap.Error(err))
		c.JSON(http.StatusInternalServerError, control_dto.ErrorResponse("Failed to rebuild general ledger", err.Error()))
		return
	}

	c.JSON(http.StatusOK, control_dto.SuccessResponse("General ledger rebuilt successfully", nil))
}
