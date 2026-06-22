package errs

import (
	"fmt"
	"net/http"
)

// AppError represents an application-level error.
// Internal details are logged but NEVER exposed to the client.
// This is like Laravel's exception handler — map internal errors to safe HTTP responses.
type AppError struct {
	Code     string `json:"code"`    // Machine-readable error code
	Message  string `json:"message"` // Safe, user-facing message
	Status   int    `json:"-"`       // HTTP status code
	Internal error  `json:"-"`       // Internal error for logging (never serialized)
}

func (e *AppError) Error() string {
	if e.Internal != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Internal)
	}
	return e.Message
}

// Unwrap returns the internal error for errors.Is/errors.As support.
func (e *AppError) Unwrap() error {
	return e.Internal
}

// --- Factory Functions ---

// ErrBadRequest creates a 400 Bad Request error.
func ErrBadRequest(message string) *AppError {
	return &AppError{
		Code:    "BAD_REQUEST",
		Message: message,
		Status:  http.StatusBadRequest,
	}
}

// ErrValidation creates a 422 Unprocessable Entity error for validation failures.
func ErrValidation(message string) *AppError {
	return &AppError{
		Code:    "VALIDATION_ERROR",
		Message: message,
		Status:  http.StatusUnprocessableEntity,
	}
}

// ErrUnauthorized creates a 401 Unauthorized error.
func ErrUnauthorized(message string) *AppError {
	if message == "" {
		message = "Authentication required"
	}
	return &AppError{
		Code:    "UNAUTHORIZED",
		Message: message,
		Status:  http.StatusUnauthorized,
	}
}

// ErrForbidden creates a 403 Forbidden error.
func ErrForbidden(message string) *AppError {
	if message == "" {
		message = "You do not have permission to perform this action"
	}
	return &AppError{
		Code:    "FORBIDDEN",
		Message: message,
		Status:  http.StatusForbidden,
	}
}

// ErrNotFound creates a 404 Not Found error.
func ErrNotFound(resource string) *AppError {
	return &AppError{
		Code:    "NOT_FOUND",
		Message: fmt.Sprintf("%s not found", resource),
		Status:  http.StatusNotFound,
	}
}

// ErrConflict creates a 409 Conflict error.
func ErrConflict(message string) *AppError {
	return &AppError{
		Code:    "CONFLICT",
		Message: message,
		Status:  http.StatusConflict,
	}
}

// ErrTooManyRequests creates a 429 Too Many Requests error.
func ErrTooManyRequests() *AppError {
	return &AppError{
		Code:    "TOO_MANY_REQUESTS",
		Message: "Rate limit exceeded. Please try again later.",
		Status:  http.StatusTooManyRequests,
	}
}

// ErrInternal creates a 500 Internal Server Error.
// The internal error is logged but the safe message is returned to the client.
func ErrInternal(internal error) *AppError {
	return &AppError{
		Code:     "INTERNAL_ERROR",
		Message:  "An unexpected error occurred. Please try again later.",
		Status:   http.StatusInternalServerError,
		Internal: internal,
	}
}

// ErrDatabase wraps a database error with a safe message.
// NEVER expose raw database errors to the client.
func ErrDatabase(internal error) *AppError {
	return &AppError{
		Code:     "INTERNAL_ERROR",
		Message:  "A database error occurred. Please try again later.",
		Status:   http.StatusInternalServerError,
		Internal: internal,
	}
}

// ErrBusinessLogic creates an error for business rule violations.
func ErrBusinessLogic(message string) *AppError {
	return &AppError{
		Code:    "BUSINESS_RULE_VIOLATION",
		Message: message,
		Status:  http.StatusUnprocessableEntity,
	}
}
