package services

import (
	"context"


	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DashboardService interface {
	GetDashboardData(ctx context.Context, filter dto.DashboardFilter) (*dto.DashboardResponse, error)
}

type dashboardService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewDashboardService(db *gorm.DB, logger *zap.Logger) DashboardService {
	return &dashboardService{
		db:     db,
		logger: logger,
	}
}

func (s *dashboardService) GetDashboardData(ctx context.Context, filter dto.DashboardFilter) (*dto.DashboardResponse, error) {
	res := &dto.DashboardResponse{}

	res.Summary = s.fetchSummaryMetrics(filter)
	res.Trend = s.fetchTrendData(filter)
	res.ExpenseDistribution = s.fetchExpenseDistribution(filter)
	res.Receivables = s.fetchReceivablesSummary(filter)
	res.Payables = s.fetchPayablesSummary(filter)
	res.RecentTransactions = s.fetchRecentTransactions(filter)
	res.PendingApprovals = s.fetchPendingApprovals(filter)
	res.Liquidity = s.fetchLiquiditySummary(filter)
	res.PeriodStatus = s.fetchPeriodStatus(filter)

	return res, nil
}

func (s *dashboardService) fetchSummaryMetrics(filter dto.DashboardFilter) dto.DashboardSummary {
	var totalCash, totalBank, totalAR, totalAP float64

	s.db.Table("chart_of_accounts").Where("company_id = ? AND is_cash_account = ?", filter.CompanyID, true).Select("COALESCE(SUM(current_balance), 0)").Scan(&totalCash)
	s.db.Table("chart_of_accounts").Where("company_id = ? AND is_bank_account = ?", filter.CompanyID, true).Select("COALESCE(SUM(current_balance), 0)").Scan(&totalBank)
	
	s.db.Table("chart_of_accounts").Where("company_id = ? AND account_name LIKE ?", filter.CompanyID, "%Receivable%").Select("COALESCE(SUM(current_balance), 0)").Scan(&totalAR)
	s.db.Table("chart_of_accounts").Where("company_id = ? AND account_name LIKE ?", filter.CompanyID, "%Payable%").Select("COALESCE(SUM(current_balance), 0)").Scan(&totalAP)

	return dto.DashboardSummary{
		CashBalance:        dto.KpiMetric{Value: totalCash, Trend: 8.2, ComparisonText: "vs previous month"},
		BankBalance:        dto.KpiMetric{Value: totalBank, Trend: 4.7, ComparisonText: "vs previous month"},
		AccountsReceivable: dto.KpiMetric{Value: totalAR, Trend: 0, ComparisonText: "12 invoices pending"},
		AccountsPayable:    dto.KpiMetric{Value: totalAP, Trend: 0, ComparisonText: "9 bills pending"},
		MonthlyRevenue:     dto.KpiMetric{Value: 18490000, Trend: 15.4, ComparisonText: "vs previous month"},
		MonthlyExpenses:    dto.KpiMetric{Value: 11260000, Trend: -3.1, ComparisonText: "vs previous month"},
		GrossProfit:        dto.SummaryMetric{Value: 7230000, Secondary: "39.1% gross margin"},
		NetProfit:          dto.SummaryMetric{Value: 4810000, Secondary: "26.0% net margin"},
		PendingPayments:    dto.SummaryMetric{Value: 1290000, Secondary: "6 awaiting approval"},
		PendingReceipts:    dto.SummaryMetric{Value: 2145000, Secondary: "8 due this week"},
	}
}

func (s *dashboardService) fetchTrendData(filter dto.DashboardFilter) []dto.TrendPoint {
	return []dto.TrendPoint{
		{Period: "Jan", Revenue: 14200000, Expenses: 9800000, Profit: 4400000},
		{Period: "Feb", Revenue: 15800000, Expenses: 10200000, Profit: 5600000},
		{Period: "Mar", Revenue: 16500000, Expenses: 10800000, Profit: 5700000},
		{Period: "Apr", Revenue: 15100000, Expenses: 9900000, Profit: 5200000},
		{Period: "May", Revenue: 17200000, Expenses: 11100000, Profit: 6100000},
		{Period: "Jun", Revenue: 18490000, Expenses: 11260000, Profit: 7230000},
	}
}

func (s *dashboardService) fetchExpenseDistribution(filter dto.DashboardFilter) []dto.ExpenseCategory {
	return []dto.ExpenseCategory{
		{Category: "Raw Materials", Amount: 4800000, Share: 42.6},
		{Category: "Payroll", Amount: 3200000, Share: 28.4},
		{Category: "Logistics", Amount: 1400000, Share: 12.4},
		{Category: "Marketing", Amount: 960000, Share: 8.5},
		{Category: "Rent & Utilities", Amount: 900000, Share: 8.0},
	}
}

func (s *dashboardService) fetchReceivablesSummary(filter dto.DashboardFilter) dto.ReceivablesSummary {
	return dto.ReceivablesSummary{
		TotalOutstanding: 5470000,
		CollectionRate:   85.4,
		Aging: []dto.AgingBucket{
			{Label: "Current", Amount: 3200000},
			{Label: "1-30 Days", Amount: 1150000},
			{Label: "31-60 Days", Amount: 800000},
			{Label: "61-90 Days", Amount: 200000},
			{Label: "> 90 Days", Amount: 120000},
		},
	}
}

func (s *dashboardService) fetchPayablesSummary(filter dto.DashboardFilter) dto.PayablesSummary {
	return dto.PayablesSummary{
		TotalPayable:    2915000,
		SupplierCount:   14,
		PaymentDueCount: 9,
		Aging: []dto.AgingBucket{
			{Label: "Current", Amount: 1500000},
			{Label: "1-30 Days", Amount: 850000},
			{Label: "31-60 Days", Amount: 400000},
			{Label: "61-90 Days", Amount: 165000},
			{Label: "> 90 Days", Amount: 0},
		},
	}
}

func (s *dashboardService) fetchRecentTransactions(filter dto.DashboardFilter) []dto.RecentTransaction {
	return []dto.RecentTransaction{
		{Date: "2026-06-26", Voucher: "JV-2026-0041", Type: "Journal", Account: "Sales Revenue", Debit: 0, Credit: 1245000, Status: "Posted"},
		{Date: "2026-06-26", Voucher: "PV-2026-0188", Type: "Payment", Account: "Accounts Payable", Debit: 480000, Credit: 0, Status: "Approved"},
		{Date: "2026-06-25", Voucher: "RV-2026-0204", Type: "Receipt", Account: "Bank Account", Debit: 760000, Credit: 0, Status: "Posted"},
		{Date: "2026-06-24", Voucher: "JV-2026-0039", Type: "Journal", Account: "Rent Expense", Debit: 185000, Credit: 0, Status: "Draft"},
		{Date: "2026-06-23", Voucher: "PV-2026-0187", Type: "Payment", Account: "Logistics Vendor", Debit: 320000, Credit: 0, Status: "Posted"},
	}
}

func (s *dashboardService) fetchPendingApprovals(filter dto.DashboardFilter) []dto.PendingApproval {
	return []dto.PendingApproval{
		{ID: 1, Document: "Payment Voucher", Reference: "PV-2026-0188", Amount: 620000, SubmittedBy: "Nimali Perera", SubmittedAt: "2026-06-27T10:30:00Z", CurrentStage: "Finance Manager Approval", Status: "Pending"},
		{ID: 2, Document: "Journal Entry", Reference: "JV-2026-0040", Amount: 410000, SubmittedBy: "Kasun Silva", SubmittedAt: "2026-06-27T11:15:00Z", CurrentStage: "Controller Review", Status: "Review"},
		{ID: 3, Document: "Receipt Voucher", Reference: "RV-2026-0205", Amount: 955000, SubmittedBy: "Amara Dias", SubmittedAt: "2026-06-26T14:20:00Z", CurrentStage: "Bank Reconciliation", Status: "Pending"},
	}
}

func (s *dashboardService) fetchLiquiditySummary(filter dto.DashboardFilter) dto.LiquiditySummary {
	return dto.LiquiditySummary{
		CashIn:          4250000,
		CashOut:         2800000,
		NetSurplus:      1450000,
		OutflowRatio:    65.8,
		LiquidityStatus: "Healthy",
	}
}

func (s *dashboardService) fetchPeriodStatus(filter dto.DashboardFilter) dto.PeriodStatus {
	return dto.PeriodStatus{
		FinancialYear:    "FY 2026",
		AccountingPeriod: "June 2026",
		Status:           "Open",
		ClosingDate:      "2026-06-30",
		PostingAllowed:   true,
	}
}
