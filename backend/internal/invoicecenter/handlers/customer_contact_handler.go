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

type CustomerContactHandler struct {
	service *services.CustomerContactService
	logger  *zap.Logger
}

func NewCustomerContactHandler(s *services.CustomerContactService, logger *zap.Logger) *CustomerContactHandler {
	return &CustomerContactHandler{service: s, logger: logger}
}

func (h *CustomerContactHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	custID, err := strconv.ParseUint(c.Param("customer_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer ID", "errors": []string{}})
		return
	}

	res, err := h.service.ListByCustomer(db, companyID.(uint64), custID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer contacts loaded successfully",
		"data":    res,
	})
}

func (h *CustomerContactHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	custID, err := strconv.ParseUint(c.Param("customer_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer ID", "errors": []string{}})
		return
	}

	var req dto.CreateCustomerContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, err := h.service.Create(db, companyID.(uint64), userID.(uint64), custID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Customer contact created successfully",
		"data":    res,
	})
}

func (h *CustomerContactHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	custID, err := strconv.ParseUint(c.Param("customer_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer ID", "errors": []string{}})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid contact ID", "errors": []string{}})
		return
	}

	var req dto.UpdateCustomerContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, err := h.service.Update(db, companyID.(uint64), userID.(uint64), custID, id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer contact updated successfully",
		"data":    res,
	})
}

func (h *CustomerContactHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	custID, err := strconv.ParseUint(c.Param("customer_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer ID", "errors": []string{}})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid contact ID", "errors": []string{}})
		return
	}

	err = h.service.Delete(db, companyID.(uint64), userID.(uint64), custID, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer contact deleted successfully",
		"data":    nil,
	})
}
