package models

import (
	"time"

	"gorm.io/gorm"
)

// FinancialYear represents a company's fiscal year period.
type FinancialYear struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64 `gorm:"not null;uniqueIndex:idx_fy_company_year" json:"company_id"`

	YearName  string    `gorm:"type:varchar(100);not null;uniqueIndex:idx_fy_company_year" json:"year_name"`
	StartDate time.Time `gorm:"type:date;not null" json:"start_date"`
	EndDate   time.Time `gorm:"type:date;not null" json:"end_date"`

	IsActive bool   `gorm:"default:false" json:"is_active"`
	IsClosed bool   `gorm:"default:false" json:"is_closed"`
	Status   string `gorm:"type:varchar(30);default:active" json:"status"`

	CreatedBy *uint64 `json:"created_by,omitempty"`
	UpdatedBy *uint64 `json:"updated_by,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (FinancialYear) TableName() string {
	return "financial_years"
}
