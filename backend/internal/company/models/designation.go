package models

import (
	"time"

	"gorm.io/gorm"
)

// Designation represents a job title or role description (e.g. Finance Manager).
type Designation struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_designations_company_name" json:"company_id"`

	DesignationName string `gorm:"type:varchar(150);not null;uniqueIndex:idx_designations_company_name" json:"designation_name"`
	Description     string `gorm:"type:text" json:"description"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Company Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}

// TableName overrides the default table name
func (Designation) TableName() string {
	return "designations"
}
