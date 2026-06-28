package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CustomerCategoryHandler struct {
	service *services.CustomerCategoryService
	logger  *zap.Logger
}

func NewCustomerCategoryHandler(s *services.CustomerCategoryService, logger *zap.Logger) *CustomerCategoryHandler {
	return &CustomerCategoryHandler{service: s, logger: logger}
}

func (h *CustomerCategoryHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	res, total, err := h.service.List(db, companyID.(uint64), search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer categories loaded successfully",
		"data":    res,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *CustomerCategoryHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	res, err := h.service.GetByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer category loaded successfully",
		"data":    res,
	})
}

func (h *CustomerCategoryHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.CreateCustomerCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, err := h.service.Create(db, companyID.(uint64), userID.(uint64), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Customer category created successfully",
		"data":    res,
	})
}

func (h *CustomerCategoryHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.UpdateCustomerCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, err := h.service.Update(db, companyID.(uint64), userID.(uint64), id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer category updated successfully",
		"data":    res,
	})
}

func (h *CustomerCategoryHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	err = h.service.Delete(db, companyID.(uint64), userID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer category deleted successfully",
		"data":    nil,
	})
}
