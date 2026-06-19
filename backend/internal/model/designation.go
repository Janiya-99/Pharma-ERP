package model

// Designation represents a user's professional title or role within a company.
type Designation struct {
	BaseModel
	CompanyScopedModel
	Name        string `gorm:"size:255;not null" json:"name"`
	Description string `gorm:"size:255" json:"description"`
}

func (Designation) TableName() string {
	return "designations"
}
