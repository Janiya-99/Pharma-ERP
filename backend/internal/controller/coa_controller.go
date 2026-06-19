package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type CoAController struct {
	BaseController
	coaService *service.CoAService
}

func NewCoAController(coaService *service.CoAService) *CoAController {
	return &CoAController{
		coaService: coaService,
	}
}

// List returns a paginated list of accounts
func (ctrl *CoAController) List(c *gin.Context) {
	companyID, _ := ctrl.GetCompanyID(c)
	var req dto.PaginationRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		req.Page = 1
		req.PerPage = 20
	}

	accounts, total, err := ctrl.coaService.List(companyID, &req)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendPaginated(c, "Accounts retrieved successfully", accounts, req.Page, req.PerPage, total)
}

// ListTree returns accounts in a hierarchical tree format
func (ctrl *CoAController) ListTree(c *gin.Context) {
	companyID, _ := ctrl.GetCompanyID(c)

	accounts, err := ctrl.coaService.ListTree(companyID)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Account tree retrieved successfully", accounts)
}

// Create creates a new account
func (ctrl *CoAController) Create(c *gin.Context) {
	companyID, _ := ctrl.GetCompanyID(c)

	var req request.CreateAccountRequest
	if err := ctrl.BindAndValidate(c, &req); err != nil {
		return
	}

	account, err := ctrl.coaService.Create(c, companyID, &req)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Account created successfully",
		"data":    account,
	})
}

// Get returns a single account
func (ctrl *CoAController) Get(c *gin.Context) {
	companyID, _ := ctrl.GetCompanyID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	account, err := ctrl.coaService.GetByID(companyID, id)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Account retrieved successfully", account)
}

// Update modifies an existing account
func (ctrl *CoAController) Update(c *gin.Context) {
	companyID, _ := ctrl.GetCompanyID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	var req request.UpdateAccountRequest
	if err := ctrl.BindAndValidate(c, &req); err != nil {
		return
	}

	account, err := ctrl.coaService.Update(c, companyID, id, &req)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Account updated successfully", account)
}

// Delete removes an account
func (ctrl *CoAController) Delete(c *gin.Context) {
	companyID, _ := ctrl.GetCompanyID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	err = ctrl.coaService.Delete(c, companyID, id)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Account deleted successfully", nil)
}
