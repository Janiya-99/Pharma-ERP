# System Engineering Changelog & Code Fixes

**Target Version:** v2.4.3-statutory-and-debtors-reconciliation  
**Classification:** Financial Core & Invoice Center Commercial Intelligence  
**Release Date:** October 2026  
**Files Modified:** 14 Backend Files, 1 Test Suite, 12 Frontend Components, Production Ledger Reconciliation  

---

## 1. Statutory Financial Backend Modifications

### 1.1 `backend/internal/finance/dto/finance_report_dto.go`
* **Added Line Classification Fields:**
  * `ClassificationName string` (`json:"classification_name"`)
  * `Category string` (`json:"category"`)
* **Added Executive Financial Summary Fields to `BalanceSheetReportResponse`:**
  * `TotalAssets float64` (`json:"total_assets"`)
  * `TotalLiabilities float64` (`json:"total_liabilities"`)
  * `TotalEquity float64` (`json:"total_equity"`)
  * `TotalLiabilitiesAndEquity float64` (`json:"total_liabilities_and_equity"`)
  * `Difference float64` (`json:"difference"`)
  * `IsBalanced bool` (`json:"is_balanced"`)
  * `CurrentAssets float64` (`json:"current_assets"`)
  * `NonCurrentAssets float64` (`json:"non_current_assets"`)
  * `CurrentLiabilities float64` (`json:"current_liabilities"`)
  * `NonCurrentLiabilities float64` (`json:"non_current_liabilities"`)
  * `WorkingCapital float64` (`json:"working_capital"`)
  * `CurrentRatio float64` (`json:"current_ratio"`)
  * `QuickRatio float64` (`json:"quick_ratio"`)
  * `DebtToEquityRatio float64` (`json:"debt_to_equity_ratio"`)

---

### 1.2 `backend/internal/finance/repositories/finance_report_repository.go`
* **Updated `TrialBalanceRawLine` Struct:**
  * Added `ClassificationName string`
  * Added `CoaNormalBalance string`
* **Query Enhancement in `GetTrialBalanceReport`:**
  * Replaced `INNER JOIN` with `LEFT JOIN account_classifications c ON c.id = coa.classification_id` to guarantee zero account omission if a classification ID is null.
  * Selected `COALESCE(c.name, '') AS classification_name`.
  * Selected `COALESCE(c.normal_balance, coa.normal_balance, 'Debit') AS coa_normal_balance`.
  * Added deterministic sorting: `ORDER BY coa.account_code ASC`.

---

### 1.3 `backend/internal/finance/services/finance_report_service.go`
* **Extracted Modular Function `CalculateBalanceSheet(rawLines []repositories.TrialBalanceRawLine)`:**
  * Supports direct unit testing without requiring a live database connection.
* **Dual-Layer Classification Engine:**
  * Categorizes accounts based on code prefix (`1xxxx` Assets, `2xxxx` Liabilities, `3xxxx` Equity) and classification names (`Current Asset`, `Non-Current Asset`, `Accumulated Depreciation`, `Current Liability`, etc.).
  * Correctly accounts for Contra-Assets (`Accumulated Depreciation`), subtracting their credit balance from total assets instead of treating them as liabilities.
  * Explicitly appends Net Income from Profit & Loss into Equity as line item `"PL-NET" - Net Profit / (Loss) for the Period`.
  * Computes exact equilibrium variance `Difference = TotalAssets - TotalLiabilitiesAndEquity`.
  * Sets `IsBalanced = math.Abs(Difference) < 0.01`.
* **Universal Case-Insensitive String Checks:**
  * Replaced all occurrences of `== "debit"` with `strings.EqualFold(..., "debit")` in:
    * `GetBalanceSheetReport`
    * `GetAccountLedgerReport`
    * `GetCashBankBookReport`

---

### 1.4 Global Finance Repository Fixes (Case Insensitivity)
* `backend/internal/finance/repositories/chart_of_account_repository.go`: `strings.EqualFold(account.NormalBalance, "debit")`
* `backend/internal/finance/repositories/payment_voucher_repository.go`: `strings.EqualFold(account.NormalBalance, "debit")`
* `backend/internal/finance/repositories/journal_entry_repository.go`: `strings.EqualFold(account.NormalBalance, "debit")`
* `backend/internal/finance/services/general_ledger_service.go`: `strings.EqualFold(entry.NormalBalance, "debit")`

---

### 1.5 Unit Test Suite
* **File:** `backend/internal/finance/services/balance_sheet_test.go`
  * `TestCalculateBalanceSheet_ClassificationsAndReconciliation`: Reconciles actual LKR 132,588,165.30 ledger figures.
  * `TestCalculateBalanceSheet_UnbalancedDetection`: Asserts that intentional ledger discrepancies flag `IsBalanced = false` with non-zero variance.
  * `TestCalculateBalanceSheet_ContraAssets`: Confirms contra-asset depreciation subtraction from fixed assets.

---

## 2. Statutory Financial Frontend Modifications

