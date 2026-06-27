package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type LogHandler struct {
	logger *zap.Logger
}

func NewLogHandler(logger *zap.Logger) *LogHandler {
	return &LogHandler{logger: logger}
}

func (h *LogHandler) getRepository(c *gin.Context) *repositories.LogRepository {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	return repositories.NewLogRepository(db)
}

func (h *LogHandler) ListLoginLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	logs, pagination, err := h.getRepository(c).ListLoginLogs(dto.LoginLogFilter{
		Search:   c.Query("search"),
		DateFrom: c.Query("date_from"),
		DateTo:   c.Query("date_to"),
		UserID:   c.Query("user_id"),
		Email:    c.Query("email"),
		Status:   c.Query("status"),
		Page:     page,
		Limit:    limit,
	})
	if err != nil {
		h.logger.Error("failed to list login logs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to load login logs", nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Login logs loaded successfully", logs, pagination))
}

func (h *LogHandler) ListAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	logs, pagination, err := h.getRepository(c).ListAuditLogs(dto.AuditLogFilter{
		Search:     c.Query("search"),
		DateFrom:   c.Query("date_from"),
		DateTo:     c.Query("date_to"),
		UserID:     c.Query("user_id"),
		BranchID:   c.Query("branch_id"),
		SoftwareID: c.Query("software_id"),
		Action:     c.Query("action"),
		EntityName: c.Query("entity_name"),
		Page:       page,
		Limit:      limit,
	})
	if err != nil {
		h.logger.Error("failed to list audit logs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to load audit logs", nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Audit logs loaded successfully", logs, pagination))
}
