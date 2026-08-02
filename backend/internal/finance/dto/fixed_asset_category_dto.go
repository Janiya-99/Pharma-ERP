package dto

type CreateFixedAssetCategoryRequest struct {
	CategoryCode string `json:"category_code" binding:"required"`
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`

	DefaultAssetAccountID                   uint64  `json:"default_asset_account_id" binding:"required"`
	DefaultAccumulatedDepreciationAccountID uint64  `json:"default_accumulated_depreciation_account_id" binding:"required"`
	DefaultDepreciationExpenseAccountID     uint64  `json:"default_depreciation_expense_account_id" binding:"required"`
	DefaultGainOnDisposalAccountID          *uint64 `json:"default_gain_on_disposal_account_id"`
	DefaultLossOnDisposalAccountID          *uint64 `json:"default_loss_on_disposal_account_id"`

	DefaultUsefulLifeMonths   int    `json:"default_useful_life_months" binding:"required,gt=0"`
	DefaultDepreciationMethod string `json:"default_depreciation_method" binding:"omitempty"`

	Status string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateFixedAssetCategoryRequest struct {
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`

	DefaultAssetAccountID                   uint64  `json:"default_asset_account_id" binding:"required"`
	DefaultAccumulatedDepreciationAccountID uint64  `json:"default_accumulated_depreciation_account_id" binding:"required"`
	DefaultDepreciationExpenseAccountID     uint64  `json:"default_depreciation_expense_account_id" binding:"required"`
	DefaultGainOnDisposalAccountID          *uint64 `json:"default_gain_on_disposal_account_id"`
	DefaultLossOnDisposalAccountID          *uint64 `json:"default_loss_on_disposal_account_id"`

	DefaultUsefulLifeMonths   int    `json:"default_useful_life_months" binding:"required,gt=0"`
	DefaultDepreciationMethod string `json:"default_depreciation_method" binding:"omitempty"`

	Status string `json:"status" binding:"required,oneof=active inactive"`
}
