package dto

import "time"

type CreateAccountClassificationRequest struct {
	Type          string  `json:"type" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	ParentID      *uint64 `json:"parent_id"`
	Level         int     `json:"level" binding:"required"`
	NormalBalance string  `json:"normal_balance"`
	ReportSection string  `json:"report_section"`
	SortOrder     int     `json:"sort_order"`
	Status        string  `json:"status" binding:"required"`
}

type UpdateAccountClassificationRequest struct {
	Type          string  `json:"type" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	ParentID      *uint64 `json:"parent_id"`
	Level         int     `json:"level" binding:"required"`
	NormalBalance string  `json:"normal_balance"`
	ReportSection string  `json:"report_section"`
	SortOrder     int     `json:"sort_order"`
	Status        string  `json:"status" binding:"required"`
}

type AccountClassificationResponse struct {
	ID            uint64                          `json:"id"`
	CompanyID     uint64                          `json:"company_id"`
	Type          string                          `json:"type"`
	Name          string                          `json:"name"`
	ParentID      *uint64                         `json:"parent_id"`
	Level         int                             `json:"level"`
	NormalBalance string                          `json:"normal_balance"`
	ReportSection string                          `json:"report_section"`
	SortOrder     int                             `json:"sort_order"`
	Status        string                          `json:"status"`
	CreatedAt     time.Time                       `json:"created_at"`
	Children      []AccountClassificationResponse `json:"children,omitempty"`
}
