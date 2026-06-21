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

	// Routes
	finance := r.Group("")

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
		pv.GET("", middleware.RequirePermission("finance.payments.view"), pvHandler.ListPaymentVouchers)
		pv.GET("/:id", middleware.RequirePermission("finance.payments.view"), pvHandler.GetPaymentVoucherByID)
		pv.POST("", middleware.RequirePermission("finance.payments.create"), pvHandler.CreatePaymentVoucher)
		pv.PUT("/:id", middleware.RequirePermission("finance.payments.update"), pvHandler.UpdatePaymentVoucher)
		pv.DELETE("/:id", middleware.RequirePermission("finance.payments.delete"), pvHandler.DeletePaymentVoucher)
		pv.POST("/:id/submit", middleware.RequirePermission("finance.payments.submit"), pvHandler.SubmitPaymentVoucher)
		pv.POST("/:id/approve", middleware.RequirePermission("finance.payments.approve"), pvHandler.ApprovePaymentVoucher)
		pv.POST("/:id/reject", middleware.RequirePermission("finance.payments.reject"), pvHandler.RejectPaymentVoucher)
		pv.POST("/:id/post", middleware.RequirePermission("finance.payments.post"), pvHandler.PostPaymentVoucher)
	}

	// Receipt Vouchers
	rvHandler := handlers.NewReceiptVoucherHandler(logger)
	rv := finance.Group("/receipt-vouchers")
	{
		rv.GET("", middleware.RequirePermission("finance.receipts.view"), rvHandler.ListReceiptVouchers)
		rv.GET("/:id", middleware.RequirePermission("finance.receipts.view"), rvHandler.GetReceiptVoucherByID)
		rv.POST("", middleware.RequirePermission("finance.receipts.create"), rvHandler.CreateReceiptVoucher)
		rv.PUT("/:id", middleware.RequirePermission("finance.receipts.update"), rvHandler.UpdateReceiptVoucher)
		rv.DELETE("/:id", middleware.RequirePermission("finance.receipts.delete"), rvHandler.DeleteReceiptVoucher)
		rv.POST("/:id/submit", middleware.RequirePermission("finance.receipts.submit"), rvHandler.SubmitReceiptVoucher)
		rv.POST("/:id/approve", middleware.RequirePermission("finance.receipts.approve"), rvHandler.ApproveReceiptVoucher)
		rv.POST("/:id/reject", middleware.RequirePermission("finance.receipts.reject"), rvHandler.RejectReceiptVoucher)
		rv.POST("/:id/post", middleware.RequirePermission("finance.receipts.post"), rvHandler.PostReceiptVoucher)
	}
}
