package seeders

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedDocumentNumberingRules(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	if companyID == 0 {
		return nil
	}

	logger.Info("Seeding default document numbering rules for company...", zap.Uint64("company_id", companyID))

	rules := []models.DocumentNumberingRule{
		// FINANCE
		{CompanyID: companyID, Module: "Finance", DocumentType: "JOURNAL_ENTRY", Prefix: "JE-", Padding: 6, ResetFrequency: "financial_year", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Finance", DocumentType: "PAYMENT_VOUCHER", Prefix: "PV-", Padding: 6, ResetFrequency: "financial_year", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Finance", DocumentType: "RECEIPT_VOUCHER", Prefix: "RV-", Padding: 6, ResetFrequency: "financial_year", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Finance", DocumentType: "PETTY_CASH_VOUCHER", Prefix: "PCV-", Padding: 6, ResetFrequency: "monthly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Finance", DocumentType: "FIXED_ASSET_DISPOSAL", Prefix: "FAD-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		// INVENTORY
		{CompanyID: companyID, Module: "Inventory", DocumentType: "GOODS_RECEIPT_NOTE", Prefix: "GRN-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Inventory", DocumentType: "STOCK_TRANSFER", Prefix: "ST-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Inventory", DocumentType: "STOCK_ADJUSTMENT", Prefix: "SA-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Inventory", DocumentType: "PURCHASE_RETURN", Prefix: "PR-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Inventory", DocumentType: "SALES_RETURN", Prefix: "SR-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		// INVOICE CENTER
		{CompanyID: companyID, Module: "Invoice Center", DocumentType: "SALES_ORDER", Prefix: "SO-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Invoice Center", DocumentType: "SALES_INVOICE", Prefix: "INV-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Invoice Center", DocumentType: "CREDIT_NOTE", Prefix: "CN-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Invoice Center", DocumentType: "DEBIT_NOTE", Prefix: "DN-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
		{CompanyID: companyID, Module: "Invoice Center", DocumentType: "CUSTOMER_RECEIPT", Prefix: "CR-", Padding: 6, ResetFrequency: "yearly", Status: "published", IsDefault: true},
	}

	now := time.Now()
	for _, r := range rules {
		var count int64
		db.Model(&models.DocumentNumberingRule{}).Where("company_id = ? AND branch_id IS NULL AND module = ? AND document_type = ?", companyID, r.Module, r.DocumentType).Count(&count)
		if count == 0 {
			r.VersionNumber = 1
			r.CreatedBy = 1
			r.UpdatedBy = 1
			r.PublishedBy = func() *uint64 { id := uint64(1); return &id }()
			r.PublishedAt = &now
			r.CreatedAt = now
			r.UpdatedAt = now
			if err := db.Create(&r).Error; err != nil {
				logger.Error("Failed to seed document numbering rule", zap.Error(err), zap.String("doc_type", r.DocumentType))
			}
		}
	}

	logger.Info("Document numbering rules seeding completed successfully")
	return nil
}
