package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type FinancialYearHandler struct {
	logger *zap.Logger
}

func NewFinancialYearHandler(logger *zap.Logger) *FinancialYearHandler {
	return &FinancialYearHandler{logger: logger}
}

func (h *FinancialYearHandler) getService(c *gin.Context) (*financeServices.FinancialYearService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewFinancialYearRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewFinancialYearService(repo, auditService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *FinancialYearHandler) List(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	status := c.Query("status")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	years, total, err := service.List(companyID, status, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch financial years"})
		return
	}

	var response []dto.FinancialYearResponse
	for _, fy := range years {
		response = append(response, dto.FinancialYearResponse{
			ID:        fy.ID,
			CompanyID: fy.CompanyID,
			YearName:  fy.YearName,
			StartDate: fy.StartDate.Format("2006-01-02"),
			EndDate:   fy.EndDate.Format("2006-01-02"),
			IsActive:  fy.IsActive,
			IsClosed:  fy.IsClosed,
			Status:    fy.Status,
			CreatedAt: fy.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Financial years loaded successfully",
		"data":    response,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *FinancialYearHandler) Get(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	fy, err := service.GetByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Financial year not found"})
		return
	}

	response := dto.FinancialYearResponse{
		ID:        fy.ID,
		CompanyID: fy.CompanyID,
		YearName:  fy.YearName,
		StartDate: fy.StartDate.Format("2006-01-02"),
		EndDate:   fy.EndDate.Format("2006-01-02"),
		IsActive:  fy.IsActive,
		IsClosed:  fy.IsClosed,
		Status:    fy.Status,
		CreatedAt: fy.CreatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}

func (h *FinancialYearHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateFinancialYearRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	fy, err := service.Create(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Financial year created successfully", "data": gin.H{"id": fy.ID}})
}

func (h *FinancialYearHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateFinancialYearRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	_, err = service.Update(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Financial year updated successfully"})
}

func (h *FinancialYearHandler) Close(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.Close(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Financial year closed successfully"})
}
