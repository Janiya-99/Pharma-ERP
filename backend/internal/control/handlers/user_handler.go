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

type UserHandler struct {
	logger *zap.Logger
}

func NewUserHandler(logger *zap.Logger) *UserHandler {
	return &UserHandler{logger: logger}
}

func (h *UserHandler) getService(c *gin.Context) *services.UserService {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	userRepo := repositories.NewUserRepository(db)
	branchAccessRepo := repositories.NewUserBranchAccessRepository(db)
	deptRepo := repositories.NewDepartmentRepository(db)
	desigRepo := repositories.NewDesignationRepository(db)
	auditService := services.NewAuditService(db, h.logger)

	return services.NewUserService(userRepo, branchAccessRepo, deptRepo, desigRepo, auditService)
}

func (h *UserHandler) List(c *gin.Context) {
	search := c.Query("search")
	departmentID := c.Query("department_id")
	designationID := c.Query("designation_id")
	status := c.Query("status")
	userType := c.Query("user_type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	service := h.getService(c)
	users, pagination, err := service.ListUsers(search, departmentID, designationID, status, userType, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Users loaded successfully", users, pagination))
}

func (h *UserHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	service := h.getService(c)
	user, err := service.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User loaded successfully", user))
}

func (h *UserHandler) Create(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	user, err := service.CreateUser(req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User created successfully", user))
}

func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format: "+err.Error(), nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	user, err := service.UpdateUser(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User updated successfully", user))
}

func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	err = service.DeleteUser(id, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User deleted successfully", nil))
}

func (h *UserHandler) ChangeStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.ChangeUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	user, err := service.ChangeUserStatus(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User status changed successfully", user))
}

func (h *UserHandler) ResetPassword(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	service := h.getService(c)
	err = service.ResetUserPassword(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("User password reset successfully", nil))
}
