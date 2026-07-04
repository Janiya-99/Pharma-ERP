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

type RoleHandler struct {
	logger *zap.Logger
}

func NewRoleHandler(logger *zap.Logger) *RoleHandler {
	return &RoleHandler{logger: logger}
}

func (h *RoleHandler) getService(c *gin.Context) *services.RoleService {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewRoleRepository(db)
	moduleRepo := repositories.NewSoftwareModuleRepository(db)
	auditService := services.NewAuditService(db, h.logger)

	return services.NewRoleService(repo, moduleRepo, auditService)
}

func (h *RoleHandler) List(c *gin.Context) {
	softwareID := c.Query("software_id")
	softwareCode := c.Query("software_code")
	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	service := h.getService(c)
	roles, pagination, err := service.ListRoles(softwareID, softwareCode, status, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Roles loaded successfully", roles, pagination))
}

func (h *RoleHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	service := h.getService(c)
	role, err := service.GetRoleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Role loaded successfully", role))
}

func (h *RoleHandler) Create(c *gin.Context) {
	var req dto.CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	role, err := service.CreateRole(req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Role created successfully", role))
}

func (h *RoleHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	role, err := service.UpdateRole(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Role updated successfully", role))
}

func (h *RoleHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	if err := service.DeleteRole(id, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Role deleted successfully", nil))
}

func (h *RoleHandler) GetAvailableRolesForSoftware(c *gin.Context) {
	softwareID, err := strconv.ParseUint(c.Param("software_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid Software ID", nil))
		return
	}

	service := h.getService(c)
	roles, err := service.GetRolesBySoftware(softwareID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Roles loaded successfully", roles))
}
