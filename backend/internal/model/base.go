package model

import (
	"time"

	"gorm.io/gorm"
)

// BaseModel provides common fields for all models.
// Like Laravel's Model base class with id, timestamps, and soft delete.
type BaseModel struct {
	ID        uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CreatedAt time.Time      `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TenantModel provides company and branch scoping for multi-tenant isolation.
// Embedded in all models that require tenant-level data separation.
type TenantModel struct {
	CompanyID uint64 `gorm:"not null;index:idx_tenant,priority:1" json:"company_id"`
	BranchID  uint64 `gorm:"not null;index:idx_tenant,priority:2" json:"branch_id"`
}

// CompanyScopedModel provides company-level scoping (no branch restriction).
type CompanyScopedModel struct {
	CompanyID uint64 `gorm:"not null;index" json:"company_id"`
}

// --- GORM Scopes (like Laravel's query scopes) ---

// ScopeByCompany filters records by company_id.
// Usage: db.Scopes(model.ScopeByCompany(companyID)).Find(&results)
func ScopeByCompany(companyID uint64) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("company_id = ?", companyID)
	}
}

// ScopeByBranch filters records by company_id and branch_id.
func ScopeByBranch(companyID, branchID uint64) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("company_id = ? AND branch_id = ?", companyID, branchID)
	}
}

// ScopeActive filters records to only active ones.
func ScopeActive() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("is_active = ?", true)
	}
}
