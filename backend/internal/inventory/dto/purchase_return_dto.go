package dto

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
)

type PurchaseReturnLineRequest struct {
	GoodsReceiptNoteLineID *uint64 `json:"goods_receipt_note_line_id"`
	WarehouseLocationID    *uint64 `json:"warehouse_location_id"`
	ProductID              uint64  `json:"product_id" validate:"required"`
	ProductBatchID         *uint64 `json:"product_batch_id"`
	ReturnQuantity         float64 `json:"return_quantity" validate:"required,gt=0"`
	UnitCost               float64 `json:"unit_cost" validate:"gte=0"`
	TaxAmount              float64 `json:"tax_amount" validate:"gte=0"`
	ReturnReason           string  `json:"return_reason"`
	LineRemarks            string  `json:"line_remarks"`
}

type PurchaseReturnCreateRequest struct {
	BranchID           uint64                      `json:"branch_id" validate:"required"`
	SupplierID         uint64                      `json:"supplier_id" validate:"required"`
	WarehouseID        uint64                      `json:"warehouse_id" validate:"required"`
	GoodsReceiptNoteID *uint64                     `json:"goods_receipt_note_id"`
	FinancialYearID    *uint64                     `json:"financial_year_id"`
	AccountingPeriodID *uint64                     `json:"accounting_period_id"`
	ReturnDate         string                      `json:"return_date" validate:"required"`
	ReferenceNumber    string                      `json:"reference_number"`
	Remarks            string                      `json:"remarks"`
	Lines              []PurchaseReturnLineRequest `json:"lines" validate:"required,min=1"`
}

type PurchaseReturnUpdateRequest struct {
	BranchID           uint64                      `json:"branch_id" validate:"required"`
	SupplierID         uint64                      `json:"supplier_id" validate:"required"`
	WarehouseID        uint64                      `json:"warehouse_id" validate:"required"`
	GoodsReceiptNoteID *uint64                     `json:"goods_receipt_note_id"`
	FinancialYearID    *uint64                     `json:"financial_year_id"`
	AccountingPeriodID *uint64                     `json:"accounting_period_id"`
	ReturnDate         string                      `json:"return_date" validate:"required"`
	ReferenceNumber    string                      `json:"reference_number"`
	Remarks            string                      `json:"remarks"`
	Lines              []PurchaseReturnLineRequest `json:"lines" validate:"required,min=1"`
}

type PurchaseReturnActionRequest struct {
	Remarks string `json:"remarks"`
}

type PurchaseReturnResponse struct {
	models.PurchaseReturn
	Lines           []PurchaseReturnLineResponse    `json:"lines,omitempty"`
	ApprovalHistory []models.PurchaseReturnApproval `json:"approval_history,omitempty"`
}

type PurchaseReturnLineResponse struct {
	models.PurchaseReturnLine
	Product              *models.Product              `json:"product,omitempty"`
	ProductBatch         *models.ProductBatch         `json:"product_batch,omitempty"`
	WarehouseLocation    *models.WarehouseLocation    `json:"warehouse_location,omitempty"`
	GoodsReceiptNoteLine *models.GoodsReceiptNoteLine `json:"goods_receipt_note_line,omitempty"`
}
