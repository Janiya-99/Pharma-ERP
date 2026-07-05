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

type SecuritySettingsHandler struct {
	logger *zap.Logger
}

func NewSecuritySettingsHandler(logger *zap.Logger) *SecuritySettingsHandler {
	return &SecuritySettingsHandler{logger: logger}
}

func (h *SecuritySettingsHandler) GetPolicy(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	var branchID *uint64
	if bStr := c.Query("branch_id"); bStr != "" {
		if bid, err := strconv.ParseUint(bStr, 10, 64); err == nil && bid != 0 {
			branchID = &bid
		}
	}

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	pol, err := service.GetSecurityPolicy(authCtx.CompanyID, branchID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("Security policy not found", nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Security policy fetched", pol))
}

func (h *SecuritySettingsHandler) SavePolicy(c *gin.Context) {
	var pol models.SecurityPolicy
	if err := c.ShouldBindJSON(&pol); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	pol.CompanyID = authCtx.CompanyID
	if pol.Status == "" {
		pol.Status = "draft"
	}

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	saved, err := service.SaveSecurityPolicy(&pol, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save security policy: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Security policy saved", saved))
}

func (h *SecuritySettingsHandler) PublishPolicy(c *gin.Context) {
	var pol models.SecurityPolicy
	if err := c.ShouldBindJSON(&pol); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	pol.CompanyID = authCtx.CompanyID
	pol.Status = "published"
	pol.VersionNumber++

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	saved, err := service.SaveSecurityPolicy(&pol, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to publish security policy: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Security policy published", saved))
}

func (h *SecuritySettingsHandler) ListTrustedIPRules(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	rules, err := service.ListTrustedIPRules(authCtx.CompanyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Trusted IP rules fetched", rules))
}

func (h *SecuritySettingsHandler) SaveTrustedIPRule(c *gin.Context) {
	var rule models.TrustedIPRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	rule.CompanyID = authCtx.CompanyID

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	saved, err := service.SaveTrustedIPRule(&rule, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save IP rule: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Trusted IP rule saved", saved))
}

func (h *SecuritySettingsHandler) DeleteTrustedIPRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid rule ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	err = service.DeleteTrustedIPRule(id, authCtx.CompanyID, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to delete IP rule: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Trusted IP rule deleted", nil))
}

func (h *SecuritySettingsHandler) ListBackupPolicies(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	policies, err := service.ListBackupPolicies(authCtx.CompanyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Backup policies fetched", policies))
}

func (h *SecuritySettingsHandler) SaveBackupPolicy(c *gin.Context) {
	var pol models.BackupPolicy
	if err := c.ShouldBindJSON(&pol); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	pol.CompanyID = authCtx.CompanyID

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	saved, err := service.SaveBackupPolicy(&pol, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save backup policy: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Backup policy saved", saved))
}

func (h *SecuritySettingsHandler) ListBackupLogs(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	limitStr := c.Query("limit")
	limit, _ := strconv.Atoi(limitStr)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	logs, err := service.ListBackupLogs(authCtx.CompanyID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Backup logs fetched", logs))
}

func (h *SecuritySettingsHandler) TriggerManualBackup(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	log, err := service.TriggerManualBackup(authCtx.CompanyID, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to trigger backup: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Manual backup triggered successfully", log))
}

func (h *SecuritySettingsHandler) ListActiveSessions(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	sessions, err := service.ListActiveSessions(authCtx.CompanyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	currentToken, _ := c.Get("tokenString")
	for i := range sessions {
		// Mark current session if needed
		if currentToken != nil && sessions[i]["user_id"] == authCtx.UserID {
			sessions[i]["is_current"] = true
		}
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Active sessions retrieved", sessions))
}

func (h *SecuritySettingsHandler) TerminateSession(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid session ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	err = service.TerminateSession(authCtx.CompanyID, id, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to terminate session: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Session terminated successfully", nil))
}

func (h *SecuritySettingsHandler) TerminateAllSessions(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSecuritySettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewSecurityPolicyService(repo, auditService, h.logger)

	err := service.TerminateAllSessions(authCtx.CompanyID, authCtx.UserID, authCtx.UserID, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to terminate all sessions: "+err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("All other sessions terminated successfully", nil))
}
