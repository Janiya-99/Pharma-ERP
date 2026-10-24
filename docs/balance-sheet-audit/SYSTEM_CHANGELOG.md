# System Engineering Changelog & Code Fixes

**Target Version:** v2.4.1-statutory-audit  
**Classification:** Financial Core / Statutory Intelligence Engine  
**Release Date:** October 2026  
**Files Modified:** 8 Backend Files, 1 New Test Suite, 6 Frontend Components  

---

## 1. Backend Modifications

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
  * `TestCalculateBalanceSheet_ClassificationsAndReconciliation`: Reconciles actual LKR 190,565,999.44 ledger figures.
  * `TestCalculateBalanceSheet_UnbalancedDetection`: Asserts that intentional ledger discrepancies flag `IsBalanced = false` with non-zero variance.
  * `TestCalculateBalanceSheet_ContraAssets`: Confirms contra-asset depreciation subtraction from fixed assets.

---

## 2. Frontend Modifications

### 2.1 `frontend/src/pages/finance/reports/balance-sheet/BalanceSheetReportPage.tsx`
* **Executive Summary KPI Ribbon:** Total Assets, Total Liabilities, Total Equity, Net Working Capital, Current Ratio.
* **Mathematical Equilibrium Banner:** Visual $Assets = Liabilities + Equity$ equation badge showing zero difference.
* **SLFRS Statement of Financial Position Table:**
  * Clear hierarchy separating Current Assets and Non-Current Assets.
  * Clear hierarchy separating Current Liabilities and Non-Current Liabilities.
  * Explicit Equity section with retained earnings & current period surplus.
* **All Toolbar Buttons Functional:**
  * **Refresh:** Re-queries backend with active fiscal year filters.
  * **Export CSV:** Streams formatted CSV spreadsheet with account codes, categories, and balances.
  * **Export JSON:** Downloads structured JSON dataset.
  * **Print:** Triggers browser print dialog with print-optimized CSS.
  * **Audit Documentation Modal:** Interactive button opening full statutory audit report.

### 2.2 `frontend/src/components/finance/reports/BalanceStatusBadge.tsx`
* Added checkmark and alert icons, explicit difference indicator, and clear distinction between balanced and unbalanced states.

### 2.3 `frontend/src/components/finance/reports/BalanceSheetAuditDocModal.tsx`
* Interactive, in-app modal allowing accountants, platform admins, and auditors to read and verify the entire audit and resolution documentation without leaving the UI.
