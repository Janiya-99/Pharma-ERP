package models

import (
	"time"

	"gorm.io/gorm"
)

// Branch represents a physical or logical location for a company (e.g. Warehouse, Main Branch).
type Branch struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_branches_company_code" json:"company_id"`

	BranchCode string `gorm:"type:varchar(50);not null;uniqueIndex:idx_branches_company_code" json:"branch_code"`
	BranchName string `gorm:"type:varchar(150);not null" json:"branch_name"`
	BranchType string `gorm:"type:varchar(50)" json:"branch_type"`

	Address string `gorm:"type:text" json:"address"`
	Phone   string `gorm:"type:varchar(50)" json:"phone"`
	Email   string `gorm:"type:varchar(150)" json:"email"`

	IsMainBranch bool   `gorm:"default:false" json:"is_main_branch"`
	Status       string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Company Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}

// TableName overrides the default table name
func (Branch) TableName() string {
	return "branches"
}
