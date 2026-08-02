package dto

import "time"

type CreateStockTransferRequest struct {
	BranchID           uint64  `json:"branch_id" validate:"required"`
	FromWarehouseID    uint64  `json:"from_warehouse_id" validate:"required"`
	ToWarehouseID      uint64  `json:"to_warehouse_id" validate:"required"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	TransferDate    string `json:"transfer_date" validate:"required"`
	ReferenceNumber string `json:"reference_number"`
	Remarks         string `json:"remarks"`

	Lines []CreateStockTransferLineRequest `json:"lines" validate:"required,min=1,dive"`
}

type CreateStockTransferLineRequest struct {
	FromWarehouseLocationID *uint64 `json:"from_warehouse_location_id"`
	ToWarehouseLocationID   *uint64 `json:"to_warehouse_location_id"`
	ProductID               uint64  `json:"product_id" validate:"required"`
	ProductBatchID          *uint64 `json:"product_batch_id"`
	Quantity                float64 `json:"quantity" validate:"required,gt=0"`
	LineRemarks             string  `json:"line_remarks"`
	LineOrder               int     `json:"line_order"`
}

type UpdateStockTransferRequest struct {
	BranchID           uint64  `json:"branch_id" validate:"required"`
	FromWarehouseID    uint64  `json:"from_warehouse_id" validate:"required"`
	ToWarehouseID      uint64  `json:"to_warehouse_id" validate:"required"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	TransferDate    string `json:"transfer_date" validate:"required"`
	ReferenceNumber string `json:"reference_number"`
	Remarks         string `json:"remarks"`

	Lines []CreateStockTransferLineRequest `json:"lines" validate:"required,min=1,dive"`
}

type SubmitStockTransferRequest struct {
	Remarks string `json:"remarks"`
}

type ApproveStockTransferRequest struct {
	Remarks string `json:"remarks"`
}

type RejectStockTransferRequest struct {
	Remarks string `json:"remarks" validate:"required"`
}

type ListStockTransfersFilters struct {
	BranchID           *uint64 `form:"branch_id"`
	FromWarehouseID    *uint64 `form:"from_warehouse_id"`
	ToWarehouseID      *uint64 `form:"to_warehouse_id"`
	FinancialYearID    *uint64 `form:"financial_year_id"`
	AccountingPeriodID *uint64 `form:"accounting_period_id"`
	ApprovalStatus     string  `form:"approval_status"`
	PostedStatus       string  `form:"posted_status"`
	TransferDateFrom   string  `form:"transfer_date_from"`
	TransferDateTo     string  `form:"transfer_date_to"`
	Search             string  `form:"search"`
	Page               int     `form:"page" validate:"gte=1"`
	Limit              int     `form:"limit" validate:"gte=1"`
}

// Responses
type StockTransferResponse struct {
	ID                 uint64     `json:"id"`
	CompanyID          uint64     `json:"company_id"`
	BranchID           uint64     `json:"branch_id"`
	FromWarehouseID    uint64     `json:"from_warehouse_id"`
	ToWarehouseID      uint64     `json:"to_warehouse_id"`
	FinancialYearID    *uint64    `json:"financial_year_id"`
	AccountingPeriodID *uint64    `json:"accounting_period_id"`
	TransferNumber     string     `json:"transfer_number"`
	TransferDate       time.Time  `json:"transfer_date"`
	ReferenceNumber    string     `json:"reference_number"`
	Remarks            string     `json:"remarks"`
	TotalQuantity      float64    `json:"total_quantity"`
	TotalStockValue    float64    `json:"total_stock_value"`
	ApprovalStatus     string     `json:"approval_status"`
	ApprovedBy         *uint64    `json:"approved_by"`
	ApprovedAt         *time.Time `json:"approved_at"`
	PostedStatus       string     `json:"posted_status"`
	PostedBy           *uint64    `json:"posted_by"`
	PostedAt           *time.Time `json:"posted_at"`
	Status             string     `json:"status"`
	CreatedBy          uint64     `json:"created_by"`
	UpdatedBy          uint64     `json:"updated_by"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`

	Branch        interface{} `json:"branch,omitempty"`
	FromWarehouse interface{} `json:"from_warehouse,omitempty"`
	ToWarehouse   interface{} `json:"to_warehouse,omitempty"`
	Lines         interface{} `json:"lines,omitempty"`
	Approvals     interface{} `json:"approvals,omitempty"`
}
