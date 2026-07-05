package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	financeModels "github.com/pixandco/erp-phrma/internal/finance/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SeedAccountClassifications inserts the default account classifications structure.
func SeedAccountClassifications(db *gorm.DB, logger *zap.Logger) error {
	var company models.Company
	if err := db.First(&company).Error; err != nil {
		logger.Warn("Main company not found, skipping account classification seeder", zap.Error(err))
		return nil
	}

	companyID := company.ID

	type Node struct {
		Name          string
		NormalBalance string
		Children      []Node
	}

	type Hierarchy struct {
		Type     string
		Children []Node
	}

	data := []Hierarchy{
		{
			Type: "Balance Sheet",
			Children: []Node{
				{
					Name: "Assets", NormalBalance: "Debit", Children: []Node{
						{Name: "Current Assets", NormalBalance: "Debit", Children: []Node{
							{Name: "Cash and Cash Equivalents", NormalBalance: "Debit"},
							{Name: "Trade Receivables", NormalBalance: "Debit"},
							{Name: "Inventory", NormalBalance: "Debit"},
							{Name: "Prepayments", NormalBalance: "Debit"},
						}},
						{Name: "Non Current Assets", NormalBalance: "Debit", Children: []Node{
							{Name: "Property Plant and Equipment", NormalBalance: "Debit"},
							{Name: "Accumulated Depreciation", NormalBalance: "Credit"}, // Usually credit for contra-asset
						}},
					},
				},
				{
					Name: "Liabilities", NormalBalance: "Credit", Children: []Node{
						{Name: "Current Liabilities", NormalBalance: "Credit", Children: []Node{
							{Name: "Trade Payables", NormalBalance: "Credit"},
							{Name: "Tax Payables", NormalBalance: "Credit"},
							{Name: "Accrued Expenses", NormalBalance: "Credit"},
						}},
						{Name: "Non Current Liabilities", NormalBalance: "Credit", Children: []Node{
							{Name: "Long Term Loans", NormalBalance: "Credit"},
						}},
					},
				},
				{
					Name: "Equity", NormalBalance: "Credit", Children: []Node{
						{Name: "Capital", NormalBalance: "Credit", Children: []Node{
							{Name: "Share Capital", NormalBalance: "Credit"},
							{Name: "Retained Earnings", NormalBalance: "Credit"},
						}},
					},
				},
			},
		},
		{
			Type: "Profit & Loss",
			Children: []Node{
				{
					Name: "Revenue", NormalBalance: "Credit", Children: []Node{
						{Name: "Operating Revenue", NormalBalance: "Credit", Children: []Node{
							{Name: "Sales Revenue", NormalBalance: "Credit"},
						}},
						{Name: "Other Income", NormalBalance: "Credit", Children: []Node{
							{Name: "Other Income", NormalBalance: "Credit"},
						}},
					},
				},
				{
					Name: "Expenses", NormalBalance: "Debit", Children: []Node{
						{Name: "Direct Expenses", NormalBalance: "Debit", Children: []Node{
							{Name: "Cost of Goods Sold", NormalBalance: "Debit"},
							{Name: "Purchase Cost", NormalBalance: "Debit"},
							{Name: "Freight Charges", NormalBalance: "Debit"},
						}},
						{Name: "Administrative Expenses", NormalBalance: "Debit", Children: []Node{
							{Name: "Salaries and Wages", NormalBalance: "Debit"},
							{Name: "Rent Expense", NormalBalance: "Debit"},
							{Name: "Utility Expense", NormalBalance: "Debit"},
						}},
						{Name: "Selling Expenses", NormalBalance: "Debit", Children: []Node{
							{Name: "Marketing Expense", NormalBalance: "Debit"},
							{Name: "Delivery Expense", NormalBalance: "Debit"},
						}},
						{Name: "Finance Expenses", NormalBalance: "Debit", Children: []Node{
							{Name: "Bank Charges", NormalBalance: "Debit"},
							{Name: "Interest Expense", NormalBalance: "Debit"},
						}},
					},
				},
			},
		},
	}

	for _, t := range data {
		for i, lvl1 := range t.Children {
			// Level 1: Main Category
			l1Node := financeModels.AccountClassification{
				CompanyID:     companyID,
				Type:          t.Type,
				Name:          lvl1.Name,
				Level:         1,
				NormalBalance: lvl1.NormalBalance,
				SortOrder:     i + 1,
				Status:        "active",
			}
			db.Where("company_id = ? AND type = ? AND name = ? AND parent_id IS NULL", companyID, t.Type, lvl1.Name).FirstOrCreate(&l1Node)

			for j, lvl2 := range lvl1.Children {
				// Level 2: Sub Category
				l2Node := financeModels.AccountClassification{
					CompanyID:     companyID,
					Type:          t.Type,
					Name:          lvl2.Name,
					ParentID:      &l1Node.ID,
					Level:         2,
					NormalBalance: lvl2.NormalBalance,
					SortOrder:     j + 1,
					Status:        "active",
				}
				db.Where("company_id = ? AND type = ? AND name = ? AND parent_id = ?", companyID, t.Type, lvl2.Name, l1Node.ID).FirstOrCreate(&l2Node)

				for k, lvl3 := range lvl2.Children {
					// Level 3: Category
					l3Node := financeModels.AccountClassification{
						CompanyID:     companyID,
						Type:          t.Type,
						Name:          lvl3.Name,
						ParentID:      &l2Node.ID,
						Level:         3,
						NormalBalance: lvl3.NormalBalance,
						SortOrder:     k + 1,
						Status:        "active",
					}
					db.Where("company_id = ? AND type = ? AND name = ? AND parent_id = ?", companyID, t.Type, lvl3.Name, l2Node.ID).FirstOrCreate(&l3Node)
				}
			}
		}
	}

	logger.Info("Account classifications seeding completed")
	return nil
}
