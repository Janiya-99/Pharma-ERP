package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/service"
)

type SupplierController struct {
	service *service.SupplierService
}

func NewSupplierController(s *service.SupplierService) *SupplierController {
	return &SupplierController{service: s}
}

func (ctrl *SupplierController) Create(c *gin.Context) {
	var req dto.CreateSupplierReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	supplier, err := ctrl.service.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, supplier)
}

func (ctrl *SupplierController) List(c *gin.Context) {
	suppliers, err := ctrl.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, suppliers)
}

func (ctrl *SupplierController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	supplier, err := ctrl.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Supplier not found"})
		return
	}
	c.JSON(http.StatusOK, supplier)
}
