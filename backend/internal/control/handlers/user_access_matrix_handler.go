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

type UserAccessMatrixHandler struct {
	logger *zap.Logger
}

func NewUserAccessMatrixHandler(logger *zap.Logger) *UserAccessMatrixHandler {
	return &UserAccessMatrixHandler{logger: logger}
}

func (h *UserAccessMatrixHandler) getService(c *gin.Context) *services.UserAccessMatrixService {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewUserAccessMatrixRepository(db)
	userRepo := repositories.NewUserRepository(db)
	branchRepo := repositories.NewUserBranchAccessRepository(db)
	softwareRepo := repositories.NewUserSoftwareAccessRepository(db)
	roleRepo := repositories.NewRoleRepository(db)
	auditService := services.NewAuditService(db, h.logger)

	return services.NewUserAccessMatrixService(repo, userRepo, branchRepo, softwareRepo, roleRepo, auditService)
}

func (h *UserAccessMatrixHandler) GetMatrix(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid User ID", nil))
		return
	}

	service := h.getService(c)
	matrix, err := service.GetUserAccessMatrix(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, matrix) // Root response
}

func (h *UserAccessMatrixHandler) Assign(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid User ID", nil))
		return
	}

	var req dto.AssignUserAccessMatrixRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	matrix, err := service.AssignUserAccessMatrix(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User access matrix assigned successfully", matrix))
}

func (h *UserAccessMatrixHandler) Remove(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid User ID", nil))
		return
	}

	accessID, err := strconv.ParseUint(c.Param("access_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid Access ID", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	if err := service.RemoveUserAccessMatrix(accessID, userID, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Access matrix record removed successfully", nil))
}
