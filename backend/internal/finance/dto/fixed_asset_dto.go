package dto

type CreateFixedAssetRequest struct {
	BranchID             uint64 `json:"branch_id" binding:"required"`
	FixedAssetCategoryID uint64 `json:"fixed_asset_category_id" binding:"required"`

	AssetCode   string `json:"asset_code" binding:"required"`
	AssetName   string `json:"asset_name" binding:"required"`
	Description string `json:"description"`

	SerialNumber string `json:"serial_number"`
	ModelNumber  string `json:"model_number"`
	Manufacturer string `json:"manufacturer"`

	PurchaseDate    string `json:"purchase_date" binding:"required"`
	AcquisitionDate string `json:"acquisition_date" binding:"required"`
	SupplierName    string `json:"supplier_name"`
	InvoiceNumber   string `json:"invoice_number"`

	AcquisitionCost float64 `json:"acquisition_cost" binding:"required,gt=0"`
	ResidualValue   float64 `json:"residual_value" binding:"gte=0"`

	UsefulLifeMonths   int    `json:"useful_life_months" binding:"required,gt=0"`
	DepreciationMethod string `json:"depreciation_method" binding:"omitempty"`

	DepreciationStartDate string `json:"depreciation_start_date" binding:"required"`

	AssetAccountID                   uint64  `json:"asset_account_id" binding:"required"`
	AccumulatedDepreciationAccountID uint64  `json:"accumulated_depreciation_account_id" binding:"required"`
	DepreciationExpenseAccountID     uint64  `json:"depreciation_expense_account_id" binding:"required"`
	GainOnDisposalAccountID          *uint64 `json:"gain_on_disposal_account_id"`
	LossOnDisposalAccountID          *uint64 `json:"loss_on_disposal_account_id"`

	Status string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateFixedAssetRequest struct {
	AssetName   string `json:"asset_name" binding:"required"`
	Description string `json:"description"`

	SerialNumber string `json:"serial_number"`
	ModelNumber  string `json:"model_number"`
	Manufacturer string `json:"manufacturer"`

	PurchaseDate    string `json:"purchase_date" binding:"required"`
	AcquisitionDate string `json:"acquisition_date" binding:"required"`
	SupplierName    string `json:"supplier_name"`
	InvoiceNumber   string `json:"invoice_number"`

	AcquisitionCost float64 `json:"acquisition_cost" binding:"required,gt=0"`
	ResidualValue   float64 `json:"residual_value" binding:"gte=0"`

	UsefulLifeMonths   int    `json:"useful_life_months" binding:"required,gt=0"`
	DepreciationMethod string `json:"depreciation_method" binding:"omitempty"`

	DepreciationStartDate string `json:"depreciation_start_date" binding:"required"`

	AssetAccountID                   uint64  `json:"asset_account_id" binding:"required"`
	AccumulatedDepreciationAccountID uint64  `json:"accumulated_depreciation_account_id" binding:"required"`
	DepreciationExpenseAccountID     uint64  `json:"depreciation_expense_account_id" binding:"required"`
	GainOnDisposalAccountID          *uint64 `json:"gain_on_disposal_account_id"`
	LossOnDisposalAccountID          *uint64 `json:"loss_on_disposal_account_id"`

	Status string `json:"status" binding:"required,oneof=active inactive"`
}
