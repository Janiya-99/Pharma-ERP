package seeder

import (
	"log"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// SeedFinance inserts default finance data: Main Category Types, Categories, and default Chart of Accounts.
func SeedFinance(db *gorm.DB) error {
	log.Println("Seeding Finance Module...")

	// 1. Seed Main Category Types
	types := []model.FinanceMainCategoryType{
		{Code: "ASST", Name: "Assets"},
		{Code: "LIAB", Name: "Liabilities"},
		{Code: "EQTY", Name: "Equity"},
		{Code: "REV", Name: "Revenue"},
		{Code: "EXPS", Name: "Expenses"},
	}
	for i := range types {
		if err := db.Where("code = ?", types[i].Code).FirstOrCreate(&types[i]).Error; err != nil {
			return err
		}
	}

	// 2. Seed Main Categories
	mainCats := []model.FinanceMainCategory{
		{MainCategoryTypeID: types[0].ID, Code: "CASST", Name: "Current Assets"},
		{MainCategoryTypeID: types[1].ID, Code: "CLIAB", Name: "Current Liabilities"},
		{MainCategoryTypeID: types[2].ID, Code: "OEQTY", Name: "Owner's Equity"},
		{MainCategoryTypeID: types[3].ID, Code: "OPREV", Name: "Operating Revenue"},
		{MainCategoryTypeID: types[4].ID, Code: "OPEXP", Name: "Operating Expenses"},
	}
	for i := range mainCats {
		if err := db.Where("code = ?", mainCats[i].Code).FirstOrCreate(&mainCats[i]).Error; err != nil {
			return err
		}
	}

	// 3. Seed Sub Categories
	subCats := []model.FinanceSubCategory{
		{MainCategoryID: mainCats[0].ID, Name: "Cash & Cash Equivalents"},
		{MainCategoryID: mainCats[0].ID, Name: "Receivables"},
		{MainCategoryID: mainCats[0].ID, Name: "Inventories"},
		{MainCategoryID: mainCats[1].ID, Name: "Payables"},
		{MainCategoryID: mainCats[2].ID, Name: "Retained Earnings"},
		{MainCategoryID: mainCats[3].ID, Name: "Sales Revenue"},
		{MainCategoryID: mainCats[4].ID, Name: "Administrative Expenses"},
	}
	for i := range subCats {
		if err := db.Where("name = ? AND main_category_id = ?", subCats[i].Name, subCats[i].MainCategoryID).FirstOrCreate(&subCats[i]).Error; err != nil {
			return err
		}
	}

	// 4. Seed Leaf Categories
	categories := []model.FinanceCategory{
		{SubCategoryID: subCats[0].ID, Name: "Petty Cash & Bank Accounts"},
		{SubCategoryID: subCats[1].ID, Name: "Trade Receivables"},
		{SubCategoryID: subCats[2].ID, Name: "Merchandise Inventory"},
		{SubCategoryID: subCats[3].ID, Name: "Trade Payables"},
		{SubCategoryID: subCats[4].ID, Name: "Equity Reserves"},
		{SubCategoryID: subCats[5].ID, Name: "Core Sales"},
		{SubCategoryID: subCats[6].ID, Name: "Operational Expenses"},
	}
	for i := range categories {
		if err := db.Where("name = ? AND sub_category_id = ?", categories[i].Name, categories[i].SubCategoryID).FirstOrCreate(&categories[i]).Error; err != nil {
			return err
		}
	}

	// 5. Seed Chart of Accounts
	accounts := []model.ChartOfAccounts{
		{CategoryID: categories[0].ID, GLCode: "1000", Name: "Main Cash Drawer", IsCashBank: true, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[0].ID, GLCode: "1010", Name: "Petty Cash", IsCashBank: true, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[1].ID, GLCode: "1100", Name: "Accounts Receivable", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[2].ID, GLCode: "1500", Name: "Inventory Stock Account", IsCashBank: false, ShowToPO: true, InterBranch: false},
		{CategoryID: categories[3].ID, GLCode: "2000", Name: "Accounts Payable", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[4].ID, GLCode: "3000", Name: "Owner's Equity", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[4].ID, GLCode: "3100", Name: "Retained Earnings", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[5].ID, GLCode: "4000", Name: "Sales Revenue", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[5].ID, GLCode: "4100", Name: "Service Income", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[6].ID, GLCode: "5000", Name: "Cost of Goods Sold", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[6].ID, GLCode: "6000", Name: "Salaries & Wages", IsCashBank: false, ShowToPO: false, InterBranch: false},
		{CategoryID: categories[6].ID, GLCode: "6100", Name: "Rent Expense", IsCashBank: false, ShowToPO: false, InterBranch: false},
	}

	for _, acc := range accounts {
		if err := db.Where("gl_code = ?", acc.GLCode).FirstOrCreate(&acc).Error; err != nil {
			log.Printf("Error seeding account %s: %v", acc.GLCode, err)
			return err
		}
	}

	log.Println("Finance seeders completed successfully.")
	return nil
}
