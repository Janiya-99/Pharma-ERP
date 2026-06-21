package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AccountClassificationHandler struct {
	logger *zap.Logger
}

func NewAccountClassificationHandler(logger *zap.Logger) *AccountClassificationHandler {
	return &AccountClassificationHandler{logger: logger}
}

func (h *AccountClassificationHandler) getService(c *gin.Context) (*financeServices.AccountClassificationService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	repo := repositories.NewAccountClassificationRepository(db)
	auditService := services.NewAuditService(db, h.logger)
	service := financeServices.NewAccountClassificationService(repo, auditService, h.logger)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *AccountClassificationHandler) List(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	isTree := c.Query("tree") == "true"

	if isTree {
		classifications, err := service.ListTree(companyID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch classifications tree"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Classifications loaded successfully",
			"data":    h.mapToResponseTree(classifications),
		})
		return
	}

	filters := make(map[string]interface{})
	if t := c.Query("type"); t != "" {
		filters["type"] = t
	}
	if level := c.Query("level"); level != "" {
		filters["level"] = level
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if parentID := c.Query("parent_id"); parentID != "" {
		filters["parent_id"] = parentID
	}

	classifications, err := service.List(companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch classifications"})
		return
	}

	var response []dto.AccountClassificationResponse
	for _, ac := range classifications {
		response = append(response, dto.AccountClassificationResponse{
			ID:            ac.ID,
			CompanyID:     ac.CompanyID,
			Type:          ac.Type,
			Name:          ac.Name,
			ParentID:      ac.ParentID,
			Level:         ac.Level,
			NormalBalance: ac.NormalBalance,
			ReportSection: ac.ReportSection,
			SortOrder:     ac.SortOrder,
			Status:        ac.Status,
			CreatedAt:     ac.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Classifications loaded successfully",
		"data":    response,
	})
}

func (h *AccountClassificationHandler) mapToResponseTree(nodes []models.AccountClassification) []dto.AccountClassificationResponse {
	var res []dto.AccountClassificationResponse
	for _, n := range nodes {
		item := dto.AccountClassificationResponse{
			ID:            n.ID,
			CompanyID:     n.CompanyID,
			Type:          n.Type,
			Name:          n.Name,
			ParentID:      n.ParentID,
			Level:         n.Level,
			NormalBalance: n.NormalBalance,
			ReportSection: n.ReportSection,
			SortOrder:     n.SortOrder,
			Status:        n.Status,
			CreatedAt:     n.CreatedAt,
		}
		if len(n.Children) > 0 {
			item.Children = h.mapToResponseTree(n.Children)
		}
		res = append(res, item)
	}
	return res
}

func (h *AccountClassificationHandler) Create(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateAccountClassificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	ac, err := service.Create(companyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Account classification created successfully", "data": gin.H{"id": ac.ID}})
}

func (h *AccountClassificationHandler) Update(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateAccountClassificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request parameters", "error": err.Error()})
		return
	}

	_, err = service.Update(companyID, id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account classification updated successfully"})
}

func (h *AccountClassificationHandler) Delete(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.Delete(companyID, id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account classification deleted successfully"})
}
