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

type UserAccessHandler struct {
	logger *zap.Logger
}

func NewUserAccessHandler(logger *zap.Logger) *UserAccessHandler {
	return &UserAccessHandler{logger: logger}
}

func (h *UserAccessHandler) getBranchService(c *gin.Context) *services.UserBranchAccessService {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewUserBranchAccessRepository(db)
	userRepo := repositories.NewUserRepository(db)
	branchRepo := repositories.NewBranchRepository(db)
	auditService := services.NewAuditService(db, h.logger)

	return services.NewUserBranchAccessService(repo, userRepo, branchRepo, auditService)
}

func (h *UserAccessHandler) getSoftwareService(c *gin.Context) *services.UserSoftwareAccessService {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewUserSoftwareAccessRepository(db)
	userRepo := repositories.NewUserRepository(db)
	moduleRepo := repositories.NewSoftwareModuleRepository(db)
	auditService := services.NewAuditService(db, h.logger)

	return services.NewUserSoftwareAccessService(repo, userRepo, moduleRepo, auditService)
}

func (h *UserAccessHandler) GetBranches(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	service := h.getBranchService(c)
	branches, err := service.GetUserBranches(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User branches loaded successfully", branches))
}

func (h *UserAccessHandler) AssignBranches(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.AssignBranchAccessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getBranchService(c)
	branches, err := service.AssignUserBranches(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch access assigned successfully", branches))
}

func (h *UserAccessHandler) RemoveBranch(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid User ID", nil))
		return
	}

	branchID, err := strconv.ParseUint(c.Param("branch_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid Branch ID", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getBranchService(c)
	err = service.RemoveUserBranchAccess(userID, branchID, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch access removed successfully", nil))
}

func (h *UserAccessHandler) GetSoftware(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	service := h.getSoftwareService(c)
	software, err := service.GetUserSoftwareAccess(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User software modules loaded successfully", software))
}

func (h *UserAccessHandler) AssignSoftware(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.AssignSoftwareAccessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getSoftwareService(c)
	software, err := service.AssignUserSoftwareAccess(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Software access assigned successfully", software))
}

func (h *UserAccessHandler) RemoveSoftware(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid User ID", nil))
		return
	}

	softwareID, err := strconv.ParseUint(c.Param("software_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid Software ID", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getSoftwareService(c)
	err = service.RemoveUserSoftwareAccess(userID, softwareID, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Software access removed successfully", nil))
}
