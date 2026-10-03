package finance

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/finance/handlers"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
)

func SetupRoutes(r *gin.RouterGroup, logger *zap.Logger) {
	// Handlers
	fyHandler := handlers.NewFinancialYearHandler(logger)
	apHandler := handlers.NewAccountingPeriodHandler(logger)
	acHandler := handlers.NewAccountClassificationHandler(logger)
	coaHandler := handlers.NewChartOfAccountHandler(logger)
	obHandler := handlers.NewOpeningBalanceHandler(logger)

	// Petty Cash Handlers
	pcfHandler := handlers.NewPettyCashFundHandler(logger)
	pcvHandler := handlers.NewPettyCashVoucherHandler(logger)
	pcrHandler := handlers.NewPettyCashReplenishmentHandler(logger)

	// Routes
	finance := r.Group("")

	// Dashboard
	dashboardHandler := handlers.NewDashboardHandler(logger)
	dashboard := finance.Group("/dashboard")
	{
		dashboard.GET("", middleware.RequirePermission("finance.dashboard.view"), dashboardHandler.GetDashboardData)
	}

	// Financial Years
	fy := finance.Group("/financial-years")
	{
		fy.GET("", middleware.RequirePermission("finance.financial_year.view"), fyHandler.List)
		fy.GET("/:id", middleware.RequirePermission("finance.financial_year.view"), fyHandler.Get)
		fy.POST("", middleware.RequirePermission("finance.financial_year.create"), fyHandler.Create)
		fy.PUT("/:id", middleware.RequirePermission("finance.financial_year.update"), fyHandler.Update)
		fy.POST("/:id/close", middleware.RequirePermission("finance.financial_year.close"), fyHandler.Close)
	}

	// Accounting Periods
	ap := finance.Group("/accounting-periods")
	{
		ap.GET("", middleware.RequirePermission("finance.accounting_period.view"), apHandler.List)
		ap.POST("", middleware.RequirePermission("finance.accounting_period.create"), apHandler.Create)
		ap.PUT("/:id", middleware.RequirePermission("finance.accounting_period.update"), apHandler.Update)
		ap.POST("/:id/close", middleware.RequirePermission("finance.accounting_period.close"), apHandler.Close)
	}

	// Account Classifications
	ac := finance.Group("/account-classifications")
	{
		ac.GET("", middleware.RequirePermission("finance.account_classification.view"), acHandler.List)
		ac.POST("", middleware.RequirePermission("finance.account_classification.create"), acHandler.Create)
		ac.PUT("/:id", middleware.RequirePermission("finance.account_classification.update"), acHandler.Update)
		ac.DELETE("/:id", middleware.RequirePermission("finance.account_classification.delete"), acHandler.Delete)
	}

	// Account Groups
	agHandler := handlers.NewAccountGroupHandler(logger)
	ag := finance.Group("/account-groups")
	{
		ag.GET("", middleware.RequirePermission("finance.account_group.view"), agHandler.List)
		ag.GET("/:id", middleware.RequirePermission("finance.account_group.view"), agHandler.Get)
		ag.POST("", middleware.RequirePermission("finance.account_group.create"), agHandler.Create)
		ag.PUT("/:id", middleware.RequirePermission("finance.account_group.update"), agHandler.Update)
		ag.PATCH("/:id/deactivate", middleware.RequirePermission("finance.account_group.delete"), agHandler.Deactivate)
		ag.DELETE("/:id", middleware.RequirePermission("finance.account_group.delete"), agHandler.Deactivate)
	}

	// Chart of Accounts
	coa := finance.Group("/chart-of-accounts")
	{
		coa.GET("", middleware.RequirePermission("finance.chart_of_accounts.view"), coaHandler.List)
		coa.GET("/:id", middleware.RequirePermission("finance.chart_of_accounts.view"), coaHandler.Get)
		coa.POST("", middleware.RequirePermission("finance.chart_of_accounts.create"), coaHandler.Create)
		coa.PUT("/:id", middleware.RequirePermission("finance.chart_of_accounts.update"), coaHandler.Update)
		coa.DELETE("/:id", middleware.RequirePermission("finance.chart_of_accounts.delete"), coaHandler.Delete)
	}

	// Opening Balances
	ob := finance.Group("/opening-balances")
	{
		ob.GET("", middleware.RequirePermission("finance.opening_balance.view"), obHandler.List)
		ob.POST("", middleware.RequirePermission("finance.opening_balance.create"), obHandler.Create)
		ob.PUT("/:id", middleware.RequirePermission("finance.opening_balance.update"), obHandler.Update)
		ob.DELETE("/:id", middleware.RequirePermission("finance.opening_balance.delete"), obHandler.Delete)
	}

	// Tax Settings
	taxHandler := handlers.NewTaxSettingHandler(logger)
	tax := finance.Group("/tax-settings")
	{
		tax.GET("", middleware.RequirePermission("finance.tax_setting.view"), taxHandler.List)
		tax.POST("", middleware.RequirePermission("finance.tax_setting.create"), taxHandler.Create)
		tax.PUT("/:id", middleware.RequirePermission("finance.tax_setting.update"), taxHandler.Update)
		tax.PATCH("/:id/deactivate", middleware.RequirePermission("finance.tax_setting.delete"), taxHandler.Deactivate)
		tax.DELETE("/:id", middleware.RequirePermission("finance.tax_setting.delete"), taxHandler.Deactivate)
	}

	// Journal Entries
	jeHandler := handlers.NewJournalEntryHandler(logger)
	je := finance.Group("/journal-entries")
	{
		je.GET("", middleware.RequirePermission("finance.journal.view"), jeHandler.ListJournalEntries)
		je.GET("/:id", middleware.RequirePermission("finance.journal.view"), jeHandler.GetJournalEntryByID)
		je.POST("", middleware.RequirePermission("finance.journal.create"), jeHandler.CreateJournalEntry)
		je.PUT("/:id", middleware.RequirePermission("finance.journal.update"), jeHandler.UpdateJournalEntry)
		je.DELETE("/:id", middleware.RequirePermission("finance.journal.delete"), jeHandler.DeleteJournalEntry)
		je.POST("/:id/submit", middleware.RequirePermission("finance.journal.submit"), jeHandler.SubmitJournalEntry)
		je.POST("/:id/approve", middleware.RequirePermission("finance.journal.approve"), jeHandler.ApproveJournalEntry)
		je.POST("/:id/reject", middleware.RequirePermission("finance.journal.reject"), jeHandler.RejectJournalEntry)
		je.POST("/:id/post", middleware.RequirePermission("finance.journal.post"), jeHandler.PostJournalEntry)
		je.POST("/:id/reverse", middleware.RequirePermission("finance.journal.reverse"), jeHandler.ReverseJournalEntry)
	}

	// Payment Vouchers
	pvHandler := handlers.NewPaymentVoucherHandler(logger)
	pv := finance.Group("/payment-vouchers")
	{
		pv.GET("", middleware.RequirePermission("finance.payment.view"), pvHandler.ListPaymentVouchers)
		pv.GET("/:id", middleware.RequirePermission("finance.payment.view"), pvHandler.GetPaymentVoucherByID)
		pv.POST("", middleware.RequirePermission("finance.payment.create"), pvHandler.CreatePaymentVoucher)
		pv.PUT("/:id", middleware.RequirePermission("finance.payment.update"), pvHandler.UpdatePaymentVoucher)
		pv.DELETE("/:id", middleware.RequirePermission("finance.payment.delete"), pvHandler.DeletePaymentVoucher)
		pv.POST("/:id/submit", middleware.RequirePermission("finance.payment.submit"), pvHandler.SubmitPaymentVoucher)
		pv.POST("/:id/approve", middleware.RequirePermission("finance.payment.approve"), pvHandler.ApprovePaymentVoucher)
		pv.POST("/:id/reject", middleware.RequirePermission("finance.payment.reject"), pvHandler.RejectPaymentVoucher)
		pv.POST("/:id/post", middleware.RequirePermission("finance.payment.post"), pvHandler.PostPaymentVoucher)
	}

	// Receipt Vouchers
	rvHandler := handlers.NewReceiptVoucherHandler(logger)
	rv := finance.Group("/receipt-vouchers")
	{
		rv.GET("", middleware.RequirePermission("finance.receipt.view"), rvHandler.ListReceiptVouchers)
		rv.GET("/:id", middleware.RequirePermission("finance.receipt.view"), rvHandler.GetReceiptVoucherByID)
		rv.POST("", middleware.RequirePermission("finance.receipt.create"), rvHandler.CreateReceiptVoucher)
		rv.PUT("/:id", middleware.RequirePermission("finance.receipt.update"), rvHandler.UpdateReceiptVoucher)
		rv.DELETE("/:id", middleware.RequirePermission("finance.receipt.delete"), rvHandler.DeleteReceiptVoucher)
		rv.POST("/:id/submit", middleware.RequirePermission("finance.receipt.submit"), rvHandler.SubmitReceiptVoucher)
		rv.POST("/:id/approve", middleware.RequirePermission("finance.receipt.approve"), rvHandler.ApproveReceiptVoucher)
		rv.POST("/:id/reject", middleware.RequirePermission("finance.receipt.reject"), rvHandler.RejectReceiptVoucher)
		rv.POST("/:id/post", middleware.RequirePermission("finance.receipt.post"), rvHandler.PostReceiptVoucher)
	}

	// Bank Accounts
	baHandler := handlers.NewBankAccountHandler(logger)
	ba := finance.Group("/bank-accounts")
	{
		ba.GET("", middleware.RequirePermission("finance.bank_account.view"), baHandler.ListBankAccounts)
		ba.GET("/:id", middleware.RequirePermission("finance.bank_account.view"), baHandler.GetBankAccountByID)
		ba.POST("", middleware.RequirePermission("finance.bank_account.create"), baHandler.CreateBankAccount)
		ba.PUT("/:id", middleware.RequirePermission("finance.bank_account.update"), baHandler.UpdateBankAccount)
		ba.DELETE("/:id", middleware.RequirePermission("finance.bank_account.delete"), baHandler.DeleteBankAccount)
	}

	// Banking Reference Data
	bankingRefHandler := handlers.NewBankingReferenceHandler(logger)
	bankingRef := finance.Group("/reference")
	{
		bankingRef.GET("/sri-lanka-banks", middleware.RequirePermission("finance.bank_account.view"), bankingRefHandler.ListSriLankaBanks)
		bankingRef.GET("/sri-lanka-provinces", middleware.RequirePermission("finance.bank_account.view"), bankingRefHandler.ListSriLankaProvinces)
	}

	// Cash Accounts
	cashHandler := handlers.NewCashAccountHandler(logger)
	cash := finance.Group("/cash-accounts")
	{
		cash.GET("", middleware.RequirePermission("finance.cash_account.view"), cashHandler.ListCashAccounts)
		cash.GET("/:id", middleware.RequirePermission("finance.cash_account.view"), cashHandler.GetCashAccountByID)
		cash.POST("", middleware.RequirePermission("finance.cash_account.create"), cashHandler.CreateCashAccount)
		cash.PUT("/:id", middleware.RequirePermission("finance.cash_account.update"), cashHandler.UpdateCashAccount)
		cash.PATCH("/:id/deactivate", middleware.RequirePermission("finance.cash_account.delete"), cashHandler.DeactivateCashAccount)
		cash.DELETE("/:id", middleware.RequirePermission("finance.cash_account.delete"), cashHandler.DeactivateCashAccount)
	}

	// Cheque Books
	cbHandler := handlers.NewChequeBookHandler(logger)
	cb := finance.Group("/cheque-books")
	{
		cb.GET("", middleware.RequirePermission("finance.cheque_book.view"), cbHandler.ListChequeBooks)
		cb.Handle("QUERY", "", middleware.RequirePermission("finance.cheque_book.view"), cbHandler.ListChequeBooks)
		cb.GET("/:id", middleware.RequirePermission("finance.cheque_book.view"), cbHandler.GetChequeBookByID)
		cb.POST("", middleware.RequirePermission("finance.cheque_book.create"), cbHandler.CreateChequeBook)
		cb.PUT("/:id", middleware.RequirePermission("finance.cheque_book.update"), cbHandler.UpdateChequeBook)
		cb.DELETE("/:id", middleware.RequirePermission("finance.cheque_book.delete"), cbHandler.DeleteChequeBook)
		cb.POST("/leaves/:id/cancel", middleware.RequirePermission("finance.cheque_book.cancel"), cbHandler.CancelChequeLeaf)
	}

	// Bank Transactions
	btHandler := handlers.NewBankTransactionHandler(logger)
	bt := finance.Group("/bank-transactions")
	{
		bt.GET("", middleware.RequirePermission("finance.bank_transaction.view"), btHandler.ListBankTransactions)
		bt.GET("/:id", middleware.RequirePermission("finance.bank_transaction.view"), btHandler.GetBankTransactionByID)
		bt.POST("", middleware.RequirePermission("finance.bank_transaction.create"), btHandler.CreateManualBankTransaction)
		bt.PUT("/:id", middleware.RequirePermission("finance.bank_transaction.update"), btHandler.UpdateManualBankTransaction)
		bt.DELETE("/:id", middleware.RequirePermission("finance.bank_transaction.delete"), btHandler.DeleteManualBankTransaction)
	}

	// Bank Reconciliations
	brHandler := handlers.NewBankReconciliationHandler(logger)
	br := finance.Group("/bank-reconciliations")
	{
		br.GET("", middleware.RequirePermission("finance.bank_reconciliation.view"), brHandler.ListBankReconciliations)
		br.GET("/:id", middleware.RequirePermission("finance.bank_reconciliation.view"), brHandler.GetBankReconciliationByID)
		br.GET("/unreconciled-transactions/:id", middleware.RequirePermission("finance.bank_reconciliation.view"), brHandler.GetUnreconciledTransactions)
		br.POST("", middleware.RequirePermission("finance.bank_reconciliation.create"), brHandler.CreateBankReconciliation)
		br.PUT("/:id", middleware.RequirePermission("finance.bank_reconciliation.update"), brHandler.UpdateBankReconciliation)
		br.POST("/:id/complete", middleware.RequirePermission("finance.bank_reconciliation.complete"), brHandler.CompleteBankReconciliation)
		br.POST("/:id/cancel", middleware.RequirePermission("finance.bank_reconciliation.cancel"), brHandler.CancelBankReconciliation)
		br.DELETE("/:id", middleware.RequirePermission("finance.bank_reconciliation.delete"), brHandler.DeleteBankReconciliation)
	}

	// Petty Cash Funds
	pcf := finance.Group("/petty-cash-funds")
	{
		pcf.GET("", middleware.RequirePermission("finance.petty_cash_fund.view"), pcfHandler.ListPettyCashFunds)
		pcf.GET("/:id", middleware.RequirePermission("finance.petty_cash_fund.view"), pcfHandler.GetPettyCashFundByID)
		pcf.POST("", middleware.RequirePermission("finance.petty_cash_fund.create"), pcfHandler.CreatePettyCashFund)
		pcf.PUT("/:id", middleware.RequirePermission("finance.petty_cash_fund.update"), pcfHandler.UpdatePettyCashFund)
		pcf.DELETE("/:id", middleware.RequirePermission("finance.petty_cash_fund.delete"), pcfHandler.DeletePettyCashFund)
	}

	// Petty Cash Vouchers
	pcv := finance.Group("/petty-cash-vouchers")
	{
		pcv.GET("", middleware.RequirePermission("finance.petty_cash_voucher.view"), pcvHandler.ListPettyCashVouchers)
		pcv.GET("/:id", middleware.RequirePermission("finance.petty_cash_voucher.view"), pcvHandler.GetPettyCashVoucherByID)
		pcv.POST("", middleware.RequirePermission("finance.petty_cash_voucher.create"), pcvHandler.CreatePettyCashVoucher)
		pcv.PUT("/:id", middleware.RequirePermission("finance.petty_cash_voucher.update"), pcvHandler.UpdatePettyCashVoucher)
		pcv.DELETE("/:id", middleware.RequirePermission("finance.petty_cash_voucher.delete"), pcvHandler.DeletePettyCashVoucher)
		pcv.POST("/:id/submit", middleware.RequirePermission("finance.petty_cash_voucher.submit"), pcvHandler.SubmitPettyCashVoucher)
		pcv.POST("/:id/approve", middleware.RequirePermission("finance.petty_cash_voucher.approve"), pcvHandler.ApprovePettyCashVoucher)
		pcv.POST("/:id/reject", middleware.RequirePermission("finance.petty_cash_voucher.reject"), pcvHandler.RejectPettyCashVoucher)
		pcv.POST("/:id/post", middleware.RequirePermission("finance.petty_cash_voucher.post"), pcvHandler.PostPettyCashVoucher)
	}

	// Petty Cash Replenishments
	pcr := finance.Group("/petty-cash-replenishments")
	{
		pcr.GET("", middleware.RequirePermission("finance.petty_cash_replenishment.view"), pcrHandler.ListPettyCashReplenishments)
		pcr.GET("/:id", middleware.RequirePermission("finance.petty_cash_replenishment.view"), pcrHandler.GetPettyCashReplenishmentByID)
		pcr.POST("", middleware.RequirePermission("finance.petty_cash_replenishment.create"), pcrHandler.CreatePettyCashReplenishment)
		pcr.PUT("/:id", middleware.RequirePermission("finance.petty_cash_replenishment.update"), pcrHandler.UpdatePettyCashReplenishment)
		pcr.DELETE("/:id", middleware.RequirePermission("finance.petty_cash_replenishment.delete"), pcrHandler.DeletePettyCashReplenishment)
		pcr.POST("/:id/submit", middleware.RequirePermission("finance.petty_cash_replenishment.submit"), pcrHandler.SubmitPettyCashReplenishment)
		pcr.POST("/:id/approve", middleware.RequirePermission("finance.petty_cash_replenishment.approve"), pcrHandler.ApprovePettyCashReplenishment)
		pcr.POST("/:id/reject", middleware.RequirePermission("finance.petty_cash_replenishment.reject"), pcrHandler.RejectPettyCashReplenishment)
		pcr.POST("/:id/post", middleware.RequirePermission("finance.petty_cash_replenishment.post"), pcrHandler.PostPettyCashReplenishment)
	}

	// Fixed Asset Handlers
	facHandler := handlers.NewFixedAssetCategoryHandler(logger)
	faHandler := handlers.NewFixedAssetHandler(logger)
	fadepHandler := handlers.NewFixedAssetDepreciationHandler(logger)
	fadispHandler := handlers.NewFixedAssetDisposalHandler(logger)

	// Fixed Asset Categories
	fac := finance.Group("/fixed-asset-categories")
	{
		fac.GET("", middleware.RequirePermission("finance.fixed_asset_category.view"), facHandler.ListFixedAssetCategories)
		fac.GET("/:id", middleware.RequirePermission("finance.fixed_asset_category.view"), facHandler.GetFixedAssetCategoryByID)
		fac.POST("", middleware.RequirePermission("finance.fixed_asset_category.create"), facHandler.CreateFixedAssetCategory)
		fac.PUT("/:id", middleware.RequirePermission("finance.fixed_asset_category.update"), facHandler.UpdateFixedAssetCategory)
		fac.DELETE("/:id", middleware.RequirePermission("finance.fixed_asset_category.delete"), facHandler.DeleteFixedAssetCategory)
	}

	// Fixed Assets
	fa := finance.Group("/fixed-assets")
	{
		fa.GET("", middleware.RequirePermission("finance.fixed_asset.view"), faHandler.ListFixedAssets)
		fa.GET("/:id", middleware.RequirePermission("finance.fixed_asset.view"), faHandler.GetFixedAssetByID)
		fa.POST("", middleware.RequirePermission("finance.fixed_asset.create"), faHandler.CreateFixedAsset)
		fa.PUT("/:id", middleware.RequirePermission("finance.fixed_asset.update"), faHandler.UpdateFixedAsset)
		fa.DELETE("/:id", middleware.RequirePermission("finance.fixed_asset.delete"), faHandler.DeleteFixedAsset)
	}

	// Fixed Asset Depreciation Runs
	fadep := finance.Group("/fixed-asset-depreciations")
	{
		fadep.GET("", middleware.RequirePermission("finance.fixed_asset_depreciation.view"), fadepHandler.ListDepreciationRuns)
		fadep.GET("/:id", middleware.RequirePermission("finance.fixed_asset_depreciation.view"), fadepHandler.GetDepreciationRunByID)
		fadep.POST("/preview", middleware.RequirePermission("finance.fixed_asset_depreciation.create"), fadepHandler.PreviewDepreciation)
		fadep.POST("", middleware.RequirePermission("finance.fixed_asset_depreciation.create"), fadepHandler.CreateDepreciationRun)
		fadep.DELETE("/:id", middleware.RequirePermission("finance.fixed_asset_depreciation.delete"), fadepHandler.DeleteDepreciationRun)
		fadep.POST("/:id/post", middleware.RequirePermission("finance.fixed_asset_depreciation.post"), fadepHandler.PostDepreciationRun)
	}

	// Fixed Asset Disposals
	fadisp := finance.Group("/fixed-asset-disposals")
	{
		fadisp.GET("", middleware.RequirePermission("finance.fixed_asset_disposal.view"), fadispHandler.ListFixedAssetDisposals)
		fadisp.GET("/:id", middleware.RequirePermission("finance.fixed_asset_disposal.view"), fadispHandler.GetFixedAssetDisposalByID)
		fadisp.POST("", middleware.RequirePermission("finance.fixed_asset_disposal.create"), fadispHandler.CreateFixedAssetDisposal)
		fadisp.PUT("/:id", middleware.RequirePermission("finance.fixed_asset_disposal.update"), fadispHandler.UpdateFixedAssetDisposal)
		fadisp.DELETE("/:id", middleware.RequirePermission("finance.fixed_asset_disposal.delete"), fadispHandler.DeleteFixedAssetDisposal)
		fadisp.POST("/:id/submit", middleware.RequirePermission("finance.fixed_asset_disposal.submit"), fadispHandler.SubmitFixedAssetDisposal)
		fadisp.POST("/:id/approve", middleware.RequirePermission("finance.fixed_asset_disposal.approve"), fadispHandler.ApproveFixedAssetDisposal)
		fadisp.POST("/:id/reject", middleware.RequirePermission("finance.fixed_asset_disposal.reject"), fadispHandler.RejectFixedAssetDisposal)
		fadisp.POST("/:id/post", middleware.RequirePermission("finance.fixed_asset_disposal.post"), fadispHandler.PostFixedAssetDisposal)
	}
	// General Ledger
	glHandler := handlers.NewGeneralLedgerHandler(logger)
	gl := finance.Group("/general-ledger")
	{
		gl.GET("", middleware.RequirePermission("finance.general_ledger.view"), glHandler.ListEntries)
		gl.POST("/rebuild", middleware.RequirePermission("finance.general_ledger.rebuild"), glHandler.RebuildLedger)
	}

	// Finance Reports
	frHandler := handlers.NewFinanceReportHandler(logger)
	reports := finance.Group("/reports")
	{
		reports.GET("/account-ledger", middleware.RequirePermission("finance.reports.view"), frHandler.AccountLedger)
		reports.GET("/trial-balance", middleware.RequirePermission("finance.reports.view"), frHandler.TrialBalance)
		reports.GET("/profit-loss", middleware.RequirePermission("finance.reports.view"), frHandler.ProfitLoss)
		reports.GET("/balance-sheet", middleware.RequirePermission("finance.reports.view"), frHandler.BalanceSheet)
		reports.GET("/cash-bank-book", middleware.RequirePermission("finance.reports.view"), frHandler.CashBankBook)
		reports.GET("/day-book", middleware.RequirePermission("finance.reports.view"), frHandler.DayBook)
		reports.GET("/journal-register", middleware.RequirePermission("finance.reports.view"), frHandler.JournalRegister)
		reports.GET("/payment-register", middleware.RequirePermission("finance.reports.view"), frHandler.PaymentRegister)
		reports.GET("/receipt-register", middleware.RequirePermission("finance.reports.view"), frHandler.ReceiptRegister)
	}
}
