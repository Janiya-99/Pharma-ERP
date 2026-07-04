package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents an employee or user within the company database.
type User struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_users_company_employee" json:"company_id"`

	EmployeeCode string `gorm:"type:varchar(50);uniqueIndex:idx_users_company_employee" json:"employee_code"`
	Name         string `gorm:"type:varchar(150);not null" json:"name"`
	Email        string `gorm:"type:varchar(150);not null;uniqueIndex:idx_users_email" json:"email"`
	PasswordHash string `gorm:"column:password_hash;type:varchar(255);not null" json:"-"`
	Phone        string `gorm:"type:varchar(50)" json:"phone"`

	DepartmentID    *uint64 `json:"department_id"`
	DesignationID   *uint64 `json:"designation_id"`
	DefaultBranchID *uint64 `json:"default_branch_id"`

	UserType        string `gorm:"type:varchar(50);default:company_user" json:"user_type"`
	ProfileImageURL string `gorm:"type:text" json:"profile_image_url"`

	LastLoginAt *time.Time `json:"last_login_at"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by"`
	UpdatedBy *uint64 `json:"updated_by"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Company       Company      `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Department    *Department  `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Designation   *Designation `gorm:"foreignKey:DesignationID" json:"designation,omitempty"`
	DefaultBranch *Branch      `gorm:"foreignKey:DefaultBranchID" json:"default_branch,omitempty"`

	OrganizationAssignments []UserOrganizationAssignment `gorm:"foreignKey:UserID" json:"organization_assignments,omitempty"`
}

// TableName overrides the default table name
func (User) TableName() string {
	return "users"
}
