package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/service"
)

type WarehouseController struct {
	service *service.WarehouseService
}

func NewWarehouseController(s *service.WarehouseService) *WarehouseController {
	return &WarehouseController{service: s}
}

func (ctrl *WarehouseController) Create(c *gin.Context) {
	var req dto.CreateWarehouseReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wh, err := ctrl.service.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, wh)
}

func (ctrl *WarehouseController) List(c *gin.Context) {
	warehouses, err := ctrl.service.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, warehouses)
}

func (ctrl *WarehouseController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	wh, err := ctrl.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Warehouse not found"})
		return
	}
	c.JSON(http.StatusOK, wh)
}
