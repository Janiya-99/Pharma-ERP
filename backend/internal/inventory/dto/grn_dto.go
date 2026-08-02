package dto

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
)

type GRNLinePayload struct {
	WarehouseLocationID *uint64 `json:"warehouse_location_id"`
	ProductID           uint64  `json:"product_id" validate:"required"`
	ProductBatchID      *uint64 `json:"product_batch_id"`

	BatchNumber     string `json:"batch_number"`
	ManufactureDate string `json:"manufacture_date"`
	ExpiryDate      string `json:"expiry_date"`

	QuantityReceived float64 `json:"quantity_received" validate:"required,gt=0"`
	FreeQuantity     float64 `json:"free_quantity" validate:"gte=0"`
	UnitCost         float64 `json:"unit_cost" validate:"gte=0"`
	DiscountAmount   float64 `json:"discount_amount" validate:"gte=0"`
	TaxAmount        float64 `json:"tax_amount" validate:"gte=0"`

	SellingPrice float64 `json:"selling_price" validate:"gte=0"`
	MRP          float64 `json:"mrp" validate:"gte=0"`

	LineRemarks string `json:"line_remarks"`
}

type CreateGRNPayload struct {
	CompanyID          uint64  `json:"-"`
	CreatedBy          uint64  `json:"-"`
	BranchID           uint64  `json:"branch_id" validate:"required"`
	SupplierID         uint64  `json:"supplier_id" validate:"required"`
	WarehouseID        uint64  `json:"warehouse_id" validate:"required"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	GRNDate               string `json:"grn_date" validate:"required"`
	SupplierInvoiceNumber string `json:"supplier_invoice_number"`
	SupplierInvoiceDate   string `json:"supplier_invoice_date"`
	PurchaseOrderNumber   string `json:"purchase_order_number"`
	ReferenceNumber       string `json:"reference_number"`
	Remarks               string `json:"remarks"`

	Lines []GRNLinePayload `json:"lines" validate:"required,min=1"`
}

type UpdateGRNPayload struct {
	CompanyID          uint64  `json:"-"`
	UpdatedBy          uint64  `json:"-"`
	BranchID           uint64  `json:"branch_id" validate:"required"`
	SupplierID         uint64  `json:"supplier_id" validate:"required"`
	WarehouseID        uint64  `json:"warehouse_id" validate:"required"`
	FinancialYearID    *uint64 `json:"financial_year_id"`
	AccountingPeriodID *uint64 `json:"accounting_period_id"`

	GRNDate               string `json:"grn_date" validate:"required"`
	SupplierInvoiceNumber string `json:"supplier_invoice_number"`
	SupplierInvoiceDate   string `json:"supplier_invoice_date"`
	PurchaseOrderNumber   string `json:"purchase_order_number"`
	ReferenceNumber       string `json:"reference_number"`
	Remarks               string `json:"remarks"`

	Lines []GRNLinePayload `json:"lines" validate:"required,min=1"`
}

type ActionGRNPayload struct {
	Remarks string `json:"remarks"`
}

type GRNFilter struct {
	CompanyID          uint64 `json:"-"`
	BranchID           uint64 `json:"branch_id"`
	SupplierID         uint64 `json:"supplier_id"`
	WarehouseID        uint64 `json:"warehouse_id"`
	FinancialYearID    uint64 `json:"financial_year_id"`
	AccountingPeriodID uint64 `json:"accounting_period_id"`

	ApprovalStatus string `json:"approval_status"`
	PostedStatus   string `json:"posted_status"`
	GRNDateFrom    string `json:"grn_date_from"`
	GRNDateTo      string `json:"grn_date_to"`
	Search         string `json:"search"`

	Page  int `json:"page"`
	Limit int `json:"limit"`
}

type GRNResponse struct {
	ID                    uint64            `json:"id"`
	GRNNumber             string            `json:"grn_number"`
	GRNDate               time.Time         `json:"grn_date"`
	BranchID              uint64            `json:"branch_id"`
	SupplierID            uint64            `json:"supplier_id"`
	WarehouseID           uint64            `json:"warehouse_id"`
	SupplierName          string            `json:"supplier_name"`
	WarehouseName         string            `json:"warehouse_name"`
	Supplier              *models.Supplier  `json:"supplier,omitempty"`
	Warehouse             *models.Warehouse `json:"warehouse,omitempty"`
	SupplierInvoiceNumber string            `json:"supplier_invoice_number"`
	TotalQuantity         float64           `json:"total_quantity"`
	TotalFreeQuantity     float64           `json:"total_free_quantity"`
	TotalStockQuantity    float64           `json:"total_stock_quantity"`
	TotalAmount           float64           `json:"total_amount"`
	ApprovalStatus        string            `json:"approval_status"`
	PostedStatus          string            `json:"posted_status"`
	CreatedBy             uint64            `json:"created_by"`
	CreatedAt             time.Time         `json:"created_at"`
}
