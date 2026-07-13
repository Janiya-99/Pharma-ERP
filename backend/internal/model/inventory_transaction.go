package model

// InventoryTransaction represents an immutable audit log of all stock movements.
type InventoryTransaction struct {
	BaseModel
	BatchID       uint64  `gorm:"not null;index" json:"batch_id"`
	Type          string  `gorm:"type:enum('GRN', 'Dispatch', 'Return');not null" json:"type"`
	Qty           int     `gorm:"not null" json:"qty"`
	ReferenceType string  `gorm:"size:50;not null" json:"reference_type"` // e.g., "sales_invoice", "credit_note"
	ReferenceID   uint64  `gorm:"not null;index" json:"reference_id"`

	// Relationships
	Batch *ProductBatch `gorm:"foreignKey:BatchID" json:"batch,omitempty"`
}

func (InventoryTransaction) TableName() string {
	return "inventory_transactions"
}
