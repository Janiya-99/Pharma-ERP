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

type CustomerHandler struct {
	service *services.CustomerService
	logger  *zap.Logger
}

func NewCustomerHandler(s *services.CustomerService, logger *zap.Logger) *CustomerHandler {
	return &CustomerHandler{service: s, logger: logger}
}

func (h *CustomerHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	filters := map[string]interface{}{}
	if v := c.Query("customer_category_id"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 64); err == nil {
			filters["customer_category_id"] = id
		}
	}
	if v := c.Query("customer_type"); v != "" {
		filters["customer_type"] = v
	}
	if v := c.Query("status"); v != "" {
		filters["status"] = v
	}

	res, total, err := h.service.List(db, companyID.(uint64), filters, search, page, limit)
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
		"message": "Customers loaded successfully",
		"data":    res,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func getCustomerID(c *gin.Context) (uint64, error) {
	v := c.Param("customer_id")
	if v == "" {
		v = c.Param("id")
	}
	return strconv.ParseUint(v, 10, 64)
}

func (h *CustomerHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getCustomerID(c)
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
		"message": "Customer loaded successfully",
		"data":    res,
	})
}

func (h *CustomerHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.CreateCustomerRequest
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
		"message": "Customer created successfully",
		"data":    res,
	})
}

func (h *CustomerHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getCustomerID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.UpdateCustomerRequest
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
		"message": "Customer updated successfully",
		"data":    res,
	})
}

func (h *CustomerHandler) ChangeStatus(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getCustomerID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ChangeCustomerStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	err = h.service.ChangeStatus(db, companyID.(uint64), userID.(uint64), id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer status updated successfully",
		"data":    nil,
	})
}

func (h *CustomerHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getCustomerID(c)
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
		"message": "Customer deleted successfully",
		"data":    nil,
	})
}
