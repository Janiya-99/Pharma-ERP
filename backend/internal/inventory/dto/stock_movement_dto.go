package dto

import "time"

type StockInPayload struct {
	CompanyID           uint64    `json:"company_id" validate:"required"`
	BranchID            uint64    `json:"branch_id" validate:"required"`
	WarehouseID         uint64    `json:"warehouse_id" validate:"required"`
	WarehouseLocationID *uint64   `json:"warehouse_location_id"`
	ProductID           uint64    `json:"product_id" validate:"required"`
	ProductBatchID      *uint64   `json:"product_batch_id"`
	TransactionDate     time.Time `json:"transaction_date" validate:"required"`
	SourceType          string    `json:"source_type" validate:"required"`
	SourceID            uint64    `json:"source_id" validate:"required"`
	SourceNumber        string    `json:"source_number" validate:"required"`
	Quantity            float64   `json:"quantity" validate:"required,gt=0"`
	UnitCost            float64   `json:"unit_cost" validate:"gte=0"`
	Remarks             string    `json:"remarks"`
	CreatedBy           uint64    `json:"created_by" validate:"required"`

	AllowExpiredBatch  bool `json:"allow_expired_batch"`
	AllowBlockedBatch  bool `json:"allow_blocked_batch"`
	AllowRecalledBatch bool `json:"allow_recalled_batch"`
}

type StockOutPayload struct {
	CompanyID           uint64    `json:"company_id" validate:"required"`
	BranchID            uint64    `json:"branch_id" validate:"required"`
	WarehouseID         uint64    `json:"warehouse_id" validate:"required"`
	WarehouseLocationID *uint64   `json:"warehouse_location_id"`
	ProductID           uint64    `json:"product_id" validate:"required"`
	ProductBatchID      *uint64   `json:"product_batch_id"`
	TransactionDate     time.Time `json:"transaction_date" validate:"required"`
	SourceType          string    `json:"source_type" validate:"required"`
	SourceID            uint64    `json:"source_id" validate:"required"`
	SourceNumber        string    `json:"source_number" validate:"required"`
	Quantity            float64   `json:"quantity" validate:"required,gt=0"`
	UnitCost            float64   `json:"unit_cost" validate:"gte=0"`
	Remarks             string    `json:"remarks"`
	CreatedBy           uint64    `json:"created_by" validate:"required"`
}
