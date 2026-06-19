package response

import (
	"github.com/gin-gonic/gin"
)

// APIResponse is the standard response format for all API endpoints.
// Like Laravel's API Resources — consistent, predictable JSON structure.
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

// Meta holds pagination metadata.
type Meta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int64 `json:"total_pages"`
}

// Success sends a successful response with data.
func Success(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// SuccessWithMeta sends a successful response with data and pagination metadata.
func SuccessWithMeta(c *gin.Context, status int, message string, data interface{}, meta *Meta) {
	c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

// Error sends an error response. Never exposes internal details.
func Error(c *gin.Context, status int, code string, message string) {
	c.JSON(status, APIResponse{
		Success: false,
		Errors: map[string]string{
			"code":    code,
			"message": message,
		},
	})
}

// ValidationError sends a validation error response with field-level errors.
func ValidationError(c *gin.Context, message string, fieldErrors interface{}) {
	c.JSON(422, APIResponse{
		Success: false,
		Message: message,
		Errors:  fieldErrors,
	})
}
