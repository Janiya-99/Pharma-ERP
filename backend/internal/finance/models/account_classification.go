package models

import (
	"time"

	"gorm.io/gorm"
)

// AccountClassification represents a hierarchical account classification node.
// Level 1 = Main Category, Level 2 = Sub Category, Level 3 = Category.
// Type is either "Balance Sheet" or "Profit & Loss".
type AccountClassification struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_ac_company_type_name_parent;index:idx_ac_company" json:"company_id"`

	Type string `gorm:"type:varchar(50);not null;uniqueIndex:idx_ac_company_type_name_parent" json:"type"`
	Name string `gorm:"type:varchar(150);not null;uniqueIndex:idx_ac_company_type_name_parent" json:"name"`

	ParentID *uint64 `gorm:"uniqueIndex:idx_ac_company_type_name_parent" json:"parent_id"`
	Level    int     `gorm:"not null" json:"level"`

	NormalBalance string `gorm:"type:varchar(20)" json:"normal_balance"`
	ReportSection string `gorm:"type:varchar(100)" json:"report_section"`
	SortOrder     int    `gorm:"default:0" json:"sort_order"`

	Status string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Parent   *AccountClassification  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []AccountClassification `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (AccountClassification) TableName() string {
	return "account_classifications"
}
