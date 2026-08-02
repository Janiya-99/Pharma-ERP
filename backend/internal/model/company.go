package model

// Company represents a business entity in the ERP system.
// All data is scoped to a company for multi-tenant isolation.
type Company struct {
	BaseModel
	Name     string `gorm:"size:255;not null" json:"name"`
	Code     string `gorm:"size:50;uniqueIndex;not null" json:"code"`
	TaxID    string `gorm:"size:100" json:"tax_id"`
	Address  string `gorm:"size:500" json:"address"`
	Phone    string `gorm:"size:50" json:"phone"`
	Email    string `gorm:"size:255" json:"email"`
	IsActive bool   `gorm:"default:true;not null" json:"is_active"`
	// Relationships
	Branches []Branch `gorm:"foreignKey:CompanyID" json:"branches,omitempty"`
	Users    []User   `gorm:"foreignKey:CompanyID" json:"users,omitempty"`
}

func (Company) TableName() string {
	return "companies"
}
