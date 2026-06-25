package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/pixandco/erp-phrma/internal/common/api"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/services"
)

type SalesReturnHandler struct {
	svc services.SalesReturnService
}

func NewSalesReturnHandler(svc services.SalesReturnService) *SalesReturnHandler {
	return &SalesReturnHandler{svc: svc}
}

func (h *SalesReturnHandler) ListSalesReturns(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	filter := dto.SalesReturnFilter{
		Search: c.Query("search"),
	}

	if val := c.Query("branch_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.BranchID = &id
		}
	}
	if val := c.Query("warehouse_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.WarehouseID = &id
		}
	}
	if val := c.Query("financial_year_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.FinancialYearID = &id
		}
	}
	if val := c.Query("accounting_period_id"); val != "" {
		if id, err := strconv.ParseUint(val, 10, 64); err == nil {
			filter.AccountingPeriodID = &id
		}
	}
	if val := c.Query("approval_status"); val != "" {
		filter.ApprovalStatus = &val
	}
	if val := c.Query("posted_status"); val != "" {
		filter.PostedStatus = &val
	}
	if val := c.Query("return_reason"); val != "" {
		filter.ReturnReason = &val
	}
	if val := c.Query("return_condition"); val != "" {
		filter.ReturnCondition = &val
	}
	if val := c.Query("sales_return_date_from"); val != "" {
		if d, err := time.Parse("2006-01-02", val); err == nil {
			filter.DateFrom = &d
		}
	}
	if val := c.Query("sales_return_date_to"); val != "" {
		if d, err := time.Parse("2006-01-02", val); err == nil {
			filter.DateTo = &d
		}
	}
	if val := c.Query("page", "1"); val != "" {
		if page, err := strconv.Atoi(val); err == nil {
			filter.Page = page
		}
	}
	if val := c.Query("limit", "10"); val != "" {
		if limit, err := strconv.Atoi(val); err == nil {
			filter.Limit = limit
		}
	}

	db := api.GetDB(c)
	returns, total, err := h.svc.ListSalesReturns(db, authCtx.CompanyID, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.PaginatedResponse("Sales returns loaded successfully", returns, filter.Page, filter.Limit, total))
}

func (h *SalesReturnHandler) GetSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	db := api.GetDB(c)
	salesReturn, err := h.svc.GetSalesReturnByID(db, authCtx.CompanyID, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(api.ErrorResponse(err))
	}
	if salesReturn == nil {
		return c.Status(fiber.StatusNotFound).JSON(api.ErrorResponse(fmt.Errorf("sales return not found")))
	}

	return c.JSON(api.SuccessResponse("Sales return loaded successfully", salesReturn))
}

func (h *SalesReturnHandler) CreateSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	var req dto.CreateSalesReturnRequest
	if err := api.ParseAndValidate(c, &req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	db := api.GetDB(c)
	salesReturn, err := h.svc.CreateSalesReturn(db, authCtx, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.Status(fiber.StatusCreated).JSON(api.SuccessResponse("Sales return created successfully", salesReturn))
}

func (h *SalesReturnHandler) UpdateSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	var req dto.UpdateSalesReturnRequest
	if err := api.ParseAndValidate(c, &req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	db := api.GetDB(c)
	salesReturn, err := h.svc.UpdateSalesReturn(db, authCtx, id, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.SuccessResponse("Sales return updated successfully", salesReturn))
}

func (h *SalesReturnHandler) DeleteSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	db := api.GetDB(c)
	if err := h.svc.DeleteSalesReturn(db, authCtx, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.SuccessResponse("Sales return deleted successfully", nil))
}

func (h *SalesReturnHandler) SubmitSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	var req dto.SalesReturnActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	db := api.GetDB(c)
	if err := h.svc.SubmitSalesReturn(db, authCtx, id, req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.SuccessResponse("Sales return submitted successfully", nil))
}

func (h *SalesReturnHandler) ApproveSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	var req dto.SalesReturnActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	db := api.GetDB(c)
	if err := h.svc.ApproveSalesReturn(db, authCtx, id, req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.SuccessResponse("Sales return approved successfully", nil))
}

func (h *SalesReturnHandler) RejectSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	var req dto.SalesReturnActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	db := api.GetDB(c)
	if err := h.svc.RejectSalesReturn(db, authCtx, id, req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.SuccessResponse("Sales return rejected successfully", nil))
}

func (h *SalesReturnHandler) PostSalesReturn(c *fiber.Ctx) error {
	authCtx := api.GetAuthContext(c)
	if authCtx == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(api.ErrorResponse(fmt.Errorf("unauthorized")))
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(fmt.Errorf("invalid ID format")))
	}

	db := api.GetDB(c)
	if err := h.svc.PostSalesReturn(db, authCtx, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(api.ErrorResponse(err))
	}

	return c.JSON(api.SuccessResponse("Sales return posted successfully", nil))
}
