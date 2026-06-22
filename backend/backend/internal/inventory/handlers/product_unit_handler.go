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

type ProductUnitHandler struct {
	service *services.ProductUnitService
	logger  *zap.Logger
}

func NewProductUnitHandler(s *services.ProductUnitService, logger *zap.Logger) *ProductUnitHandler {
	return &ProductUnitHandler{service: s, logger: logger}
}
func (h *ProductUnitHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	res, total, err := h.service.List(db, companyID.(uint64), search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Loaded", "data": res, "pagination": gin.H{"page": page, "limit": limit, "total": total}})
}
func (h *ProductUnitHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	res, err := h.service.GetByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Loaded", "data": res})
}
func (h *ProductUnitHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	var req dto.CreateProductUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	res, err := h.service.Create(c, db, companyID.(uint64), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Created", "data": res})
}
func (h *ProductUnitHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateProductUnitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	res, err := h.service.Update(c, db, companyID.(uint64), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Updated", "data": res})
}
func (h *ProductUnitHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	err := h.service.Delete(c, db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Deleted", "data": nil})
}
