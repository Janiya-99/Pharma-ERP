package dto

import "time"

type LoginLogFilter struct {
	Search   string
	DateFrom string
	DateTo   string
	UserID   string
	Email    string
	Status   string
	Page     int
	Limit    int
}

type AuditLogFilter struct {
	Search     string
	DateFrom   string
	DateTo     string
	UserID     string
	BranchID   string
	SoftwareID string
	Action     string
	EntityName string
	Page       int
	Limit      int
}

type LoginLogResponse struct {
	ID            uint64     `json:"id"`
	UserID        *uint64    `json:"user_id"`
	UserName      string     `json:"user_name"`
	Email         string     `json:"email"`
	Status        string     `json:"status"`
	LoginStatus   string     `json:"login_status"`
	FailureReason string     `json:"failure_reason"`
	IPAddress     string     `json:"ip_address"`
	UserAgent     string     `json:"user_agent"`
	CreatedAt     *time.Time `json:"created_at"`
	LoggedAt      *time.Time `json:"logged_at"`
}

type AuditLogResponse struct {
	ID           uint64    `json:"id"`
	CompanyID    uint64    `json:"company_id"`
	BranchID     *uint64   `json:"branch_id"`
	BranchName   string    `json:"branch_name"`
	UserID       *uint64   `json:"user_id"`
	UserName     string    `json:"user_name"`
	SoftwareCode string    `json:"software_code"`
	SoftwareName string    `json:"software_name"`
	Action       string    `json:"action"`
	EntityName   string    `json:"entity_name"`
	EntityID     *uint64   `json:"entity_id"`
	OldValues    *string   `json:"old_values"`
	NewValues    *string   `json:"new_values"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	CreatedAt    time.Time `json:"created_at"`
}
