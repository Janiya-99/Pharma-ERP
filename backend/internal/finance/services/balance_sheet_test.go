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

func TestCalculateBalanceSheet_LiveReconciledLedger(t *testing.T) {
	svc := &FinanceReportService{}

	// Live reconciled scenario for FY 2026/2027:
	// Cash in Hand: 5,000,000.00
	// Bank Account: 88,107,675.10
	// Trade Debtors: 4,545,730.20
	// Inventory Account: 34,934,760.00
	// Total Assets: 132,588,165.30
	// Trade Creditors: 6,622,131.66
	// Share Capital: 100,000,000.00
	// Retained Earnings: 19,541,056.38
	// Net Profit: 6,424,977.26 (Sales 28,843,172 - COGS 17,882,766.64 - Salaries 3,380,428.10 - Rent 1,155,000.00)
	// Total Liabilities + Equity: 132,588,165.30
	rawLines := []repositories.TrialBalanceRawLine{
		{
			AccountID:     1,
			AccountCode:   "100001",
			AccountName:   "Cash in Hand",
			NormalBalance: "Debit",
			PeriodDebit:   5000000.00,
		},
		{
			AccountID:     3,
			AccountCode:   "100003",
			AccountName:   "Bank Account",
			NormalBalance: "Debit",
			PeriodDebit:   92643103.20,
			PeriodCredit:  4535428.10,
		},
		{
			AccountID:     4,
			AccountCode:   "110001",
			AccountName:   "Trade Debtors",
			NormalBalance: "Debit",
			PeriodDebit:   28843172.00,
			PeriodCredit:  24297441.80,
		},
		{
			AccountID:     5,
			AccountCode:   "120001",
			AccountName:   "Inventory Account",
			NormalBalance: "Debit",
			PeriodDebit:   52817526.64,
			PeriodCredit:  17882766.64,
		},
		{
			AccountID:     9,
			AccountCode:   "200001",
			AccountName:   "Trade Creditors",
			NormalBalance: "Credit",
			PeriodCredit:  6622131.66,
		},
		{
			AccountID:     12,
			AccountCode:   "300001",
			AccountName:   "Share Capital",
			NormalBalance: "Credit",
			PeriodCredit:  100000000.00,
		},
		{
			AccountID:     13,
			AccountCode:   "310001",
			AccountName:   "Retained Earnings",
			NormalBalance: "Credit",
			PeriodCredit:  19541056.38,
		},
		{
			AccountID:     14,
			AccountCode:   "400001",
			AccountName:   "Sales Revenue",
			NormalBalance: "Credit",
			PeriodCredit:  28843172.00,
		},
		{
			AccountID:     16,
			AccountCode:   "500001",
			AccountName:   "Cost of Goods Sold",
			NormalBalance: "Debit",
			PeriodDebit:   17882766.64,
		},
		{
			AccountID:     19,
			AccountCode:   "600001",
			AccountName:   "Salaries and Wages",
			NormalBalance: "Debit",
			PeriodDebit:   3380428.10,
		},
		{
			AccountID:     20,
			AccountCode:   "610001",
			AccountName:   "Rent Expense",
			NormalBalance: "Debit",
			PeriodDebit:   1155000.00,
		},
	}

	report := svc.CalculateBalanceSheet(rawLines)

	expectedAssets := 132588165.30
	if math.Abs(report.TotalAssets-expectedAssets) > 0.01 {
		t.Fatalf("Expected TotalAssets %f, got %f", expectedAssets, report.TotalAssets)
	}

	expectedLiabilities := 6622131.66
	if math.Abs(report.TotalLiabilities-expectedLiabilities) > 0.01 {
		t.Fatalf("Expected TotalLiabilities %f, got %f", expectedLiabilities, report.TotalLiabilities)
	}

	expectedEquity := 125966033.64
	if math.Abs(report.TotalEquity-expectedEquity) > 0.01 {
		t.Fatalf("Expected TotalEquity %f, got %f", expectedEquity, report.TotalEquity)
	}

	expectedLE := 132588165.30
	if math.Abs(report.TotalLiabilitiesAndEquity-expectedLE) > 0.01 {
		t.Fatalf("Expected TotalLiabilitiesAndEquity %f, got %f", expectedLE, report.TotalLiabilitiesAndEquity)
	}

	if !report.IsBalanced {
		t.Fatalf("Expected report to be Balanced, Difference: %f", report.Difference)
	}
	if math.Abs(report.Difference) > 0.01 {
		t.Fatalf("Expected Difference 0.00, got %f", report.Difference)
	}
}

