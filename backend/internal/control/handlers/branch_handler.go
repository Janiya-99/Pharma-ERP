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

type BranchHandler struct {
	logger *zap.Logger
}

func NewBranchHandler(logger *zap.Logger) *BranchHandler {
	return &BranchHandler{logger: logger}
}

func (h *BranchHandler) List(c *gin.Context) {
	status := c.Query("status")
	branchType := c.Query("branch_type")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewBranchRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewBranchService(repo, auditService)

	branches, pagination, err := service.List(status, branchType, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse("Branches loaded successfully", branches, pagination))
}

func (h *BranchHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewBranchRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewBranchService(repo, auditService)

	branch, err := service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("Branch not found", nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch loaded successfully", branch))
}

func (h *BranchHandler) Create(c *gin.Context) {
	var req dto.CreateBranchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	repo := repositories.NewBranchRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewBranchService(repo, auditService)

	branch, err := service.Create(req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch created successfully", branch))
}

func (h *BranchHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid ID", nil))
		return
	}

	var req dto.UpdateBranchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx := c.MustGet("authContext").(*middleware.AuthContext)
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	repo := repositories.NewBranchRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewBranchService(repo, auditService)

	branch, err := service.Update(id, req, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch updated successfully", branch))
}

func (h *BranchHandler) Delete(c *gin.Context) {
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

	repo := repositories.NewBranchRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewBranchService(repo, auditService)

	err = service.Delete(id, authCtx.CompanyID, authCtx.UserID, authCtx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Branch deleted successfully", nil))
}
