package controller

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type UserController struct {
	BaseController
	userService *service.UserService
}

func NewUserController(userService *service.UserService) *UserController {
	return &UserController{userService: userService}
}

func (c *UserController) List(ctx *gin.Context) {
	companyID, _ := c.GetCompanyID(ctx)

	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		req.Page = 1
		req.PerPage = 20
	}

	users, total, err := c.userService.List(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendPaginated(ctx, "Users retrieved successfully", users, req.Page, req.PerPage, total)
}

func (c *UserController) Create(ctx *gin.Context) {
	var req request.CreateUserRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	companyID, _ := c.GetCompanyID(ctx)
	user, err := c.userService.Create(companyID, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "User created successfully", user)
}

func (c *UserController) Get(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	user, err := c.userService.GetByID(id)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "User retrieved successfully", user)
}

func (c *UserController) Update(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	var req request.UpdateUserRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	user, err := c.userService.Update(id, &req)
	if err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "User updated successfully", user)
}

func (c *UserController) Delete(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	if err := c.userService.Delete(id); err != nil {
		c.HandleError(ctx, err)
		return
	}

	c.SendSuccess(ctx, "User deleted successfully", nil)
}
