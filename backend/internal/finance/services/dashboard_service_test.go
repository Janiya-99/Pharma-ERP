package services

import (
	"strings"
	"testing"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
)

func TestDashboardService_AlertsGeneration(t *testing.T) {
	svc := &dashboardService{}

	filter := dto.DashboardFilter{
		CompanyID: 1,
	}

	summary := dto.DashboardSummary{
		CashBalance: dto.KpiMetric{Value: 5000000.00},  // 5M Cash in Hand
		BankBalance: dto.KpiMetric{Value: 88107675.10}, // 88.1M Bank Balance
	}

	rec := dto.ReceivablesSummary{
		TotalOutstanding: 4550000.00,
		OverdueAmount:    1250000.00,
		OverdueCount:     8,
	}

	pay := dto.PayablesSummary{
		TotalPayable:    3420000.00,
		PaymentDueCount: 4,
	}

	liq := dto.LiquiditySummary{
		LiquidityStatus: "Healthy",
		NetSurplus:      93107675.10,
	}

	period := dto.PeriodStatus{
		FinancialYear:    "2026/2027",
		AccountingPeriod: "April 2026",
		Status:           "Open",
		PostingAllowed:   true,
	}

	alerts := svc.fetchAlerts(filter, summary, rec, pay, liq, period)

	if len(alerts) != 5 {
		t.Fatalf("expected 5 alerts, got %d", len(alerts))
	}

	// 1. Verify Overdue AR alert is dynamic and does not contain hardcoded 11,950,421 or 56
	var arAlert *dto.FinancialAlertItem
	for i := range alerts {
		if alerts[i].ID == "alt-ar-overdue" {
			arAlert = &alerts[i]
			break
		}
	}
	if arAlert == nil {
		t.Fatal("expected alt-ar-overdue alert to be present")
	}
	if !strings.Contains(arAlert.Title, "8 customer invoices are overdue") {
		t.Fatalf("unexpected AR alert title: %s", arAlert.Title)
	}
	if !strings.Contains(arAlert.Subtitle, "1250000.00") {
		t.Fatalf("unexpected AR alert subtitle: %s", arAlert.Subtitle)
	}

	// 2. Verify Liquidity Alert displays dynamic cash numbers (5.0M and 88.1M) and NOT hardcoded 32.4M
	var liqAlert *dto.FinancialAlertItem
	for i := range alerts {
		if alerts[i].ID == "alt-liquidity" {
			liqAlert = &alerts[i]
			break
		}
	}
	if liqAlert == nil {
		t.Fatal("expected alt-liquidity alert to be present")
	}
	if strings.Contains(liqAlert.Subtitle, "32.4M") {
		t.Fatalf("liquidity alert contains obsolete hardcoded 32.4M: %s", liqAlert.Subtitle)
	}
	if !strings.Contains(liqAlert.Subtitle, "5.0M") || !strings.Contains(liqAlert.Subtitle, "88.1M") {
		t.Fatalf("expected liquidity alert to display Cash 5.0M and Bank 88.1M, got: %s", liqAlert.Subtitle)
	}

	// 3. Verify Supplier Payables Alert
	var apAlert *dto.FinancialAlertItem
	for i := range alerts {
		if alerts[i].ID == "alt-ap-pending" {
			apAlert = &alerts[i]
			break
		}
	}
	if apAlert == nil {
		t.Fatal("expected alt-ap-pending alert to be present")
	}
	if !strings.Contains(apAlert.Title, "4 supplier bills pending") {
		t.Fatalf("unexpected AP alert title: %s", apAlert.Title)
	}
}

func TestDashboardService_AlertsWhenNoOverdue(t *testing.T) {
	svc := &dashboardService{}

	filter := dto.DashboardFilter{CompanyID: 1}
	summary := dto.DashboardSummary{
		CashBalance: dto.KpiMetric{Value: 1000000.00},
		BankBalance: dto.KpiMetric{Value: 5000000.00},
	}
	rec := dto.ReceivablesSummary{
		TotalOutstanding: 2000000.00,
		OverdueAmount:    0,
		OverdueCount:     0,
	}
	pay := dto.PayablesSummary{
		TotalPayable:    0,
		PaymentDueCount: 0,
	}
	liq := dto.LiquiditySummary{
		LiquidityStatus: "Healthy",
	}
	period := dto.PeriodStatus{
		FinancialYear:    "2026/2027",
		AccountingPeriod: "April 2026",
		Status:           "Open",
		PostingAllowed:   true,
	}

	alerts := svc.fetchAlerts(filter, summary, rec, pay, liq, period)

	var arAlert *dto.FinancialAlertItem
	for i := range alerts {
		if alerts[i].ID == "alt-ar-clear" {
			arAlert = &alerts[i]
			break
		}
	}
	if arAlert == nil {
		t.Fatal("expected alt-ar-clear alert when overdue count is zero")
	}
	if arAlert.Severity != "Low" {
		t.Fatalf("expected Low severity, got %s", arAlert.Severity)
	}
}
