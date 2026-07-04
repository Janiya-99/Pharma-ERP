package models

import (
	"time"

	"gorm.io/gorm"
)

// Department represents an internal department (e.g. Finance, Sales).
type Department struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_departments_company_name" json:"company_id"`

	DepartmentCode string `gorm:"type:varchar(50)" json:"department_code"`
	DepartmentName string `gorm:"type:varchar(150);not null;uniqueIndex:idx_departments_company_name" json:"department_name"`
	Description    string `gorm:"type:text" json:"description"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Company Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`

	DesignationDepartments []DesignationDepartment `gorm:"foreignKey:DepartmentID" json:"designation_departments,omitempty"`
}

// TableName overrides the default table name
func (Department) TableName() string {
	return "departments"
}
