package services

import (
	"math"
	"testing"

	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

func TestCalculateBalanceSheet_ClassificationsAndReconciliation(t *testing.T) {
	svc := &FinanceReportService{}

	// Scenario matching the user's figures:
	// Total Assets: 190,565,999.44 (Trade Debtors 100M, Inventory 50M, Bank 40,565,999.44)
	// Liabilities: 184,141,022.18 (Trade Creditors)
	// Net Profit: 6,424,977.26 (Revenues 115M - Expenses 108,575,022.74)
	// Total Liabilities + Equity: 190,565,999.44
	rawLines := []repositories.TrialBalanceRawLine{
		{
			AccountID:          1,
			AccountCode:        "110001",
			AccountName:        "Trade Debtors",
			ClassificationType: "Balance Sheet",
			ClassificationName: "Trade Receivables",
			NormalBalance:      "Debit", // Note uppercase "Debit"
			PeriodDebit:        100000000.00,
			PeriodCredit:       0,
		},
		{
			AccountID:          2,
			AccountCode:        "120001",
			AccountName:        "Inventory Account",
			ClassificationType: "Balance Sheet",
			ClassificationName: "Inventory",
			NormalBalance:      "Debit",
			PeriodDebit:        50000000.00,
			PeriodCredit:       0,
		},
		{
			AccountID:          3,
			AccountCode:        "100003",
			AccountName:        "Bank Account",
			ClassificationType: "Balance Sheet",
			ClassificationName: "Cash and Cash Equivalents",
			NormalBalance:      "Debit",
			PeriodDebit:        40565999.44,
			PeriodCredit:       0,
		},
		{
			AccountID:          4,
			AccountCode:        "200001",
			AccountName:        "Trade Creditors",
			ClassificationType: "Balance Sheet",
			ClassificationName: "Trade Payables",
			NormalBalance:      "Credit",
			PeriodDebit:        0,
			PeriodCredit:       184141022.18,
		},
		{
			AccountID:          5,
			AccountCode:        "400001",
			AccountName:        "Sales Revenue",
			ClassificationType: "Profit & Loss",
			ClassificationName: "Operating Revenue",
			NormalBalance:      "Credit",
			PeriodDebit:        0,
			PeriodCredit:       115000000.00,
		},
		{
			AccountID:          6,
			AccountCode:        "500001",
			AccountName:        "Cost of Goods Sold",
			ClassificationType: "Profit & Loss",
			ClassificationName: "Direct Expenses",
			NormalBalance:      "Debit",
			PeriodDebit:        108575022.74,
			PeriodCredit:       0,
		},
	}

	report := svc.CalculateBalanceSheet(rawLines)

	// 1. Verify Assets are NOT 0 and accounts are in Assets section
	if report.TotalAssets != 190565999.44 {
		t.Fatalf("Expected TotalAssets 190565999.44, got %f", report.TotalAssets)
	}
	if len(report.Assets.Lines) != 3 {
		t.Fatalf("Expected 3 asset accounts, got %d", len(report.Assets.Lines))
	}

	// 2. Verify Liabilities contains Trade Creditors and NOT asset accounts
	if report.TotalLiabilities != 184141022.18 {
		t.Fatalf("Expected TotalLiabilities 184141022.18, got %f", report.TotalLiabilities)
	}
	if len(report.Liabilities.Lines) != 1 {
		t.Fatalf("Expected 1 liability account, got %d", len(report.Liabilities.Lines))
	}
	if report.Liabilities.Lines[0].AccountCode != "200001" {
		t.Fatalf("Expected 200001 in Liabilities, got %s", report.Liabilities.Lines[0].AccountCode)
	}

	// 3. Verify Equity contains Net Income
	expectedNetIncome := 6424977.26
	if math.Abs(report.NetIncome-expectedNetIncome) > 0.01 {
		t.Fatalf("Expected NetIncome %f, got %f", expectedNetIncome, report.NetIncome)
	}
	if math.Abs(report.TotalEquity-expectedNetIncome) > 0.01 {
		t.Fatalf("Expected TotalEquity %f, got %f", expectedNetIncome, report.TotalEquity)
	}

	// 4. Verify Total Liabilities + Equity
	expectedLAndE := 190565999.44
	if math.Abs(report.TotalLiabilitiesAndEquity-expectedLAndE) > 0.01 {
		t.Fatalf("Expected TotalLiabilitiesAndEquity %f, got %f", expectedLAndE, report.TotalLiabilitiesAndEquity)
	}

	// 5. Verify Balance Status
	if !report.IsBalanced {
		t.Fatalf("Expected report to be Balanced, but IsBalanced=false (Difference: %f)", report.Difference)
	}
	if math.Abs(report.Difference) > 0.01 {
		t.Fatalf("Expected Difference 0.00, got %f", report.Difference)
	}

	// 6. Verify Financial Ratios
	expectedWorkingCapital := math.Round((report.CurrentAssets-report.CurrentLiabilities)*100) / 100
	if math.Abs(report.WorkingCapital-expectedWorkingCapital) > 0.01 {
		t.Fatalf("Expected WorkingCapital %f, got %f", expectedWorkingCapital, report.WorkingCapital)
	}
	expectedCurrentRatio := math.Round((190565999.44/184141022.18)*100) / 100
	if report.CurrentRatio != expectedCurrentRatio {
		t.Fatalf("Expected CurrentRatio %f, got %f", expectedCurrentRatio, report.CurrentRatio)
	}
}

func TestCalculateBalanceSheet_UnbalancedDetection(t *testing.T) {
	svc := &FinanceReportService{}

	// Deliberate imbalance: Assets = 100,000, Liabilities = 80,000, Equity = 0
	rawLines := []repositories.TrialBalanceRawLine{
		{
			AccountID:     1,
			AccountCode:   "100001",
			AccountName:   "Cash in Hand",
			NormalBalance: "debit",
			PeriodDebit:   100000.00,
		},
		{
			AccountID:     2,
			AccountCode:   "200001",
			AccountName:   "Trade Creditors",
			NormalBalance: "credit",
			PeriodCredit:  80000.00,
		},
	}

	report := svc.CalculateBalanceSheet(rawLines)

	if report.IsBalanced {
		t.Fatalf("Expected report to be UNBALANCED, but IsBalanced was true")
	}
	if report.Difference != 20000.00 {
		t.Fatalf("Expected Difference 20000.00, got %f", report.Difference)
	}
}

func TestCalculateBalanceSheet_ContraAssets(t *testing.T) {
	svc := &FinanceReportService{}

	// Contra-asset: Fixed Asset 500,000 Dr, Accumulated Depreciation 100,000 Cr
	rawLines := []repositories.TrialBalanceRawLine{
		{
			AccountID:     1,
			AccountCode:   "150001",
			AccountName:   "Plant & Machinery",
			NormalBalance: "Debit",
			PeriodDebit:   500000.00,
		},
		{
			AccountID:     2,
			AccountCode:   "150002",
			AccountName:   "Accumulated Depreciation - Plant",
			NormalBalance: "Credit",
			PeriodCredit:  100000.00,
		},
		{
			AccountID:     3,
			AccountCode:   "300001",
			AccountName:   "Share Capital",
			NormalBalance: "Credit",
			PeriodCredit:  400000.00,
		},
	}

	report := svc.CalculateBalanceSheet(rawLines)

	// Total Assets should be 500,000 - 100,000 = 400,000
	if report.TotalAssets != 400000.00 {
		t.Fatalf("Expected Net TotalAssets 400000.00, got %f", report.TotalAssets)
	}
	if report.TotalEquity != 400000.00 {
		t.Fatalf("Expected TotalEquity 400000.00, got %f", report.TotalEquity)
	}
	if !report.IsBalanced {
		t.Fatalf("Expected report to be Balanced with contra-asset, but got IsBalanced=false")
	}
}
