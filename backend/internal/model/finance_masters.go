package model

import "time"

// FinanceMainCategoryType maps to `finance_main_category_types`
type FinanceMainCategoryType struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Code      string    `gorm:"column:code;size:10;uniqueIndex;not null" json:"code"`
	Name      string    `gorm:"column:name;size:100;not null" json:"name"`
	CreatedAt time.Time `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;not null" json:"updated_at"`
}

func (FinanceMainCategoryType) TableName() string {
	return "finance_main_category_types"
}

// FinanceMainCategory maps to `finance_main_categories`
type FinanceMainCategory struct {
	ID                 uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	MainCategoryTypeID uint64    `gorm:"column:main_category_type_id;not null" json:"main_category_type_id"`
	Code               string    `gorm:"column:code;size:20;uniqueIndex;not null" json:"code"`
	Name               string    `gorm:"column:name;size:150;not null" json:"name"`
	CreatedAt          time.Time `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at;not null" json:"updated_at"`

	// Relationships
	MainCategoryType *FinanceMainCategoryType `gorm:"foreignKey:MainCategoryTypeID" json:"main_category_type,omitempty"`
}

func (FinanceMainCategory) TableName() string {
	return "finance_main_categories"
}

// FinanceSubCategory maps to `finance_sub_categories`
type FinanceSubCategory struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	MainCategoryID uint64    `gorm:"column:main_category_id;not null" json:"main_category_id"`
	Name           string    `gorm:"column:name;size:150;not null" json:"name"`
	CreatedAt      time.Time `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at;not null" json:"updated_at"`

	// Relationships
	MainCategory *FinanceMainCategory `gorm:"foreignKey:MainCategoryID" json:"main_category,omitempty"`
}

func (FinanceSubCategory) TableName() string {
	return "finance_sub_categories"
}

// FinanceCategory maps to `finance_categories`
type FinanceCategory struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SubCategoryID uint64    `gorm:"column:sub_category_id;not null" json:"sub_category_id"`
	Name          string    `gorm:"column:name;size:150;not null" json:"name"`
	CreatedAt     time.Time `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;not null" json:"updated_at"`

	// Relationships
	SubCategory *FinanceSubCategory `gorm:"foreignKey:SubCategoryID" json:"sub_category,omitempty"`
}

func (FinanceCategory) TableName() string {
	return "finance_categories"
}

// Supplier maps to `finance_suppliers`
type Supplier struct {
	BaseModel
	Name      string  `gorm:"column:name;size:255;not null;index" json:"name"`
	PVNICNo   *string `gorm:"column:pv_nic_no;size:50" json:"pv_nic_no,omitempty"`
	Address   *string `gorm:"column:address;type:text" json:"address,omitempty"`
	GlID      uint64  `gorm:"column:gl_id;not null" json:"gl_id"`
	ContactNo *string `gorm:"column:contact_no;size:20" json:"contact_no,omitempty"`
	Email     *string `gorm:"column:email;size:150" json:"email,omitempty"`
	Type      int     `gorm:"column:type;type:tinyint;default:1" json:"type"` // 1-Local, 2-Foreign

	// Relationships
	Account *ChartOfAccounts `gorm:"foreignKey:GlID" json:"account,omitempty"`
}

func (Supplier) TableName() string {
	return "finance_suppliers"
}

// Customer maps to `finance_customers`
type Customer struct {
	BaseModel
	Name      string  `gorm:"column:name;size:255;not null;index" json:"name"`
	Type      int     `gorm:"column:type;type:tinyint;default:1" json:"type"` // 1-Retail, 2-Corporate
	Address   *string `gorm:"column:address;type:text" json:"address,omitempty"`
	GlID      uint64  `gorm:"column:gl_id;not null" json:"gl_id"`
	ContactNo *string `gorm:"column:contact_no;size:20" json:"contact_no,omitempty"`
	Email     *string `gorm:"column:email;size:150" json:"email,omitempty"`
	BranchID  uint64  `gorm:"column:branch_id;not null;index" json:"branch_id"`

	// Relationships
	Account *ChartOfAccounts `gorm:"foreignKey:GlID" json:"account,omitempty"`
	Branch  *Branch          `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
}

func (Customer) TableName() string {
	return "finance_customers"
}
