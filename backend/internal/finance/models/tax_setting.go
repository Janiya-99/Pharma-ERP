package models

import (
	"time"

	"gorm.io/gorm"
)

type TaxSetting struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_tax_setting_company_code;index" json:"company_id"`

	TaxCode      string  `gorm:"type:varchar(50);not null;uniqueIndex:idx_tax_setting_company_code" json:"tax_code"`
	TaxName      string  `gorm:"type:varchar(150);not null" json:"tax_name"`
	TaxRate      float64 `gorm:"type:decimal(8,4);default:0" json:"tax_rate"`
	TaxAccountID *uint64 `gorm:"index" json:"tax_account_id"`
	Description  string  `gorm:"type:text" json:"description"`
	Status       string  `gorm:"type:varchar(30);default:'active'" json:"status"`

	CreatedBy *uint64        `json:"created_by,omitempty"`
	UpdatedBy *uint64        `json:"updated_by,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TaxAccount *ChartOfAccount `gorm:"foreignKey:TaxAccountID;references:ID" json:"tax_account,omitempty"`
}

func (TaxSetting) TableName() string {
	return "tax_settings"
}
