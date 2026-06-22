package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	controlRepositories "github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type PettyCashFundHandler struct {
	logger *zap.Logger
}

func NewPettyCashFundHandler(logger *zap.Logger) *PettyCashFundHandler {
	return &PettyCashFundHandler{logger: logger}
}

func (h *PettyCashFundHandler) getService(c *gin.Context) (*financeServices.PettyCashFundService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	fundRepo := repositories.NewPettyCashFundRepository(db)
	chartRepo := repositories.NewChartOfAccountRepository(db)
	branchRepo := controlRepositories.NewBranchRepository(db)
	userRepo := controlRepositories.NewUserRepository(db)
	auditLogService := financeServices.NewAuditLogService(db, h.logger)

	service := financeServices.NewPettyCashFundService(fundRepo, chartRepo, branchRepo, userRepo, auditLogService)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *PettyCashFundHandler) ListPettyCashFunds(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	search := c.Query("search")

	var branchID *uint64
	if bStr := c.Query("branch_id"); bStr != "" {
		if b, err := strconv.ParseUint(bStr, 10, 64); err == nil {
			branchID = &b
		}
	}

	var custodianUserID *uint64
	if cStr := c.Query("custodian_user_id"); cStr != "" {
		if u, err := strconv.ParseUint(cStr, 10, 64); err == nil {
			custodianUserID = &u
		}
	}

	funds, total, err := service.ListPettyCashFunds(companyID, branchID, custodianUserID, status, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash funds loaded successfully",
		"data":    funds,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *PettyCashFundHandler) GetPettyCashFundByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid fund id"})
		return
	}

	fund, err := service.GetPettyCashFundByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "petty cash fund not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": fund})
}

func (h *PettyCashFundHandler) CreatePettyCashFund(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreatePettyCashFundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	fund, err := service.CreatePettyCashFund(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Petty cash fund created successfully",
		"data":    fund,
	})
}

func (h *PettyCashFundHandler) UpdatePettyCashFund(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid fund id"})
		return
	}

	var req dto.UpdatePettyCashFundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	fund, err := service.UpdatePettyCashFund(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash fund updated successfully",
		"data":    fund,
	})
}

func (h *PettyCashFundHandler) DeletePettyCashFund(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid fund id"})
		return
	}

	if err := service.DeletePettyCashFund(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Petty cash fund deleted successfully",
	})
}
