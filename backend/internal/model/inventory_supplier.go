package model

// InventorySupplier represents a vendor supplying products for the inventory module.
type InventorySupplier struct {
	BaseModel
	Code        string `gorm:"size:50;not null;unique" json:"code"`
	Name        string `gorm:"size:255;not null" json:"name"`
	Email       string `gorm:"size:255" json:"email"`
	Phone       string `gorm:"size:50" json:"phone"`
	CreditTerms string `gorm:"size:100" json:"credit_terms"`
	Status      string `gorm:"type:enum('Active', 'Inactive');default:'Active'" json:"status"`

	// Relationships
	GRNs []GRN `gorm:"foreignKey:SupplierID" json:"grns,omitempty"`
}

func (InventorySupplier) TableName() string {
	return "suppliers"
}
