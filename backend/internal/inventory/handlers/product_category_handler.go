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

type ProductCategoryHandler struct {
	service *services.ProductCategoryService
	logger  *zap.Logger
}

func NewProductCategoryHandler(s *services.ProductCategoryService, logger *zap.Logger) *ProductCategoryHandler {
	return &ProductCategoryHandler{service: s, logger: logger}
}
func (h *ProductCategoryHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	filters := map[string]interface{}{}
	if v := c.Query("parent_id"); v != "" {
		filters["parent_id"] = v
	}
	if v := c.Query("level"); v != "" {
		filters["level"] = v
	}
	if v := c.Query("status"); v != "" {
		filters["status"] = v
	}
	res, total, err := h.service.List(db, companyID.(uint64), filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Loaded", "data": res, "pagination": gin.H{"page": page, "limit": limit, "total": total}})
}
func (h *ProductCategoryHandler) Get(c *gin.Context) {
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
func (h *ProductCategoryHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	var req dto.CreateProductCategoryRequest
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
func (h *ProductCategoryHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req dto.UpdateProductCategoryRequest
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
func (h *ProductCategoryHandler) Delete(c *gin.Context) {
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