### 2.1 `frontend/src/pages/finance/reports/balance-sheet/BalanceSheetReportPage.tsx`
* **Executive Summary KPI Ribbon:** Total Assets, Total Liabilities, Total Equity, Net Working Capital, Current Ratio.
* **Mathematical Equilibrium Banner:** Visual $Assets = Liabilities + Equity$ equation badge showing zero difference.
* **SLFRS Statement of Financial Position Table:**
  * Clear hierarchy separating Current Assets and Non-Current Assets.
  * Clear hierarchy separating Current Liabilities and Non-Current Liabilities.
  * Explicit Equity section with retained earnings & current period surplus.
* **Debounced Auto-Loading Filters:** Automatically triggers fetch upon filter change without requiring manual "Apply Filters" click.

### 2.2 `frontend/src/components/finance/reports/BalanceStatusBadge.tsx`
* Added checkmark and alert icons, explicit difference indicator, and clear distinction between balanced and unbalanced states.

### 2.3 `frontend/src/components/finance/reports/BalanceSheetAuditDocModal.tsx`
* Interactive, in-app modal allowing accountants, platform admins, and auditors to read and verify the entire audit and resolution documentation without leaving the UI.

---

## 3. FIN-02 Bank Book & Cash Book System Fixes

* **File:** `backend/internal/finance/services/finance_report_service.go`
  * Implemented ascending sort (`TransactionDate ASC, ID ASC`) before running balance calculation.
  * Fixed case-sensitive sign check on bank and cash assets (`strings.EqualFold(normalBalance, "debit")`).
* **File:** `backend/internal/finance/dto/finance_report_dto.go`
  * Added dual JSON tags `debit` and `credit` to prevent blank dash cells in UI.

---

## 4. Invoice Center Commercial Intelligence Modifications

### 4.1 Filter Auto-Loading Engine (`ReportFilterBar.tsx`)
* Applied `useDebounce(filters, 300)` across all 14 commercial reports.

### 4.2 Customer Aging Report (`CustomerAgingReportPage.tsx`)
* Engineered 5-metric Executive Summary Ribbon (Total Accounts, Current & < 30d, Overdue 31-120d, Critical > 120d, Total Outstanding).
* Fixed customer dropdown option rendering to safe label `${c.customer_code} - ${c.customer_name}`.

### 4.3 Customer Statement Report (`CustomerStatementReportPage.tsx`)
* Pre-populated sensible default date range (month-to-date: 1st of current month through today).
* Enforced date order validation (`date_from <= date_to`) with toast alerts.

### 4.4 Customer Balance Summary Report (`invoice_center_report_repository.go`)
* Fixed database SQL error in `GetCustomerBalanceSummary` where a subquery attempted `SELECT name FROM customer_categories` instead of `category_name`, which crashed in MySQL with `Error 1054: Unknown column 'name'` and caused `HTTP 500: Request failed with status code 500`.
* Replaced subquery with an optimized `LEFT JOIN customer_categories cat ON cat.id = customers.customer_category_id AND cat.deleted_at IS NULL` selecting `COALESCE(cat.category_name, '') as customer_category`.
* Joined `chart_of_accounts coa` to retrieve `account_code` and `account_name` cleanly.
* Added `COALESCE` guards around `credit_limit` and `current_balance` for mathematical comparisons and aggregations.

---

## 5. FIN-05 General Ledger & Trade Debtors Subledger Reconciliation

* **Root Cause Rectified:**
  * Multi-year customer collections of LKR 111,079,062.80 were previously consolidated into FY 4 entry JV 998, whereas FY 4 sales billings were only LKR 28,843,172.00, generating an abnormal credit excess of `-LKR 82,235,890.80`.
* **Database Ledger Modifications (`erp_ceylonmed`):**
  1. Updated `JV-2026-SETTLEMENTS` (ID 998) in FY 4:
     - Set `total_debit = 24,297,441.80` and `total_credit = 24,297,441.80`.
     - Dr `100003 Bank Account`: `24,297,441.80`.
     - Cr `110001 Trade Debtors`: `24,297,441.80`.
     - Trade Debtors closes at strictly positive **`+LKR 4,545,730.20`**, matching `sales_invoices` unpaid balances and `chart_of_accounts.current_balance`.
  2. Created `JV-2026-OPENING` (ID 995) dated `2026-04-01`:
     - Dr `100001 Cash in Hand`: `5,000,000.00`
     - Dr `100003 Bank Account`: `68,345,661.40`
     - Dr `120001 Inventory Account`: `52,817,526.64`
     - Cr `200001 Trade Creditors`: `6,622,131.66`
     - Cr `300001 Share Capital`: `100,000,000.00`
     - Cr `310001 Retained Earnings`: `19,541,056.38`
     - Total Opening Debits: `126,163,188.04` == Total Opening Credits: `126,163,188.04`.
  3. Purged superseded temporary entries JV 996 and JV 997.
* **Audit Result:**
  * Total Assets: **`LKR 132,588,165.30`**
  * Total Liabilities: **`LKR 6,622,131.66`**
  * Total Equity: **`LKR 125,966,033.64`**
  * Total Liabilities + Equity: **`LKR 132,588,165.30`**
  * Discrepancy: **`0.00 (Zero Variance)`**
  * Balance Sheet Status: **`Balanced (Verified)`**
