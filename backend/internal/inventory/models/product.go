package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID                       uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID                uint64         `gorm:"not null;index:idx_company_product_code,unique" json:"company_id"`
	ProductCode              string         `gorm:"type:varchar(50);not null;index:idx_company_product_code,unique;index" json:"product_code"`
	ProductName              string         `gorm:"type:varchar(200);not null;index" json:"product_name"`
	ProductCategoryID        *uint64        `json:"product_category_id"`
	GenericNameID            *uint64        `json:"generic_name_id"`
	DosageFormID             *uint64        `json:"dosage_form_id"`
	ManufacturerID           *uint64        `json:"manufacturer_id"`
	BaseUnitID               uint64         `gorm:"not null" json:"base_unit_id"`
	Strength                 string         `gorm:"type:varchar(100)" json:"strength"`
	PackSize                 string         `gorm:"type:varchar(100)" json:"pack_size"`
	ProductType              string         `gorm:"type:varchar(50);default:'medicine'" json:"product_type"`
	RequiresBatchTracking    bool           `gorm:"default:true" json:"requires_batch_tracking"`
	RequiresExpiryTracking   bool           `gorm:"default:true" json:"requires_expiry_tracking"`
	StorageCondition         string         `gorm:"type:varchar(50);default:'normal'" json:"storage_condition"`
	ReorderLevel             float64        `gorm:"type:decimal(18,2);default:0" json:"reorder_level"`
	ReorderQuantity          float64        `gorm:"type:decimal(18,2);default:0" json:"reorder_quantity"`
	PurchaseAccountID        *uint64        `json:"purchase_account_id"`
	SalesAccountID           *uint64        `json:"sales_account_id"`
	InventoryAccountID       *uint64        `json:"inventory_account_id"`
	CostOfGoodsSoldAccountID *uint64        `json:"cost_of_goods_sold_account_id"`
	NMRARegistrationNumber   string         `gorm:"type:varchar(100)" json:"nmra_registration_number"`
	NMRAExpiryDate           *time.Time     `json:"nmra_expiry_date"`
	Status                   string         `gorm:"type:varchar(30);default:'active';index" json:"status"`
	CreatedBy                *uint64        `json:"created_by"`
	UpdatedBy                *uint64        `json:"updated_by"`
	CreatedAt                time.Time      `json:"created_at"`
	UpdatedAt                time.Time      `json:"updated_at"`
	DeletedAt                gorm.DeletedAt `gorm:"index" json:"-"`
}
