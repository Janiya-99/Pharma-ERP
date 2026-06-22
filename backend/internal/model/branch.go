package model

// Branch represents a physical location or division within a company.
type Branch struct {
	BaseModel
	CompanyScopedModel
	Name     string `gorm:"size:255;not null" json:"name"`
	Code     string `gorm:"size:50;uniqueIndex:idx_branch_code;not null" json:"code"`
	Address  string `gorm:"size:500" json:"address"`
	Phone    string `gorm:"size:50" json:"phone"`
	IsActive bool   `gorm:"default:true;not null" json:"is_active"`
	// Relationships
	Company Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}

func (Branch) TableName() string {
	return "branches"
}
