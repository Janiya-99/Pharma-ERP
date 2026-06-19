package controller

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type CompanyController struct {
	BaseController
	service *service.CompanyService
}

func NewCompanyController(service *service.CompanyService) *CompanyController {
	return &CompanyController{service: service}
}

func (c *CompanyController) List(ctx *gin.Context) {
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

	list, total, err := c.service.List(&req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendPaginated(ctx, "Companies retrieved successfully", list, req.Page, req.PerPage, total)
}

func (c *CompanyController) Create(ctx *gin.Context) {
	var req request.CreateCompanyRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	company, err := c.service.Create(&req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.Created(ctx, "Company created successfully", company)
}

func (c *CompanyController) Get(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	company, err := c.service.FindByID(id)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Company retrieved successfully", company)
}

func (c *CompanyController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	var req request.UpdateCompanyRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	company, err := c.service.Update(id, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Company updated successfully", company)
}

func (c *CompanyController) Delete(ctx *gin.Context) {
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

	c.SendSuccess(ctx, "Company deleted successfully", nil)
}
