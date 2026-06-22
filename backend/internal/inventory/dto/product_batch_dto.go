package dto

type CreateProductBatchRequest struct {
	ProductID       uint64  `json:"product_id" binding:"required"`
	BatchNumber     string  `json:"batch_number" binding:"required"`
	ManufactureDate *string `json:"manufacture_date"`
	ExpiryDate      *string `json:"expiry_date"`
	SupplierID      *uint64 `json:"supplier_id"`
	ManufacturerID  *uint64 `json:"manufacturer_id"`
	PurchaseRate    float64 `json:"purchase_rate" binding:"gte=0"`
	SellingPrice    float64 `json:"selling_price" binding:"gte=0"`
	MRP             float64 `json:"mrp" binding:"gte=0"`
	BatchStatus     string  `json:"batch_status" binding:"required,oneof=active inactive"`
}

type UpdateProductBatchRequest struct {
	BatchNumber     string  `json:"batch_number" binding:"required"`
	ManufactureDate *string `json:"manufacture_date"`
	ExpiryDate      *string `json:"expiry_date"`
	SupplierID      *uint64 `json:"supplier_id"`
	ManufacturerID  *uint64 `json:"manufacturer_id"`
	PurchaseRate    float64 `json:"purchase_rate" binding:"gte=0"`
	SellingPrice    float64 `json:"selling_price" binding:"gte=0"`
	MRP             float64 `json:"mrp" binding:"gte=0"`
	BatchStatus     string  `json:"batch_status" binding:"required,oneof=active inactive"`
}

type BlockProductBatchRequest struct {
	BlockReason string `json:"block_reason" binding:"required"`
}
