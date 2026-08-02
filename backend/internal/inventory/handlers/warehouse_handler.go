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

type WarehouseHandler struct {
	service *services.WarehouseService
	logger  *zap.Logger
}

func NewWarehouseHandler(s *services.WarehouseService, logger *zap.Logger) *WarehouseHandler {
	return &WarehouseHandler{service: s, logger: logger}
}
func (h *WarehouseHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	filters := map[string]interface{}{}
	if v := c.Query("warehouse_type"); v != "" {
		filters["warehouse_type"] = v
	}
	if v := c.Query("status"); v != "" {
		filters["status"] = v
	}

	var branchIDPtr *uint64
	if v := c.Query("branch_id"); v != "" {
		id, _ := strconv.ParseUint(v, 10, 64)
		branchIDPtr = &id
	}

	res, total, err := h.service.ListWarehouses(db, companyID.(uint64), branchIDPtr, filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouses loaded successfully", "data": res, "pagination": gin.H{"page": page, "limit": limit, "total": total}})
}
func (h *WarehouseHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	res, err := h.service.GetWarehouseByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse loaded", "data": res})
}
func (h *WarehouseHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	userID, _ := c.Get("user_id")
	var req dto.CreateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	res, err := h.service.CreateWarehouse(c, db, companyID.(uint64), userID.(uint64), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse created successfully", "data": res})
}
func (h *WarehouseHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	res, err := h.service.UpdateWarehouse(c, db, companyID.(uint64), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse updated successfully", "data": res})
}
func (h *WarehouseHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	err := h.service.DeleteWarehouse(c, db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Warehouse deleted successfully", "data": nil})
}
