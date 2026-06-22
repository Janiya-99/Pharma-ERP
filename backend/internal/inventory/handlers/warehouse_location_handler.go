package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

type WarehouseLocationHandler struct {
	service *services.WarehouseLocationService
	logger  *zap.Logger
}

func NewWarehouseLocationHandler(s *services.WarehouseLocationService, logger *zap.Logger) *WarehouseLocationHandler {
	return &WarehouseLocationHandler{service: s, logger: logger}
}
func (h *WarehouseLocationHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	filters := map[string]interface{}{}
	if v := c.Query("warehouse_id"); v != "" {
		filters["warehouse_id"] = v
	}
	if v := c.Query("storage_condition"); v != "" {
		filters["storage_condition"] = v
	}
	if v := c.Query("status"); v != "" {
		filters["status"] = v
	}
	res, total, err := h.service.ListWarehouseLocations(db, companyID.(uint64), filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse locations loaded", "data": res, "pagination": gin.H{"page": page, "limit": limit, "total": total}})
}
func (h *WarehouseLocationHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	var req dto.CreateWarehouseLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	res, err := h.service.CreateWarehouseLocation(c, db, companyID.(uint64), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse location created", "data": res})
}
func (h *WarehouseLocationHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateWarehouseLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	res, err := h.service.UpdateWarehouseLocation(c, db, companyID.(uint64), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse location updated", "data": res})
}
func (h *WarehouseLocationHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	err := h.service.DeleteWarehouseLocation(c, db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse location deleted", "data": nil})
}
