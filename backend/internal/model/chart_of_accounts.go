package model

// ChartOfAccounts represents an account in the chart of accounts (COA).
// Enforces 3NF compliance by referencing ONLY CategoryID.
// Main/Sub relations resolve transitively via JOINs.
type ChartOfAccounts struct {
	BaseModel
	CategoryID  uint64 `gorm:"column:category_id;not null;index" json:"category_id"`
	GLCode      string `gorm:"column:gl_code;size:30;uniqueIndex;not null" json:"gl_code"`
	Name        string `gorm:"column:name;size:150;not null" json:"name"`
	IsCashBank  bool   `gorm:"column:is_cash_bank;default:false;not null;index:idx_coa_flags" json:"is_cash_bank"`
	ShowToPO    bool   `gorm:"column:show_to_po;default:false;not null;index:idx_coa_flags" json:"show_to_po"`
	InterBranch bool   `gorm:"column:inter_branch;default:false;not null;index:idx_coa_flags" json:"inter_branch"`
	// Relationships
	Category *FinanceCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (ChartOfAccounts) TableName() string {
	return "finance_chart_of_accounts"
}
