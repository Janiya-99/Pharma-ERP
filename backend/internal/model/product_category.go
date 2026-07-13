package model

// ProductCategory bridges physical items to dynamic financial accounts.
type ProductCategory struct {
	BaseModel
	Name               string `gorm:"column:name;size:255;not null" json:"name"`
	InventoryAccountID uint64 `gorm:"column:inventory_account_id;not null" json:"inventory_account_id"`
	CogsAccountID      uint64 `gorm:"column:cogs_account_id;not null" json:"cogs_account_id"`
	RevenueAccountID   uint64 `gorm:"column:revenue_account_id;not null" json:"revenue_account_id"`

	// Relationships
	InventoryAccount *ChartOfAccounts `gorm:"foreignKey:InventoryAccountID" json:"inventory_account,omitempty"`
	CogsAccount      *ChartOfAccounts `gorm:"foreignKey:CogsAccountID" json:"cogs_account,omitempty"`
	RevenueAccount   *ChartOfAccounts `gorm:"foreignKey:RevenueAccountID" json:"revenue_account,omitempty"`
}

func (ProductCategory) TableName() string {
	return "product_categories"
}
