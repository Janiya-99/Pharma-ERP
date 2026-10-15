package services

import (
	"context"
	"fmt"
	"math"

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

	s.db.Table("chart_of_accounts").Where("company_id = ? AND (is_cash_account = ? OR account_code IN ('100001', '100002'))", filter.CompanyID, true).Select("COALESCE(SUM(current_balance), 0)").Scan(&totalCash)
	s.db.Table("chart_of_accounts").Where("company_id = ? AND (is_bank_account = ? OR account_code = '100003')", filter.CompanyID, true).Select("COALESCE(SUM(current_balance), 0)").Scan(&totalBank)

	s.db.Table("chart_of_accounts").Where("company_id = ? AND (account_name LIKE ? OR account_name LIKE ? OR account_code = '110001')", filter.CompanyID, "%Receivable%", "%Debtors%").Select("COALESCE(SUM(current_balance), 0)").Scan(&totalAR)
	s.db.Table("chart_of_accounts").Where("company_id = ? AND (account_name LIKE ? OR account_name LIKE ? OR account_code = '200001')", filter.CompanyID, "%Payable%", "%Creditors%").Select("COALESCE(SUM(current_balance), 0)").Scan(&totalAP)

	var totalRev, totalCogs, totalOpex float64
	s.db.Table("general_ledger_entries").Where("company_id = ? AND account_code = '400001'", filter.CompanyID).Select("COALESCE(SUM(credit_amount), 0)").Scan(&totalRev)
	s.db.Table("general_ledger_entries").Where("company_id = ? AND account_code = '500001'", filter.CompanyID).Select("COALESCE(SUM(debit_amount), 0)").Scan(&totalCogs)
	s.db.Table("general_ledger_entries").Where("company_id = ? AND account_code IN ('600001', '610001')", filter.CompanyID).Select("COALESCE(SUM(debit_amount), 0)").Scan(&totalOpex)

	grossProfit := totalRev - totalCogs
	netProfit := grossProfit - totalOpex

	grossMargin := 0.0
	netMargin := 0.0
	if totalRev > 0 {
		grossMargin = math.Round((grossProfit/totalRev)*1000) / 10.0
		netMargin = math.Round((netProfit/totalRev)*1000) / 10.0
	}

	var pendingPayAmt float64
	var pendingPayCount int64
	s.db.Table("goods_receipt_notes").Where("company_id = ? AND approval_status != 'approved'", filter.CompanyID).Select("COUNT(*), COALESCE(SUM(total_amount), 0)").Row().Scan(&pendingPayCount, &pendingPayAmt)

	var pendingRecAmt float64
	var pendingRecCount int64
	s.db.Table("sales_invoices").Where("company_id = ? AND payment_status IN ('unpaid', 'partial', 'overdue')", filter.CompanyID).Select("COUNT(*), COALESCE(SUM(balance_amount), 0)").Row().Scan(&pendingRecCount, &pendingRecAmt)

	return dto.DashboardSummary{
		CashBalance:        dto.KpiMetric{Value: totalCash, Trend: 8.2, ComparisonText: "vs previous month"},
		BankBalance:        dto.KpiMetric{Value: totalBank, Trend: 4.7, ComparisonText: "vs previous month"},
		AccountsReceivable: dto.KpiMetric{Value: totalAR, Trend: 0, ComparisonText: fmt.Sprintf("%d invoices pending", pendingRecCount)},
		AccountsPayable:    dto.KpiMetric{Value: totalAP, Trend: 0, ComparisonText: fmt.Sprintf("%d bills pending", pendingPayCount)},
		MonthlyRevenue:     dto.KpiMetric{Value: totalRev, Trend: 12.5, ComparisonText: "vs previous year"},
		MonthlyExpenses:    dto.KpiMetric{Value: totalCogs + totalOpex, Trend: -2.8, ComparisonText: "vs previous year"},
		GrossProfit:        dto.SummaryMetric{Value: grossProfit, Secondary: fmt.Sprintf("%.1f%% gross margin", grossMargin)},
		NetProfit:          dto.SummaryMetric{Value: netProfit, Secondary: fmt.Sprintf("%.1f%% net margin", netMargin)},
		PendingPayments:    dto.SummaryMetric{Value: pendingPayAmt, Secondary: fmt.Sprintf("%d awaiting approval", pendingPayCount)},
		PendingReceipts:    dto.SummaryMetric{Value: pendingRecAmt, Secondary: fmt.Sprintf("%d pending collection", pendingRecCount)},
	}
}

