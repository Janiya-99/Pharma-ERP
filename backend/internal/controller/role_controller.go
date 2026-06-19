package controller

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type RoleController struct {
	BaseController
	roleService *service.RoleService
}

func NewRoleController(roleService *service.RoleService) *RoleController {
	return &RoleController{roleService: roleService}
}

func (c *RoleController) List(ctx *gin.Context) {
	companyID, _ := c.GetCompanyID(ctx)
	
	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		req.Page = 1
		req.PerPage = 20
	}

	roles, total, err := c.roleService.List(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendPaginated(ctx, "Roles retrieved successfully", roles, req.Page, req.PerPage, total)
}

func (c *RoleController) Create(ctx *gin.Context) {
	companyID, _ := c.GetCompanyID(ctx)

	var req request.CreateRoleRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	role, err := c.roleService.Create(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Role created successfully", role)
}

func (c *RoleController) Get(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	role, err := c.roleService.GetByID(id)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Role retrieved successfully", role)
}

func (c *RoleController) Update(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	var req request.UpdateRoleRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	role, err := c.roleService.Update(ctx.Request.Context(), id, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Role updated successfully", role)
}

func (c *RoleController) Delete(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	if err := c.roleService.Delete(id); err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Role deleted successfully", nil)
}

func (c *RoleController) ListPermissions(ctx *gin.Context) {
	perms, err := c.roleService.GetAllPermissions()
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "Permissions retrieved successfully", perms)
}
