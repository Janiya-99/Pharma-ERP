package dto

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type CommonResponse struct {
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data,omitempty"`
	Errors     interface{} `json:"errors,omitempty"`
	Pagination *Pagination `json:"pagination,omitempty"`
}

func SuccessResponse(message string, data interface{}) CommonResponse {
	return CommonResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
}

func PaginatedResponse(message string, data interface{}, pagination *Pagination) CommonResponse {
	return CommonResponse{
		Success:    true,
		Message:    message,
		Data:       data,
		Pagination: pagination,
	}
}

func ErrorResponse(message string, errors interface{}) CommonResponse {
	return CommonResponse{
		Success: false,
		Message: message,
		Errors:  errors,
	}
}
