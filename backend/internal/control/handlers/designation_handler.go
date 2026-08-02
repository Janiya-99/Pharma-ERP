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

type DesignationHandler struct {
	logger *zap.Logger
}

func NewDesignationHandler(logger *zap.Logger) *DesignationHandler {
	return &DesignationHandler{logger: logger}
}

func (h *DesignationHandler) List(c *gin.Context) {
	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewDesignationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDesignationService(repo, auditService)

	desigs, pagination, err := service.List(status, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Designations loaded successfully", desigs, pagination))
}

func (h *DesignationHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewDesignationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDesignationService(repo, auditService)

	desig, err := service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("Designation not found", nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Designation loaded successfully", desig))
}

func (h *DesignationHandler) Create(c *gin.Context) {
	var req dto.CreateDesignationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	repo := repositories.NewDesignationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDesignationService(repo, auditService)

	desig, err := service.Create(req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Designation created successfully", desig))
}

func (h *DesignationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.UpdateDesignationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	repo := repositories.NewDesignationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDesignationService(repo, auditService)

	desig, err := service.Update(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Designation updated successfully", desig))
}

func (h *DesignationHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	repo := repositories.NewDesignationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewDesignationService(repo, auditService)

	err = service.Delete(id, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Designation deleted successfully", nil))
}
