package model

// Product represents an item in the inventory.
type Product struct {
	BaseModel
	Code         string `gorm:"size:100;not null;unique" json:"code"`
	Name         string `gorm:"size:255;not null" json:"name"`
	GenericName  string `gorm:"size:255" json:"generic_name"`
	Brand        string `gorm:"size:255" json:"brand"`
	Category     string `gorm:"size:100" json:"category"`
	Manufacturer string `gorm:"size:255" json:"manufacturer"`
	DosageForm   string `gorm:"size:100" json:"dosage_form"`
	Strength     string `gorm:"size:100" json:"strength"`
	PackSize     string `gorm:"size:100" json:"pack_size"`
	Unit         string `gorm:"size:50" json:"unit"`
	ReorderLevel int    `gorm:"default:0" json:"reorder_level"`
	Status       string `gorm:"type:enum('Active', 'Inactive');default:'Active'" json:"status"`

	// Relationships
	Batches []ProductBatch `gorm:"foreignKey:ProductID" json:"batches,omitempty"`
}
