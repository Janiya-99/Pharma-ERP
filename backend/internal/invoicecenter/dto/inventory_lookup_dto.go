package dto

type InvoiceInventoryProductLookup struct {
	ProductID      uint64  `json:"product_id"`
	ProductCode    string  `json:"product_code"`
	ProductName    string  `json:"product_name"`
	BaseUnit       string  `json:"base_unit"`
	BatchTracking  bool    `json:"batch_tracking"`
	ExpiryTracking bool    `json:"expiry_tracking"`
	SellingPrice   float64 `json:"selling_price"`
	MRP            float64 `json:"mrp"`
	Status         string  `json:"status"`
}

type InvoiceInventoryBatchLookup struct {
	ProductBatchID    uint64  `json:"product_batch_id"`
	ProductID         uint64  `json:"product_id"`
	BatchNumber       string  `json:"batch_number"`
	ExpiryDate        *string `json:"expiry_date"`
	ManufacturingDate *string `json:"manufacturing_date"`
	BatchStatus       string  `json:"batch_status"`
	MRP               float64 `json:"mrp"`
	SellingPrice      float64 `json:"selling_price"`
	StockUnitCost     float64 `json:"stock_unit_cost"`
}

type InvoiceStockAvailabilityLookup struct {
	ProductID           uint64  `json:"product_id"`
	ProductBatchID      *uint64 `json:"product_batch_id"`
	WarehouseID         uint64  `json:"warehouse_id"`
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	AvailableQuantity   float64 `json:"available_quantity"`
	ReservedQuantity    float64 `json:"reserved_quantity"`
	BlockedQuantity     float64 `json:"blocked_quantity"`
	ExpiryDate          *string `json:"expiry_date"`
	BatchStatus         string  `json:"batch_status"`
	StockUnitCost       float64 `json:"stock_unit_cost"`
	SellingPrice        float64 `json:"selling_price"`
	MRP                 float64 `json:"mrp"`
}

type InvoiceWarehouseLookup struct {
	WarehouseID   uint64 `json:"warehouse_id"`
	BranchID      uint64 `json:"branch_id"`
	WarehouseCode string `json:"warehouse_code"`
	WarehouseName string `json:"warehouse_name"`
	WarehouseType string `json:"warehouse_type"`
	IsDefault     bool   `json:"is_default"`
	Status        string `json:"status"`
}

type InvoiceWarehouseLocationLookup struct {
	WarehouseLocationID uint64 `json:"warehouse_location_id"`
	WarehouseID         uint64 `json:"warehouse_id"`
	LocationCode        string `json:"location_code"`
	LocationName        string `json:"location_name"`
	Rack                string `json:"rack"`
	Shelf               string `json:"shelf"`
	Bin                 string `json:"bin"`
	StorageCondition    string `json:"storage_condition"`
	Status              string `json:"status"`
}
