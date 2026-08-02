package migrations

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/seeders"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RunFinanceMigrations runs AutoMigrate for the finance models
// and seeds the initial finance data.
func RunFinanceMigrations(db *gorm.DB, logger *zap.Logger, isNewTenantFlag ...bool) error {
	isNewTenant := false
	if len(isNewTenantFlag) > 0 && isNewTenantFlag[0] {
		isNewTenant = true
	}
	logger.Info("Running finance database AutoMigrate...")

	// AutoMigrate finance tables
	err := db.AutoMigrate(
		&models.FinancialYear{},
		&models.AccountingPeriod{},
		&models.AccountClassification{},
		&models.AccountGroup{},
		&models.ChartOfAccount{},
		&models.TaxSetting{},
		&models.OpeningBalance{},
		&models.JournalEntry{},
		&models.JournalEntryLine{},
		&models.JournalEntryApproval{},
		&models.JournalEntryReversal{},
		&models.PaymentVoucher{},
		&models.PaymentVoucherLine{},
		&models.PaymentVoucherApproval{},
		&models.ReceiptVoucher{},
		&models.ReceiptVoucherLine{},
		&models.ReceiptVoucherApproval{},
		&models.BankAccount{},
		&models.CashAccount{},
		&models.ChequeBook{},
		&models.ChequeLeaf{},
		&models.BankTransaction{},
		&models.BankReconciliation{},
		&models.BankReconciliationLine{},
		&models.PettyCashFund{},
		&models.PettyCashVoucher{},
		&models.PettyCashVoucherLine{},
		&models.PettyCashVoucherApproval{},
		&models.PettyCashReplenishment{},
		&models.PettyCashReplenishmentApproval{},
		&models.FixedAssetCategory{},
		&models.FixedAsset{},
		&models.FixedAssetDepreciationRun{},
		&models.FixedAssetDepreciationLine{},
		&models.FixedAssetDisposal{},
		&models.FixedAssetDisposalApproval{},
		&models.GeneralLedgerEntry{},
	)
	if err != nil {
		logger.Error("Finance AutoMigrate failed", zap.Error(err))
		return err
	}

	logger.Info("Finance AutoMigrate completed successfully")

	// Run seeders for finance module
	logger.Info("Running finance seeders...")

	if err := seeders.SeedAccountClassifications(db, logger); err != nil {
		logger.Error("Finance account classification seeder failed", zap.Error(err))
		return err
	}

	if err := seeders.SeedChartOfAccounts(db, logger); err != nil {
		logger.Error("Finance chart of accounts seeder failed", zap.Error(err))
		return err
	}

	if !isNewTenant {
		if err := seeders.SeedFinancialYear(db, logger); err != nil {
			logger.Error("Finance financial year seeder failed", zap.Error(err))
			return err
		}
	}

	logger.Info("Finance migrations and seeding complete")
	return nil
}
