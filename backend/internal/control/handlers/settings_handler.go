package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SettingsHandler struct {
	logger *zap.Logger
}

func NewSettingsHandler(logger *zap.Logger) *SettingsHandler {
	return &SettingsHandler{logger: logger}
}

func (h *SettingsHandler) ListGroups(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSettingsRepository(db)
	groups, err := repo.ListGroups(authCtx.CompanyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse("Groups fetched", groups))
}

func (h *SettingsHandler) ListSettings(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	groupCode := c.Query("group")
	var branchID *uint64
	if bStr := c.Query("branch_id"); bStr != "" {
		if bid, err := strconv.ParseUint(bStr, 10, 64); err == nil && bid != 0 {
			branchID = &bid
		}
	} else if authCtx.ActiveBranchID != 0 {
		branchID = &authCtx.ActiveBranchID
	}

	repo := repositories.NewSettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewConfigurationResolverService(repo, auditService, h.logger)

	settings, err := service.ListEffectiveSettings(authCtx.CompanyID, groupCode, branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Settings fetched successfully", settings))
}

type saveSettingRequest struct {
	SettingGroup string      `json:"setting_group" binding:"required"`
	SettingKey   string      `json:"setting_key" binding:"required"`
	SettingValue interface{} `json:"setting_value" binding:"required"`
	Status       string      `json:"status"` // draft or published
}

func (h *SettingsHandler) SaveSetting(c *gin.Context) {
	var req saveSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}
	if req.Status == "" {
		req.Status = "draft"
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewConfigurationResolverService(repo, auditService, h.logger)

	setting, err := service.SaveSetting(
		authCtx.CompanyID,
		req.SettingGroup,
		req.SettingKey,
		req.SettingValue,
		req.Status,
		authCtx.UserID,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save setting: "+err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Setting saved successfully", setting))
}

func (h *SettingsHandler) PublishSetting(c *gin.Context) {
	var req saveSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}
	req.Status = "published"

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewConfigurationResolverService(repo, auditService, h.logger)

	setting, err := service.SaveSetting(
		authCtx.CompanyID,
		req.SettingGroup,
		req.SettingKey,
		req.SettingValue,
		req.Status,
		authCtx.UserID,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to publish setting: "+err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Setting published successfully", setting))
}

type branchOverrideRequest struct {
	BranchID     uint64      `json:"branch_id" binding:"required"`
	SettingKey   string      `json:"setting_key" binding:"required"`
	SettingValue interface{} `json:"setting_value" binding:"required"`
}

func (h *SettingsHandler) SaveBranchOverride(c *gin.Context) {
	var req branchOverrideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request body: "+err.Error(), nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	repo := repositories.NewSettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewConfigurationResolverService(repo, auditService, h.logger)

	err := service.SaveBranchOverride(
		authCtx.CompanyID,
		req.BranchID,
		req.SettingKey,
		req.SettingValue,
		authCtx.UserID,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("Failed to save branch override: "+err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch override saved successfully", nil))
}

func (h *SettingsHandler) GetImpactPreview(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	authCtx := c.MustGet("authContext").(*middleware.AuthContext)

	key := c.Query("setting_key")
	if key == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("setting_key query parameter required", nil))
		return
	}

	var body map[string]interface{}
	c.ShouldBindJSON(&body)
	newValue := body["proposed_value"]

	repo := repositories.NewSettingsRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewConfigurationResolverService(repo, auditService, h.logger)

	preview, err := service.GetImpactPreview(authCtx.CompanyID, key, newValue)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Impact preview generated", preview))
}