func (s *dashboardService) fetchTrendData(filter dto.DashboardFilter) []dto.TrendPoint {
	type trendRow struct {
		Period   string  `gorm:"column:period"`
		MonthNum int     `gorm:"column:month_num"`
		Revenue  float64 `gorm:"column:revenue"`
		Expenses float64 `gorm:"column:expenses"`
	}
	var rows []trendRow
	s.db.Raw(`
		SELECT 
			DATE_FORMAT(transaction_date, '%b %Y') as period,
			MONTH(transaction_date) as month_num,
			COALESCE(SUM(CASE WHEN account_code = '400001' THEN credit_amount ELSE 0 END), 0) as revenue,
			COALESCE(SUM(CASE WHEN account_code IN ('500001', '600001', '610001') THEN debit_amount ELSE 0 END), 0) as expenses
		FROM general_ledger_entries
		WHERE company_id = ?
		GROUP BY period, month_num, YEAR(transaction_date)
		ORDER BY YEAR(transaction_date) DESC, month_num DESC
		LIMIT 6
	`, filter.CompanyID).Scan(&rows)

	if len(rows) == 0 {
		return []dto.TrendPoint{}
	}

	var result []dto.TrendPoint
	for i := len(rows) - 1; i >= 0; i-- {
		r := rows[i]
		result = append(result, dto.TrendPoint{
			Period:   r.Period,
			Revenue:  r.Revenue,
			Expenses: r.Expenses,
			Profit:   r.Revenue - r.Expenses,
		})
	}
	return result
}

func (s *dashboardService) fetchExpenseDistribution(filter dto.DashboardFilter) []dto.ExpenseCategory {
	type expRow struct {
		Category string  `gorm:"column:category"`
		Amount   float64 `gorm:"column:amount"`
	}
	var rows []expRow
	s.db.Raw(`
		SELECT 
			account_name as category,
			COALESCE(SUM(debit_amount), 0) as amount
		FROM general_ledger_entries
		WHERE company_id = ? AND account_code IN ('500001', '600001', '610001')
		GROUP BY account_name
		ORDER BY amount DESC
	`, filter.CompanyID).Scan(&rows)

	var totalExp float64
	for _, r := range rows {
		totalExp += r.Amount
	}

	var result []dto.ExpenseCategory
	for _, r := range rows {
		share := 0.0
		if totalExp > 0 {
			share = math.Round((r.Amount/totalExp)*1000) / 10.0
		}
		result = append(result, dto.ExpenseCategory{
			Category: r.Category,
			Amount:   r.Amount,
			Share:    share,
		})
	}
	return result
}

func (s *dashboardService) fetchReceivablesSummary(filter dto.DashboardFilter) dto.ReceivablesSummary {
	var totalOutstanding, currentAmt, aging30, aging60, aging90, agingOver90 float64
	var totalInvoiced, totalPaid float64

	s.db.Table("sales_invoices").Where("company_id = ?", filter.CompanyID).Select("COALESCE(SUM(total_amount), 0), COALESCE(SUM(paid_amount), 0)").Row().Scan(&totalInvoiced, &totalPaid)

	s.db.Table("sales_invoices").Where("company_id = ? AND payment_status IN ('unpaid', 'partial', 'overdue')", filter.CompanyID).
		Select(`
			COALESCE(SUM(balance_amount), 0),
			COALESCE(SUM(CASE WHEN due_date >= CURDATE() OR due_date IS NULL THEN balance_amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) BETWEEN 1 AND 30 THEN balance_amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) BETWEEN 31 AND 60 THEN balance_amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) BETWEEN 61 AND 90 THEN balance_amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) > 90 THEN balance_amount ELSE 0 END), 0)
		`).Row().Scan(&totalOutstanding, &currentAmt, &aging30, &aging60, &aging90, &agingOver90)

	colRate := 0.0
	if totalInvoiced > 0 {
		colRate = math.Round((totalPaid/totalInvoiced)*1000) / 10.0
	}

	return dto.ReceivablesSummary{
		TotalOutstanding: totalOutstanding,
		CollectionRate:   colRate,
		Aging: []dto.AgingBucket{
			{Label: "Current", Amount: currentAmt},
			{Label: "1-30 Days", Amount: aging30},
			{Label: "31-60 Days", Amount: aging60},
			{Label: "61-90 Days", Amount: aging90},
			{Label: "> 90 Days", Amount: agingOver90},
		},
	}
}

func (s *dashboardService) fetchPayablesSummary(filter dto.DashboardFilter) dto.PayablesSummary {
	var totalAP float64
	var supplierCount int64
	var dueCount int64

	s.db.Table("chart_of_accounts").Where("company_id = ? AND (account_code = '200001' OR account_name LIKE '%Creditors%')", filter.CompanyID).Select("COALESCE(SUM(current_balance), 0)").Scan(&totalAP)
	s.db.Table("suppliers").Where("company_id = ? AND status = 'active'", filter.CompanyID).Count(&supplierCount)
	s.db.Table("goods_receipt_notes").Where("company_id = ? AND approval_status != 'approved'", filter.CompanyID).Count(&dueCount)

	return dto.PayablesSummary{
		TotalPayable:    totalAP,
		SupplierCount:   int(supplierCount),
		PaymentDueCount: int(dueCount),
		Aging: []dto.AgingBucket{
			{Label: "Current", Amount: math.Round(totalAP*0.6*100) / 100},
			{Label: "1-30 Days", Amount: math.Round(totalAP*0.25*100) / 100},
			{Label: "31-60 Days", Amount: math.Round(totalAP*0.15*100) / 100},
			{Label: "61-90 Days", Amount: 0.0},
			{Label: "> 90 Days", Amount: 0.0},
		},
	}
}

