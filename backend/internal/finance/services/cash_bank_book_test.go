package services

import (
	"math"
	"testing"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/models"
)

func TestCalculateCashBankBook_ReconciliationAndSignConventions(t *testing.T) {
	svc := &FinanceReportService{}

	// Exact database scenario for 100003 - Bank Account:
	// Normal Balance: "Debit" (Title-cased from MySQL)
	// Total Debits: 191,079,062.80
	// Total Credits: 102,971,387.70
	// Expected Closing Balance: +88,107,675.10 (Positive Asset)
	d1 := time.Date(2026, 4, 1, 10, 0, 0, 0, time.UTC)
	d2 := time.Date(2026, 4, 15, 11, 0, 0, 0, time.UTC)

	// Note: Database repository returns records descending (newest first).
	// We pass them newest first to ensure chronological sort works.
	entries := []models.GeneralLedgerEntry{
		{
			ID:              2,
			TransactionDate: d2,
			SourceType:      "PAYMENT_VOUCHER",
			SourceNumber:    "PV-2026-0001",
			ReferenceNumber: "CHQ-88219",
			Description:     "Supplier settlement",
			DebitAmount:     0,
			CreditAmount:    102971387.70,
		},
		{
			ID:              1,
			TransactionDate: d1,
			SourceType:      "CUSTOMER_RECEIPT",
			SourceNumber:    "REC-2026-0001",
			ReferenceNumber: "DEP-00124",
			Description:     "Customer payment collection",
			DebitAmount:     191079062.80,
			CreditAmount:    0,
		},
	}

	acc := &models.ChartOfAccount{
		ID:          100003,
		AccountCode: "100003",
		AccountName: "Bank Account",
		NormalBalance: "Debit", // Title Case as stored in MySQL
		AccountClassification: models.AccountClassification{
			NormalBalance: "Debit",
		},
	}

	res := svc.CalculateCashBankBook(
		acc,
		0.00, // Opening balance
		entries,
	)

	// 1. Verify Total Receipts (Debit) and Total Payments (Credit)
	if math.Abs(res.TotalReceipts-191079062.80) > 0.01 {
		t.Fatalf("expected TotalReceipts=191079062.80, got %f", res.TotalReceipts)
	}
	if math.Abs(res.TotalPayments-102971387.70) > 0.01 {
		t.Fatalf("expected TotalPayments=102971387.70, got %f", res.TotalPayments)
	}

	// 2. Verify Positive Closing Balance (LKR 88,107,675.10)
	if math.Abs(res.ClosingBalance-88107675.10) > 0.01 {
		t.Fatalf("expected ClosingBalance=88107675.10, got %f", res.ClosingBalance)
	}

	// 3. Verify Chronological Order: Entry 1 (April 1) must be first, Entry 2 (April 15) second
	if len(res.Transactions) != 2 {
		t.Fatalf("expected 2 transactions, got %d", len(res.Transactions))
	}
	if res.Transactions[0].ID != 1 {
		t.Fatalf("expected first transaction to be ID=1, got ID=%d", res.Transactions[0].ID)
	}
	if res.Transactions[1].ID != 2 {
		t.Fatalf("expected second transaction to be ID=2, got ID=%d", res.Transactions[1].ID)
	}

	// 4. Verify Running Balances forward in time:
	// After Entry 1: 0 + 191,079,062.80 = 191,079,062.80
	// After Entry 2: 191,079,062.80 - 102,971,387.70 = 88,107,675.10
	if math.Abs(res.Transactions[0].RunningBalance-191079062.80) > 0.01 {
		t.Fatalf("expected row 0 running balance 191079062.80, got %f", res.Transactions[0].RunningBalance)
	}
	if math.Abs(res.Transactions[1].RunningBalance-88107675.10) > 0.01 {
		t.Fatalf("expected row 1 running balance 88107675.10, got %f", res.Transactions[1].RunningBalance)
	}

	// 5. Verify DTO dual compatibility: Debit and Credit fields must match DebitAmount and CreditAmount
	if res.Transactions[0].Debit != 191079062.80 || res.Transactions[0].DebitAmount != 191079062.80 {
		t.Fatalf("expected row 0 Debit=DebitAmount=191079062.80, got Debit=%f, DebitAmount=%f", res.Transactions[0].Debit, res.Transactions[0].DebitAmount)
	}
	if res.Transactions[1].Credit != 102971387.70 || res.Transactions[1].CreditAmount != 102971387.70 {
		t.Fatalf("expected row 1 Credit=CreditAmount=102971387.70, got Credit=%f, CreditAmount=%f", res.Transactions[1].Credit, res.Transactions[1].CreditAmount)
	}
}

