package validator

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
)

// BindAndValidate binds JSON request body to a struct and validates it.
// Returns a user-friendly validation error if validation fails.
// Like Laravel's FormRequest validation.
func BindAndValidate(c *gin.Context, req interface{}) *errs.AppError {
	if err := c.ShouldBindJSON(req); err != nil {
		// Check for validation errors
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			messages := make([]string, 0, len(validationErrors))
			for _, fieldErr := range validationErrors {
				messages = append(messages, formatFieldError(fieldErr))
			}
			return errs.ErrValidation(strings.Join(messages, "; "))
		}
		return errs.ErrBadRequest("Invalid request body")
	}
	return nil
}

// BindQuery binds query parameters to a struct and validates them.
func BindQuery(c *gin.Context, req interface{}) *errs.AppError {
	if err := c.ShouldBindQuery(req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			messages := make([]string, 0, len(validationErrors))
			for _, fieldErr := range validationErrors {
				messages = append(messages, formatFieldError(fieldErr))
			}
			return errs.ErrValidation(strings.Join(messages, "; "))
		}
		return errs.ErrBadRequest("Invalid query parameters")
	}
	return nil
}

// formatFieldError converts a validator.FieldError to a human-readable message.
func formatFieldError(fe validator.FieldError) string {
	field := toSnakeCase(fe.Field())
	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", field, fe.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters", field, fe.Param())
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, fe.Param())
	case "gte":
		return fmt.Sprintf("%s must be greater than or equal to %s", field, fe.Param())
	case "lte":
		return fmt.Sprintf("%s must be less than or equal to %s", field, fe.Param())
	case "len":
		return fmt.Sprintf("%s must be exactly %s characters", field, fe.Param())
	default:
		return fmt.Sprintf("%s failed validation: %s", field, fe.Tag())
	}
}

// toSnakeCase converts PascalCase to snake_case for field names.
func toSnakeCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			result.WriteRune('_')
		}
		result.WriteRune(r)
	}
	return strings.ToLower(result.String())
}
