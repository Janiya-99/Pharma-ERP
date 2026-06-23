package dto

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
)

type StockAdjustmentLineRequest struct {
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	ProductID           uint64  `json:"product_id" validate:"required"`
	ProductBatchID      *uint64 `json:"product_batch_id"`
	AdjustmentDirection string  `json:"adjustment_direction" validate:"required,oneof=in out"`
	Quantity            float64 `json:"quantity" validate:"required,gt=0"`
	UnitCost            float64 `json:"unit_cost" validate:"gte=0"`
	SystemQuantity      float64 `json:"system_quantity"`
	PhysicalQuantity    float64 `json:"physical_quantity"`
	VarianceQuantity    float64 `json:"variance_quantity"`
	LineReason          string  `json:"line_reason"`
	LineRemarks         string  `json:"line_remarks"`
}

type StockAdjustmentCreateRequest struct {
	BranchID           uint64                       `json:"branch_id" validate:"required"`
	WarehouseID        uint64                       `json:"warehouse_id" validate:"required"`
	FinancialYearID    *uint64                      `json:"financial_year_id"`
	AccountingPeriodID *uint64                      `json:"accounting_period_id"`
	AdjustmentDate     string                       `json:"adjustment_date" validate:"required"`
	AdjustmentType     string                       `json:"adjustment_type" validate:"required"`
	ReferenceNumber    string                       `json:"reference_number"`
	Reason             string                       `json:"reason"`
	Remarks            string                       `json:"remarks"`
	Lines              []StockAdjustmentLineRequest `json:"lines" validate:"required,min=1"`
}

type StockAdjustmentUpdateRequest struct {
	BranchID           uint64                       `json:"branch_id" validate:"required"`
	WarehouseID        uint64                       `json:"warehouse_id" validate:"required"`
	FinancialYearID    *uint64                      `json:"financial_year_id"`
	AccountingPeriodID *uint64                      `json:"accounting_period_id"`
	AdjustmentDate     string                       `json:"adjustment_date" validate:"required"`
	AdjustmentType     string                       `json:"adjustment_type" validate:"required"`
	ReferenceNumber    string                       `json:"reference_number"`
	Reason             string                       `json:"reason"`
	Remarks            string                       `json:"remarks"`
	Lines              []StockAdjustmentLineRequest `json:"lines" validate:"required,min=1"`
}

type StockAdjustmentActionRequest struct {
	Remarks string `json:"remarks"`
}

type StockAdjustmentResponse struct {
	models.StockAdjustment
	Lines           []StockAdjustmentLineResponse      `json:"lines,omitempty"`
	ApprovalHistory []models.StockAdjustmentApproval `json:"approval_history,omitempty"`
}

type StockAdjustmentLineResponse struct {
	models.StockAdjustmentLine
	Product           *models.Product           `json:"product,omitempty"`
	ProductBatch      *models.ProductBatch      `json:"product_batch,omitempty"`
	WarehouseLocation *models.WarehouseLocation `json:"warehouse_location,omitempty"`
}
