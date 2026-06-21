package models

import (
	"time"

	"gorm.io/gorm"
)

// AccountingPeriod represents a monthly or custom accounting period within a financial year.
type AccountingPeriod struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID       uint64 `gorm:"not null;uniqueIndex:idx_ap_company_fy_period" json:"company_id"`
	FinancialYearID uint64 `gorm:"not null;uniqueIndex:idx_ap_company_fy_period;index:idx_ap_fy" json:"financial_year_id"`

	PeriodName string    `gorm:"type:varchar(100);not null;uniqueIndex:idx_ap_company_fy_period" json:"period_name"`
	StartDate  time.Time `gorm:"type:date;not null" json:"start_date"`
	EndDate    time.Time `gorm:"type:date;not null" json:"end_date"`

	IsClosed bool   `gorm:"default:false" json:"is_closed"`
	Status   string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	FinancialYear FinancialYear `gorm:"foreignKey:FinancialYearID" json:"financial_year,omitempty"`
}

func (AccountingPeriod) TableName() string {
	return "accounting_periods"
}
