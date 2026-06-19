package controller

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type BranchController struct {
	BaseController
	service *service.BranchService
}

func NewBranchController(service *service.BranchService) *BranchController {
	return &BranchController{service: service}
}

func (c *BranchController) List(ctx *gin.Context) {
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

	c.SendPaginated(ctx, "Branches retrieved successfully", list, req.Page, req.PerPage, total)
}

func (c *BranchController) Create(ctx *gin.Context) {
	companyID, err := c.GetCompanyID(ctx)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	var req request.CreateBranchRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	branch, err := c.service.Create(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.Created(ctx, "Branch created successfully", branch)
}

func (c *BranchController) Get(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	branch, err := c.service.FindByID(id)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Branch retrieved successfully", branch)
}

func (c *BranchController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	var req request.UpdateBranchRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	branch, err := c.service.Update(id, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Branch updated successfully", branch)
}

func (c *BranchController) Delete(ctx *gin.Context) {
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

	c.SendSuccess(ctx, "Branch deleted successfully", nil)
}
