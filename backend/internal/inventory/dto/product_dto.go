package dto

type BarcodeDTO struct {
	Barcode     string `json:"barcode" binding:"required"`
	BarcodeType string `json:"barcode_type" binding:"required"`
}

type CreateProductRequest struct {
	ProductCode              string       `json:"product_code" binding:"required"`
	ProductName              string       `json:"product_name" binding:"required"`
	ProductCategoryID        *uint64      `json:"product_category_id"`
	GenericNameID            *uint64      `json:"generic_name_id"`
	DosageFormID             *uint64      `json:"dosage_form_id"`
	ManufacturerID           *uint64      `json:"manufacturer_id"`
	BaseUnitID               uint64       `json:"base_unit_id" binding:"required"`
	Strength                 string       `json:"strength"`
	PackSize                 string       `json:"pack_size"`
	ProductType              string       `json:"product_type" binding:"required"`
	RequiresBatchTracking    bool         `json:"requires_batch_tracking"`
	RequiresExpiryTracking   bool         `json:"requires_expiry_tracking"`
	StorageCondition         string       `json:"storage_condition"`
	ReorderLevel             float64      `json:"reorder_level"`
	ReorderQuantity          float64      `json:"reorder_quantity"`
	PurchaseAccountID        *uint64      `json:"purchase_account_id"`
	SalesAccountID           *uint64      `json:"sales_account_id"`
	InventoryAccountID       *uint64      `json:"inventory_account_id"`
	CostOfGoodsSoldAccountID *uint64      `json:"cost_of_goods_sold_account_id"`
	NMRARegistrationNumber   string       `json:"nmra_registration_number"`
	NMRAExpiryDate           *string      `json:"nmra_expiry_date"`
	Barcodes                 []BarcodeDTO `json:"barcodes"`
	Status                   string       `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateProductRequest struct {
	ProductCode              string       `json:"product_code" binding:"required"`
	ProductName              string       `json:"product_name" binding:"required"`
	ProductCategoryID        *uint64      `json:"product_category_id"`
	GenericNameID            *uint64      `json:"generic_name_id"`
	DosageFormID             *uint64      `json:"dosage_form_id"`
	ManufacturerID           *uint64      `json:"manufacturer_id"`
	BaseUnitID               uint64       `json:"base_unit_id" binding:"required"`
	Strength                 string       `json:"strength"`
	PackSize                 string       `json:"pack_size"`
	ProductType              string       `json:"product_type" binding:"required"`
	RequiresBatchTracking    bool         `json:"requires_batch_tracking"`
	RequiresExpiryTracking   bool         `json:"requires_expiry_tracking"`
	StorageCondition         string       `json:"storage_condition"`
	ReorderLevel             float64      `json:"reorder_level"`
	ReorderQuantity          float64      `json:"reorder_quantity"`
	PurchaseAccountID        *uint64      `json:"purchase_account_id"`
	SalesAccountID           *uint64      `json:"sales_account_id"`
	InventoryAccountID       *uint64      `json:"inventory_account_id"`
	CostOfGoodsSoldAccountID *uint64      `json:"cost_of_goods_sold_account_id"`
	NMRARegistrationNumber   string       `json:"nmra_registration_number"`
	NMRAExpiryDate           *string      `json:"nmra_expiry_date"`
	Barcodes                 []BarcodeDTO `json:"barcodes"`
	Status                   string       `json:"status" binding:"required,oneof=active inactive"`
}
