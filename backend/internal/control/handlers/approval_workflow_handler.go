package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ApprovalWorkflowHandler struct {
	logger *zap.Logger
}

func NewApprovalWorkflowHandler(logger *zap.Logger) *ApprovalWorkflowHandler {
	return &ApprovalWorkflowHandler{logger: logger}
}

func (h *ApprovalWorkflowHandler) ListWorkflows(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	module := c.Query("module")
	docType := c.Query("document_type")
	status := c.Query("status")

	repo := repositories.NewApprovalWorkflowRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	engine := services.NewApprovalWorkflowEngine(repo, auditService, h.logger)

	workflows, err := engine.ListWorkflows(authCtx.CompanyID, module, docType, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Workflows retrieved successfully", workflows))
}

func (h *ApprovalWorkflowHandler) GetWorkflow(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid workflow ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewApprovalWorkflowRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	engine := services.NewApprovalWorkflowEngine(repo, auditService, h.logger)

	wf, err := engine.GetWorkflow(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("Workflow not found", nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Workflow retrieved successfully", wf))
}

func (h *ApprovalWorkflowHandler) SaveWorkflow(c *gin.Context) {
	var wf models.ApprovalWorkflow
	if err := c.ShouldBindJSON(&wf); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	wf.CompanyID = authCtx.CompanyID
	if wf.Status == "" {
		wf.Status = "draft"
	}

	repo := repositories.NewApprovalWorkflowRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	engine := services.NewApprovalWorkflowEngine(repo, auditService, h.logger)

	saved, err := engine.SaveWorkflow(&wf, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save workflow: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Workflow saved successfully", saved))
}

func (h *ApprovalWorkflowHandler) PublishWorkflow(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid workflow ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewApprovalWorkflowRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	engine := services.NewApprovalWorkflowEngine(repo, auditService, h.logger)

	published, err := engine.PublishWorkflow(id, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to publish workflow: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Workflow published successfully", published))
}

func (h *ApprovalWorkflowHandler) DeleteWorkflow(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid workflow ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewApprovalWorkflowRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	engine := services.NewApprovalWorkflowEngine(repo, auditService, h.logger)

	err = engine.DeleteWorkflow(id, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to delete workflow: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Workflow deleted successfully", nil))
}

func (h *ApprovalWorkflowHandler) ListVersions(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid workflow ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewApprovalWorkflowRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	engine := services.NewApprovalWorkflowEngine(repo, auditService, h.logger)

	versions, err := engine.ListVersions(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Workflow versions retrieved", versions))
}
