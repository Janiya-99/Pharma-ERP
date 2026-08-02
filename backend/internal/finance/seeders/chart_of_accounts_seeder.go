package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	financeModels "github.com/pixandco/erp-phrma/internal/finance/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SeedChartOfAccounts inserts default ledger accounts and maps them to their classifications.
func SeedChartOfAccounts(db *gorm.DB, logger *zap.Logger) error {
	var company models.Company
	if err := db.First(&company).Error; err != nil {
		logger.Warn("Main company not found, skipping COA seeder", zap.Error(err))
		return nil
	}

	companyID := company.ID

	// Helper to get classification ID by name
	getClassID := func(name string) uint64 {
		var cls financeModels.AccountClassification
		if err := db.Where("company_id = ? AND name = ?", companyID, name).First(&cls).Error; err != nil {
			logger.Warn("Classification not found", zap.String("name", name))
			return 0
		}
		return cls.ID
	}

	accounts := []struct {
		Code             string
		Name             string
		Classification   string
		NormalBalance    string
		IsCashAccount    bool
		IsBankAccount    bool
		IsControlAccount bool
	}{
		{"100001", "Cash in Hand", "Cash and Cash Equivalents", "Debit", true, false, false},
		{"100002", "Petty Cash", "Cash and Cash Equivalents", "Debit", true, false, false},
		{"100003", "Bank Account", "Cash and Cash Equivalents", "Debit", false, true, false},

		{"110001", "Trade Debtors", "Trade Receivables", "Debit", false, false, true},
		{"120001", "Inventory Account", "Inventory", "Debit", false, false, true},
		{"130001", "Prepaid Expenses", "Prepayments", "Debit", false, false, false},

		{"150001", "Fixed Asset Account", "Property Plant and Equipment", "Debit", false, false, false},
		{"150002", "Accumulated Depreciation", "Accumulated Depreciation", "Credit", false, false, false},

		{"200001", "Trade Creditors", "Trade Payables", "Credit", false, false, true},
		{"210001", "VAT Payable", "Tax Payables", "Credit", false, false, false},
		{"220001", "Accrued Expenses", "Accrued Expenses", "Credit", false, false, false},

		{"300001", "Share Capital", "Share Capital", "Credit", false, false, false},
		{"310001", "Retained Earnings", "Retained Earnings", "Credit", false, false, false},

		{"400001", "Sales Revenue", "Sales Revenue", "Credit", false, false, false},
		{"410001", "Other Income", "Other Income", "Credit", false, false, false},

		{"500001", "Cost of Goods Sold", "Cost of Goods Sold", "Debit", false, false, false},
		{"510001", "Purchase Cost", "Purchase Cost", "Debit", false, false, false},
		{"520001", "Freight Charges", "Freight Charges", "Debit", false, false, false},

		{"600001", "Salaries and Wages", "Salaries and Wages", "Debit", false, false, false},
		{"610001", "Rent Expense", "Rent Expense", "Debit", false, false, false},
		{"620001", "Utility Expense", "Utility Expense", "Debit", false, false, false},

		{"700001", "Marketing Expense", "Marketing Expense", "Debit", false, false, false},
		{"710001", "Delivery Expense", "Delivery Expense", "Debit", false, false, false},

		{"800001", "Bank Charges", "Bank Charges", "Debit", false, false, false},
		{"810001", "Interest Expense", "Interest Expense", "Debit", false, false, false},
	}

	for _, acc := range accounts {
		clsID := getClassID(acc.Classification)
		if clsID == 0 {
			continue // skip if parent classification is missing
		}

		coa := financeModels.ChartOfAccount{
			CompanyID:               companyID,
			AccountCode:             acc.Code,
			AccountName:             acc.Name,
			AccountClassificationID: clsID,
			NormalBalance:           acc.NormalBalance,
			IsCashAccount:           acc.IsCashAccount,
			IsBankAccount:           acc.IsBankAccount,
			IsControlAccount:        acc.IsControlAccount,
			AccountLevel:            1,
			Status:                  "active",
		}

		db.Where("company_id = ? AND account_code = ?", companyID, acc.Code).FirstOrCreate(&coa)
	}

	logger.Info("Chart of accounts seeding completed")
	return nil
}
