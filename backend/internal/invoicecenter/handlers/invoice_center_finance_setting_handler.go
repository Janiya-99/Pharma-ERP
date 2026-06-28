package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"gorm.io/gorm"
)

type InvoiceCenterFinanceSettingHandler struct {
	service *services.InvoiceCenterFinanceSettingService
}

func NewInvoiceCenterFinanceSettingHandler(service *services.InvoiceCenterFinanceSettingService) *InvoiceCenterFinanceSettingHandler {
	return &InvoiceCenterFinanceSettingHandler{service: service}
}

func (h *InvoiceCenterFinanceSettingHandler) GetFinanceSettings(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var branchID *uint64
	if branchIDStr := c.Query("branch_id"); branchIDStr != "" {
		if id, err := strconv.ParseUint(branchIDStr, 10, 64); err == nil {
			branchID = &id
		}
	}

	response, err := h.service.GetFinanceSettings(db, ctx.CompanyID, branchID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": err.Error(),
			"errors":  []string{err.Error()},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

func (h *InvoiceCenterFinanceSettingHandler) SaveFinanceSettings(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.SaveFinanceSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"errors":  []string{err.Error()},
		})
		return
	}

	if err := h.service.SaveFinanceSettings(db, ctx.CompanyID, ctx.UserID, req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
			"errors":  []string{err.Error()},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Finance settings saved successfully",
	})
}
