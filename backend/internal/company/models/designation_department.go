package models

import (
	"time"
)

// DesignationDepartment maps a designation to allowed departments.
type DesignationDepartment struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID     uint64 `gorm:"not null;uniqueIndex:idx_desig_dept" json:"company_id"`
	DesignationID uint64 `gorm:"not null;uniqueIndex:idx_desig_dept" json:"designation_id"`
	DepartmentID  uint64 `gorm:"not null;uniqueIndex:idx_desig_dept" json:"department_id"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Company     Company     `gorm:"foreignKey:CompanyID" json:"-"`
	Designation Designation `gorm:"foreignKey:DesignationID" json:"-"`
	Department  Department  `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
}

func (DesignationDepartment) TableName() string {
	return "designation_departments"
}
