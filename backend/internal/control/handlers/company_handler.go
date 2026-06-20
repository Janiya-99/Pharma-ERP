package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CompanyHandler struct {
	logger *zap.Logger
}

func NewCompanyHandler(logger *zap.Logger) *CompanyHandler {
	return &CompanyHandler{logger: logger}
}

func (h *CompanyHandler) GetCompanyProfile(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewCompanyRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewCompanyService(repo, auditService)

	company, err := service.GetCompanyProfile()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, company)
}

func (h *CompanyHandler) UpdateCompanyProfile(c *gin.Context) {
	var req dto.UpdateCompanyProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("Invalid request format", nil))
		return
	}

	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse("Auth context missing", nil))
		return
	}
	ctx := authCtx.(*middleware.AuthContext)

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	repo := repositories.NewCompanyRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := services.NewCompanyService(repo, auditService)

	company, err := service.UpdateCompanyProfile(req, ctx.UserID, ctx.ActiveBranchID, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse(err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse("Company profile updated successfully", company))
}