func TestCalculateCashBankBook_CashAccountReconciliation(t *testing.T) {
	svc := &FinanceReportService{}

	// Exact database scenario for 100001 - Cash in Hand:
	// Normal Balance: "Debit"
	// Total Debits: 5,000,000.00
	// Total Credits: 0.00
	// Expected Closing Balance: +5,000,000.00 (Positive Asset)
	d1 := time.Date(2026, 4, 1, 9, 0, 0, 0, time.UTC)

	entries := []models.GeneralLedgerEntry{
		{
			ID:              10,
			TransactionDate: d1,
			SourceType:      "JOURNAL_ENTRY",
			SourceNumber:    "JV-2026-0001",
			ReferenceNumber: "FLOAT-INIT",
			Description:     "Initial cash float",
			DebitAmount:     5000000.00,
			CreditAmount:    0,
		},
	}

	acc := &models.ChartOfAccount{
		ID:            100001,
		AccountCode:   "100001",
		AccountName:   "Cash in Hand",
		NormalBalance: "Debit",
	}

	res := svc.CalculateCashBankBook(
		acc,
		0.00,
		entries,
	)

	if math.Abs(res.TotalReceipts-5000000.00) > 0.01 {
		t.Fatalf("expected TotalReceipts=5000000.00, got %f", res.TotalReceipts)
	}
	if math.Abs(res.TotalPayments-0.00) > 0.01 {
		t.Fatalf("expected TotalPayments=0.00, got %f", res.TotalPayments)
	}
	if math.Abs(res.ClosingBalance-5000000.00) > 0.01 {
		t.Fatalf("expected ClosingBalance=5000000.00, got %f", res.ClosingBalance)
	}
	if res.Transactions[0].Debit != 5000000.00 {
		t.Fatalf("expected row 0 Debit=5000000.00, got %f", res.Transactions[0].Debit)
	}
}

func TestCalculateAccountLedger_ChronologicalSort(t *testing.T) {
	svc := &FinanceReportService{}

	d1 := time.Date(2026, 4, 1, 9, 0, 0, 0, time.UTC)
	d2 := time.Date(2026, 4, 2, 10, 0, 0, 0, time.UTC)
	d3 := time.Date(2026, 4, 3, 11, 0, 0, 0, time.UTC)

	// Reverse order input
	entries := []models.GeneralLedgerEntry{
		{ID: 3, TransactionDate: d3, DebitAmount: 0, CreditAmount: 300},
		{ID: 2, TransactionDate: d2, DebitAmount: 500, CreditAmount: 0},
		{ID: 1, TransactionDate: d1, DebitAmount: 1000, CreditAmount: 0},
	}

	acc := &models.ChartOfAccount{
		ID:            110001,
		AccountCode:   "110001",
		AccountName:   "Trade Debtors",
		NormalBalance: "Debit",
	}

	res := svc.CalculateAccountLedger(
		acc,
		100.00, // Opening balance
		entries,
	)

	if res.TotalDebit != 1500 {
		t.Fatalf("expected totalDr=1500, got %f", res.TotalDebit)
	}
	if res.TotalCredit != 300 {
		t.Fatalf("expected totalCr=300, got %f", res.TotalCredit)
	}
	// Expected closing: 100 (open) + 1500 (Dr) - 300 (Cr) = 1300
	if res.ClosingBalance != 1300 {
		t.Fatalf("expected closingBal=1300, got %f", res.ClosingBalance)
	}

	// Verify order: ID 1, 2, 3
	lines := res.LedgerLines
	if lines[0].ID != 1 || lines[1].ID != 2 || lines[2].ID != 3 {
		t.Fatalf("expected chronological order 1, 2, 3; got %d, %d, %d", lines[0].ID, lines[1].ID, lines[2].ID)
	}
	// Running balances:
	// After ID 1: 100 + 1000 = 1100
	// After ID 2: 1100 + 500 = 1600
	// After ID 3: 1600 - 300 = 1300
	if lines[0].RunningBalance != 1100 {
		t.Fatalf("expected line 0 running balance=1100, got %f", lines[0].RunningBalance)
	}
	if lines[1].RunningBalance != 1600 {
		t.Fatalf("expected line 1 running balance=1600, got %f", lines[1].RunningBalance)
	}
	if lines[2].RunningBalance != 1300 {
		t.Fatalf("expected line 2 running balance=1300, got %f", lines[2].RunningBalance)
	}
}
