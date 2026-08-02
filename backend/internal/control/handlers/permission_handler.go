package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type PermissionHandler struct {
	logger *zap.Logger
}

func NewPermissionHandler(logger *zap.Logger) *PermissionHandler {
	return &PermissionHandler{logger: logger}
}

func (h *PermissionHandler) getService(c *gin.Context) *services.PermissionService {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewPermissionRepository(db)

	return services.NewPermissionService(repo)
}

func (h *PermissionHandler) List(c *gin.Context) {
	softwareID := c.Query("software_id")
	softwareCode := c.Query("software_code")
	permissionGroup := c.Query("permission_group")
	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	service := h.getService(c)
	permissions, pagination, err := service.ListPermissions(softwareID, softwareCode, permissionGroup, status, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Permissions loaded successfully", permissions, pagination))
}

func (h *PermissionHandler) ListGrouped(c *gin.Context) {
	softwareID := c.Query("software_id")
	softwareCode := c.Query("software_code")

	service := h.getService(c)
	permissions, err := service.ListPermissionsGrouped(softwareID, softwareCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Grouped permissions loaded successfully", permissions))
}
