package dto

import (
	"time"

	"github.com/shopspring/decimal"
)

type CreateWarehouseReq struct {
	Name     string `json:"name" binding:"required"`
	Code     string `json:"code" binding:"required"`
	BranchID uint64 `json:"branch_id" binding:"required"`
	Address  string `json:"address"`
	Status   string `json:"status" binding:"omitempty,oneof=Active Inactive"`
}

type UpdateWarehouseReq struct {
	Name    string `json:"name"`
	Code    string `json:"code"`
	Address string `json:"address"`
	Status  string `json:"status" binding:"omitempty,oneof=Active Inactive"`
}

type CreateProductReq struct {
	Code         string `json:"code" binding:"required"`
	Name         string `json:"name" binding:"required"`
	GenericName  string `json:"generic_name"`
	Brand        string `json:"brand"`
	CategoryID   uint64 `json:"category_id" binding:"required"`
	Manufacturer string `json:"manufacturer"`
	DosageForm   string `json:"dosage_form"`
	Strength     string `json:"strength"`
	PackSize     string `json:"pack_size"`
	Unit         string `json:"unit"`
	ReorderLevel int    `json:"reorder_level"`
	Status       string `json:"status" binding:"omitempty,oneof=Active Inactive"`
}

type UpdateProductReq struct {
	Code         string `json:"code"`
	Name         string `json:"name"`
	GenericName  string `json:"generic_name"`
	Brand        string `json:"brand"`
	CategoryID   uint64 `json:"category_id"`
	Manufacturer string `json:"manufacturer"`
	DosageForm   string `json:"dosage_form"`
	Strength     string `json:"strength"`
	PackSize     string `json:"pack_size"`
	Unit         string `json:"unit"`
	ReorderLevel int    `json:"reorder_level"`
	Status       string `json:"status" binding:"omitempty,oneof=Active Inactive"`
}

type CreateSupplierReq struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"omitempty,email"`
	Phone       string `json:"phone"`
	CreditTerms string `json:"credit_terms"`
	Status      string `json:"status" binding:"omitempty,oneof=Active Inactive"`
}

type UpdateSupplierReq struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Email       string `json:"email" binding:"omitempty,email"`
	Phone       string `json:"phone"`
	CreditTerms string `json:"credit_terms"`
	Status      string `json:"status" binding:"omitempty,oneof=Active Inactive"`
}

type GRNItemReq struct {
	ProductID   uint64          `json:"product_id" binding:"required"`
	BatchNo     string          `json:"batch_no" binding:"required"`
	MfgDate     time.Time       `json:"mfg_date"`
	ExpiryDate  time.Time       `json:"expiry_date"`
	WarehouseID uint64          `json:"warehouse_id" binding:"required"`
	BinLocation string          `json:"bin_location"`
	Qty         int             `json:"qty" binding:"required,gt=0"`
	UnitCost    decimal.Decimal `json:"unit_cost" binding:"required"`
}

type CreateGRNReq struct {
	RefNo      string       `json:"ref_no" binding:"required"`
	Date       time.Time    `json:"date" binding:"required"`
	SupplierID uint64       `json:"supplier_id" binding:"required"`
	PORef      string       `json:"po_ref"`
	ReceivedBy string       `json:"received_by"`
	Items      []GRNItemReq `json:"items" binding:"required,min=1"`
}
