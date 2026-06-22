package model

// Warehouse represents a physical location where products and batches are stored.
type Warehouse struct {
	BaseModel
	Name     string `gorm:"size:255;not null" json:"name"`
	Code     string `gorm:"size:50;not null;unique" json:"code"`
	BranchID uint64 `gorm:"not null;index" json:"branch_id"` // Link to branch
	Address  string `gorm:"type:text" json:"address"`
	Status   string `gorm:"type:enum('Active', 'Inactive');default:'Active'" json:"status"`

	// Relationships
	Branch  *Branch        `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Batches []ProductBatch `gorm:"foreignKey:WarehouseID" json:"batches,omitempty"`
}
