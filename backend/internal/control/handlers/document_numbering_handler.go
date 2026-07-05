package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DocumentNumberingHandler struct {
	logger *zap.Logger
}

func NewDocumentNumberingHandler(logger *zap.Logger) *DocumentNumberingHandler {
	return &DocumentNumberingHandler{logger: logger}
}

func (h *DocumentNumberingHandler) ListRules(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	module := c.Query("module")
	status := c.Query("status")

	repo := repositories.NewDocumentNumberingRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDocumentNumberService(repo, auditService, h.logger)

	rules, err := service.ListRules(authCtx.CompanyID, module, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Document numbering rules retrieved", rules))
}

func (h *DocumentNumberingHandler) SaveRule(c *gin.Context) {
	var rule models.DocumentNumberingRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	rule.CompanyID = authCtx.CompanyID
	if rule.Status == "" {
		rule.Status = "draft"
	}

	repo := repositories.NewDocumentNumberingRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDocumentNumberService(repo, auditService, h.logger)

	saved, err := service.SaveRule(&rule, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save rule: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Rule saved successfully", saved))
}

func (h *DocumentNumberingHandler) PublishRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid rule ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewDocumentNumberingRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDocumentNumberService(repo, auditService, h.logger)

	rule, err := repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("Rule not found", nil))
		return
	}

	rule.Status = "published"
	rule.VersionNumber++
	saved, err := service.SaveRule(rule, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to publish rule: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Rule published successfully", saved))
}

func (h *DocumentNumberingHandler) DeleteRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid rule ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewDocumentNumberingRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDocumentNumberService(repo, auditService, h.logger)

	err = service.DeleteRule(id, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to delete rule: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Rule deleted successfully", nil))
}

func (h *DocumentNumberingHandler) PreviewNumber(c *gin.Context) {
	var rule models.DocumentNumberingRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewDocumentNumberingRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDocumentNumberService(repo, auditService, h.logger)

	preview := service.PreviewDocumentNumber(rule, time.Now())
	c.JSON(http.StatusOK, dto.SuccessResponse("Preview generated", map[string]string{"preview_number": preview}))
}
