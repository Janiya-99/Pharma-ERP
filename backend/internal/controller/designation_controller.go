package controller

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type DesignationController struct {
	BaseController
	service *service.DesignationService
}

func NewDesignationController(service *service.DesignationService) *DesignationController {
	return &DesignationController{service: service}
}

func (c *DesignationController) List(ctx *gin.Context) {
	companyID, err := c.GetCompanyID(ctx)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		req.Page = 1
		req.PerPage = 20
	}
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PerPage <= 0 {
		req.PerPage = 20
	}

	list, total, err := c.service.List(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendPaginated(ctx, "Designations retrieved successfully", list, req.Page, req.PerPage, total)
}

func (c *DesignationController) Create(ctx *gin.Context) {
	companyID, err := c.GetCompanyID(ctx)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	var req request.CreateDesignationRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	des, err := c.service.Create(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.Created(ctx, "Designation created successfully", des)
}

func (c *DesignationController) Get(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	des, err := c.service.FindByID(id)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Designation retrieved successfully", des)
}

func (c *DesignationController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	var req request.UpdateDesignationRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	des, err := c.service.Update(id, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Designation updated successfully", des)
}

func (c *DesignationController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	err = c.service.Delete(id)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Designation deleted successfully", nil)
}
