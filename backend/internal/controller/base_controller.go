package controller

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/pixandco/erp-phrma/internal/dto/response"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
)

// BaseController provides helper methods for all controllers.
type BaseController struct{}

// HandleError processes domain errors and sends the appropriate HTTP response.
func (c *BaseController) HandleError(ctx *gin.Context, err error) {
	// Handle Validation Errors
	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		fieldErrors := make(map[string]string)
		for _, e := range validationErrs {
			fieldErrors[e.Field()] = e.Tag() // In a real app, use a translation library
		}
		response.ValidationError(ctx, "Validation failed", fieldErrors)
		return
	}

	// Handle Domain Errors
	var appErr *errs.AppError
	if errors.As(err, &appErr) {
		response.Error(ctx, appErr.Status, appErr.Code, appErr.Message)
		return
	}

	// Unhandled errors
	response.Error(ctx, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
}

// Success returns a 200 OK response.
func (c *BaseController) Success(ctx *gin.Context, message string, data interface{}) {
	response.Success(ctx, http.StatusOK, message, data)
}

// Created returns a 201 Created response.
func (c *BaseController) Created(ctx *gin.Context, message string, data interface{}) {
	response.Success(ctx, http.StatusCreated, message, data)
}

// SuccessWithMeta returns a 200 OK response with pagination meta.
func (c *BaseController) SuccessWithMeta(ctx *gin.Context, message string, data interface{}, meta *response.Meta) {
	response.SuccessWithMeta(ctx, http.StatusOK, message, data, meta)
}

// GetCompanyID retrieves the company ID from the context (set by AuthMiddleware)
func (c *BaseController) GetCompanyID(ctx *gin.Context) (uint64, error) {
	// For now, return 1 as a default since auth middleware isn't fully wired for finance yet
	val, exists := ctx.Get("company_id")
	if !exists {
		return 1, nil // Fallback to 1
	}
	return val.(uint64), nil
}

// GetUserID retrieves the user ID from the context
func (c *BaseController) GetUserID(ctx *gin.Context) (uint64, error) {
	val, exists := ctx.Get("user_id")
	if !exists {
		return 1, nil // Fallback to 1
	}
	return val.(uint64), nil
}

// GetBranchID retrieves the branch ID from the context
func (c *BaseController) GetBranchID(ctx *gin.Context) (uint64, error) {
	val, exists := ctx.Get("branch_id")
	if !exists {
		return 1, nil // Fallback to 1
	}
	return val.(uint64), nil
}

// BindAndValidate binds JSON and handles validation errors
func (c *BaseController) BindAndValidate(ctx *gin.Context, req interface{}) error {
	if err := ctx.ShouldBindJSON(req); err != nil {
		c.HandleError(ctx, err)
		return err
	}
	return nil
}

// SendPaginated returns a paginated 200 OK response
func (c *BaseController) SendPaginated(ctx *gin.Context, message string, data interface{}, page, limit int, total int64) {
	meta := &response.Meta{
		Page:       page,
		PerPage:    limit,
		Total:      total,
		TotalPages: int64((total + int64(limit) - 1) / int64(limit)),
	}
	c.SuccessWithMeta(ctx, message, data, meta)
}

// SendSuccess returns a simple 200 OK response.
func (c *BaseController) SendSuccess(ctx *gin.Context, message string, data interface{}) {
	c.Success(ctx, message, data)
}
