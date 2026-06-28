package dto

import "time"

type OpeningStockLinePayload struct {
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	ProductID           uint64  `json:"product_id" validate:"required"`
	ProductBatchID      *uint64 `json:"product_batch_id"`
	Quantity            float64 `json:"quantity" validate:"required,gt=0"`
	UnitCost            float64 `json:"unit_cost" validate:"gte=0"`
	LineRemarks         string  `json:"line_remarks"`
}

type CreateOpeningStockPayload struct {
	CompanyID          uint64                    `json:"-"`
	CreatedBy          uint64                    `json:"-"`
	BranchID           uint64                    `json:"branch_id" validate:"required"`
	FinancialYearID    *uint64                   `json:"financial_year_id"`
	AccountingPeriodID *uint64                   `json:"accounting_period_id"`
	OpeningStockDate   string                    `json:"opening_stock_date" validate:"required"`
	WarehouseID        uint64                    `json:"warehouse_id" validate:"required"`
	ReferenceNumber    string                    `json:"reference_number"`
	Remarks            string                    `json:"remarks"`
	Lines              []OpeningStockLinePayload `json:"lines" validate:"required,min=1"`
}

type UpdateOpeningStockPayload struct {
	CompanyID          uint64                    `json:"-"`
	UpdatedBy          uint64                    `json:"-"`
	BranchID           uint64                    `json:"branch_id" validate:"required"`
	FinancialYearID    *uint64                   `json:"financial_year_id"`
	AccountingPeriodID *uint64                   `json:"accounting_period_id"`
	OpeningStockDate   string                    `json:"opening_stock_date" validate:"required"`
	WarehouseID        uint64                    `json:"warehouse_id" validate:"required"`
	ReferenceNumber    string                    `json:"reference_number"`
	Remarks            string                    `json:"remarks"`
	Lines              []OpeningStockLinePayload `json:"lines" validate:"required,min=1"`
}

type ActionOpeningStockPayload struct {
	Remarks string `json:"remarks"`
}

type OpeningStockFilter struct {
	CompanyID            uint64 `json:"-"`
	BranchID             uint64 `json:"branch_id"`
	WarehouseID          uint64 `json:"warehouse_id"`
	FinancialYearID      uint64 `json:"financial_year_id"`
	AccountingPeriodID   uint64 `json:"accounting_period_id"`
	ApprovalStatus       string `json:"approval_status"`
	PostedStatus         string `json:"posted_status"`
	OpeningStockDateFrom string `json:"opening_stock_date_from"`
	OpeningStockDateTo   string `json:"opening_stock_date_to"`
	Search               string `json:"search"`
	Page                 int    `json:"page"`
	Limit                int    `json:"limit"`
}

type OpeningStockResponse struct {
	ID                 uint64    `json:"id"`
	OpeningStockNumber string    `json:"opening_stock_number"`
	OpeningStockDate   time.Time `json:"opening_stock_date"`
	BranchID           uint64    `json:"branch_id"`
	WarehouseID        uint64    `json:"warehouse_id"`
	ReferenceNumber    string    `json:"reference_number"`
	TotalQuantity      float64   `json:"total_quantity"`
	TotalStockValue    float64   `json:"total_stock_value"`
	ApprovalStatus     string    `json:"approval_status"`
	PostedStatus       string    `json:"posted_status"`
	CreatedBy          uint64    `json:"created_by"`
	CreatedAt          time.Time `json:"created_at"`
}