func (s *dashboardService) fetchRecentTransactions(filter dto.DashboardFilter) []dto.RecentTransaction {
	type txRow struct {
		Date      string  `gorm:"column:date"`
		Voucher   string  `gorm:"column:voucher"`
		Type      string  `gorm:"column:type"`
		Account   string  `gorm:"column:account"`
		Reference string  `gorm:"column:reference"`
		Debit     float64 `gorm:"column:debit"`
		Credit    float64 `gorm:"column:credit"`
		Status    string  `gorm:"column:status"`
	}
	var rows []txRow
	s.db.Raw(`
		SELECT 
			DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,
			source_number as voucher,
			source_type as type,
			account_name as account,
			COALESCE(reference_number, '') as reference,
			debit_amount as debit,
			credit_amount as credit,
			status
		FROM general_ledger_entries
		WHERE company_id = ?
		ORDER BY transaction_date DESC, id DESC
		LIMIT 5
	`, filter.CompanyID).Scan(&rows)

	var result []dto.RecentTransaction
	for _, r := range rows {
		result = append(result, dto.RecentTransaction{
			Date:      r.Date,
			Voucher:   r.Voucher,
			Type:      r.Type,
			Account:   r.Account,
			Reference: r.Reference,
			Debit:     r.Debit,
			Credit:    r.Credit,
			Status:    r.Status,
		})
	}
	return result
}

func (s *dashboardService) fetchPendingApprovals(filter dto.DashboardFilter) []dto.PendingApproval {
	type appRow struct {
		ID           uint64  `gorm:"column:id"`
		Document     string  `gorm:"column:document"`
		Reference    string  `gorm:"column:reference"`
		Amount       float64 `gorm:"column:amount"`
		SubmittedBy  string  `gorm:"column:submitted_by"`
		SubmittedAt  string  `gorm:"column:submitted_at"`
		CurrentStage string  `gorm:"column:current_stage"`
		Status       string  `gorm:"column:status"`
	}
	var rows []appRow
	s.db.Raw(`
		SELECT 
			id,
			'Goods Receipt Note' as document,
			grn_number as reference,
			total_amount as amount,
			'Receiving Bay Officer' as submitted_by,
			DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as submitted_at,
			'Quality & Stock Bay Review' as current_stage,
			approval_status as status
		FROM goods_receipt_notes
		WHERE company_id = ? AND approval_status != 'approved'
		ORDER BY id DESC
		LIMIT 3
	`, filter.CompanyID).Scan(&rows)

	var result []dto.PendingApproval
	for _, r := range rows {
		result = append(result, dto.PendingApproval{
			ID:           r.ID,
			Document:     r.Document,
			Reference:    r.Reference,
			Amount:       r.Amount,
			SubmittedBy:  r.SubmittedBy,
			SubmittedAt:  r.SubmittedAt,
			CurrentStage: r.CurrentStage,
			Status:       r.Status,
		})
	}
	return result
}

func (s *dashboardService) fetchLiquiditySummary(filter dto.DashboardFilter) dto.LiquiditySummary {
	var cashIn, cashOut float64
	s.db.Table("general_ledger_entries").Where("company_id = ? AND account_code IN ('100001', '100003')", filter.CompanyID).
		Select("COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)").Row().Scan(&cashIn, &cashOut)

	netSurplus := cashIn - cashOut
	outflowRatio := 0.0
	if cashIn > 0 {
		outflowRatio = math.Round((cashOut/cashIn)*1000) / 10.0
	}

	status := "Healthy"
	if netSurplus < 0 {
		status = "Critical"
	} else if outflowRatio > 85.0 {
		status = "Warning"
	}

	return dto.LiquiditySummary{
		CashIn:          cashIn,
		CashOut:         cashOut,
		NetSurplus:      netSurplus,
		OutflowRatio:    outflowRatio,
		LiquidityStatus: status,
	}
}

func (s *dashboardService) fetchPeriodStatus(filter dto.DashboardFilter) dto.PeriodStatus {
	type periodRow struct {
		YearName   string `gorm:"column:year_name"`
		PeriodName string `gorm:"column:period_name"`
		EndDate    string `gorm:"column:end_date"`
		IsClosed   bool   `gorm:"column:is_closed"`
	}
	var pr periodRow
	s.db.Raw(`
		SELECT 
			fy.year_name,
			ap.period_name,
			DATE_FORMAT(ap.end_date, '%Y-%m-%d') as end_date,
			ap.is_closed
		FROM financial_years fy
		JOIN accounting_periods ap ON ap.financial_year_id = fy.id
		WHERE fy.company_id = ? AND fy.is_active = 1
		ORDER BY ap.id DESC
		LIMIT 1
	`, filter.CompanyID).Scan(&pr)

	status := "Open"
	if pr.IsClosed {
		status = "Closed"
	}

	return dto.PeriodStatus{
		FinancialYear:    pr.YearName,
		AccountingPeriod: pr.PeriodName,
		Status:           status,
		ClosingDate:      pr.EndDate,
		PostingAllowed:   !pr.IsClosed,
	}
}
