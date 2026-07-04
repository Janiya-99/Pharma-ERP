package models

import (
	"time"

	"gorm.io/gorm"
)

// UserOrganizationAssignment links a user to a branch, department, and designation.
type UserOrganizationAssignment struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID     uint64 `gorm:"not null;index" json:"company_id"`
	UserID        uint64 `gorm:"not null;index" json:"user_id"`
	BranchID      uint64 `gorm:"not null;index" json:"branch_id"`
	DepartmentID  uint64 `gorm:"not null;index" json:"department_id"`
	DesignationID uint64 `gorm:"not null;index" json:"designation_id"`

	IsPrimary     bool       `gorm:"default:false" json:"is_primary"`
	EffectiveFrom time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"effective_from"`
	EffectiveTo   *time.Time `json:"effective_to,omitempty"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"` // active, inactive, scheduled, expired

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Company     Company     `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	User        User        `gorm:"foreignKey:UserID" json:"-"`
	Branch      Branch      `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Department  Department  `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Designation Designation `gorm:"foreignKey:DesignationID" json:"designation,omitempty"`
}

func (UserOrganizationAssignment) TableName() string {
	return "user_organization_assignments"
}
