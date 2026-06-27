package models

import (
	"time"

	"gorm.io/gorm"
)

type AccountGroup struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_account_group_company_code;index" json:"company_id"`

	GroupCode     string  `gorm:"type:varchar(50);not null;uniqueIndex:idx_account_group_company_code" json:"group_code"`
	GroupName     string  `gorm:"type:varchar(150);not null" json:"group_name"`
	AccountType   string  `gorm:"type:varchar(50);not null;index" json:"account_type"`
	ParentGroupID *uint64 `gorm:"index" json:"parent_group_id"`
	Description   string  `gorm:"type:text" json:"description"`
	Status        string  `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64        `json:"created_by,omitempty"`
	UpdatedBy *uint64        `json:"updated_by,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Parent   *AccountGroup  `gorm:"foreignKey:ParentGroupID;references:ID" json:"parent_group,omitempty"`
	Children []AccountGroup `gorm:"foreignKey:ParentGroupID;references:ID" json:"children,omitempty"`
}

func (AccountGroup) TableName() string {
	return "account_groups"
}
