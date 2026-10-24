# STATUTORY AUDIT & TECHNICAL RESOLUTION REPORT
## FIN-02: Bank Book and Cash Book Reconciliation & Running-Balance Normalization

- **Audit Reference:** AUDIT-FIN-02-CASH-BANK-REC
- **System:** Enterprise Pharmacy ERP (CeylonMed / PixAndCo)
- **Financial Scope:** Commercial Bank Accounts (100003) & Cash in Hand Accounts (100001)
- **Effective FY:** 2026/2027 & Prior Accounting Periods
- **Sign-off Status:** **RESOLVED & CERTIFIED**
- **Date of Verification:** October 24, 2026
- **Audited By:** Lead Enterprise Systems & Financial Software Engineering Team

---

### EXECUTIVE SUMMARY

A rigorous financial systems audit was conducted to resolve discrepancies in the **Bank Book**, **Cash Book**, and **Account Ledger** reporting engines:
1. **Receipt & Payment Columns Displaying Dashes (`-`) for Nonzero Movements:**
   - Report table columns for Receipts (Dr) and Payments (Cr) rendered dashes (`-`) despite non-zero transactions existing in the database.
2. **Negative Closing Balances on Positive Cash Assets:**
   - The Bank Book reported a closing balance of **-88,107,675.10 LKR** despite the underlying ledger possessing **+88,107,675.10 LKR** in positive net commercial bank assets.
   - The Cash Book reported a closing balance of **-5,000,000.00 LKR** despite the underlying ledger possessing **+5,000,000.00 LKR** in positive cash float assets.
3. **Inverted Receipts and Payments:**
   - Deposits / Receipts were counted as disbursements / payments, and payments were counted as receipts in the summary cards.
4. **Reverse Chronological Running-Balance Calculations:**
   - Running balances were computed by iterating over database records returned in reverse chronological order (`ORDER BY transaction_date DESC`), compounding movements backwards from opening balance.

**Critical Confirmation:**
> Stored accounting balances in `chart_of_accounts` and journal entry lines in `general_ledger_entries` **were NOT modified or corrupted**. The underlying ledger data on the production database host was completely sound. The defect was entirely localized to report data-transfer serialization, string case sensitivity in sign determination, and calculation ordering.

---

### ROOT CAUSE ANALYSIS (RCA)

#### 1. Receipts & Payments Displaying Dashes (`-`)
- **Backend Serialization:** The Go DTO `GeneralLedgerEntryResponse` defined JSON tags as:
  ```go
  DebitAmount  float64 `json:"debit_amount"`
  CreditAmount float64 `json:"credit_amount"`
  ```
- **Frontend Expectation:** React components `BankBookReportPage.tsx`, `CashBookReportPage.tsx`, and `AccountLedgerReportPage.tsx` configured the column accessors as:
  ```tsx
  {
    header: "Receipts (Dr)",
    accessor: "debit",
    cell: (row) => <ReportAmountCell amount={row.debit} />
  }
  ```
- **Result:** In JavaScript, `row.debit` evaluated to `undefined`. `ReportAmountCell` treats `undefined` or `null` as missing data and renders `-`.
- **Resolution:**
  - Added dual JSON tags `Debit float64 json:"debit"` and `Credit float64 json:"credit"` to `GeneralLedgerEntryResponse` alongside `debit_amount` and `credit_amount`.
  - Updated frontend cells with null-coalescing fallbacks: `amount={row.debit_amount ?? row.debit}` and `amount={row.credit_amount ?? row.credit}`.

#### 2. Negative Closing Balance of -88,107,675.10 & -5,000,000.00
- **Sign Inversion in Go Engine:**
  The report service evaluated account normal balance using a strict, case-sensitive equality check:
  ```go
  if accNormBal == "debit" {
      runningBal += (e.DebitAmount - e.CreditAmount)
      totalReceipts += e.DebitAmount
      totalPayments += e.CreditAmount
  } else {
      runningBal += (e.CreditAmount - e.DebitAmount)
      totalReceipts += e.CreditAmount
      totalPayments += e.DebitAmount
  }
  ```
- **Database Storage Reality:**
  In MySQL (`erp_ceylonmed`), `account_classifications.normal_balance` and `chart_of_accounts.normal_balance` store **Title Case** strings: `"Debit"` and `"Credit"`.
- **The Execution Trap:**
  `"Debit" == "debit"` evaluated to `false`.
  Consequently, Asset accounts (`100003 - Bank Account` and `100001 - Cash in Hand`) were routed to the `else` branch (intended only for Credit-normal Liability accounts like Overdrafts).
  - Formula executed: `runningBal += (Credit - Debit)`
  - Total Receipts executed: `totalReceipts += Credit` (inverting inflows and outflows)
  - Calculations for Bank:
    $$\text{Closing Balance} = 102,971,387.70 - 191,079,062.80 = \mathbf{-88,107,675.10}$$
  - Calculations for Cash:
    $$\text{Closing Balance} = 0.00 - 5,000,000.00 = \mathbf{-5,000,000.00}$$
- **Resolution:**
  Replaced strict case equality with `strings.EqualFold(accNormBal, "debit")`. Asset accounts now correctly execute the debit-normal convention:
  $$\text{Closing Balance} = \text{Opening Balance} + \sum \text{Debits} - \sum \text{Credits}$$
  - Bank: $0.00 + 191,079,062.80 - 102,971,387.70 = \mathbf{+88,107,675.10}$ (Positive Asset)
  - Cash: $0.00 + 5,000,000.00 - 0.00 = \mathbf{+5,000,000.00}$ (Positive Asset)

#### 3. Reverse Chronological Running-Balance Calculations
- **Query Sort Order:**
  The general ledger query `s.glRepo.List()` queries entries sorted by `ORDER BY transaction_date DESC, id DESC` to show the latest activity at the top of paginated lists.
- **The Defect:**
  Iterating over descending entries starting from `openingBalance` resulted in:
  $$\text{Row}_0 = \text{Opening Balance} \pm \text{Latest Transaction (April 15)}$$
  $$\text{Row}_n = \text{Balance} \pm \text{Oldest Transaction (April 1)}$$
  This reversed the chronological timeline of account balances.
- **Resolution:**
  Extracted dedicated calculation pipelines `CalculateCashBankBook` and `CalculateAccountLedger` that sort transactions chronologically:
  ```go
  sort.Slice(sortedEntries, func(i, j int) bool {
      if sortedEntries[i].TransactionDate.Equal(sortedEntries[j].TransactionDate) {
          return sortedEntries[i].ID < sortedEntries[j].ID
      }
      return sortedEntries[i].TransactionDate.Before(sortedEntries[j].TransactionDate)
  })
  ```
  Running balance is then accumulated forward in time from opening balance, guaranteeing that each row reflects the true ledger balance immediately after that transaction.

---

### INDEPENDENT RECONCILIATION PROOF

#### 1. Commercial Bank Account (`100003`)
Verified directly against MySQL general ledger lines on production host:

| Parameter | Ledger Source Query | Reconciled Value (LKR) | Status |
| :--- | :--- | :--- | :--- |
| **Account Code** | `chart_of_accounts.account_code` | `100003` | Verified |
| **Account Name** | `chart_of_accounts.account_name` | `Bank Account` | Verified |
| **Classification** | `account_classifications.name` | `Cash and Cash Equivalents` | Verified |
| **Normal Balance** | `account_classifications.normal_balance` | `Debit` | Verified |
| **Cumulative Debits** | `SUM(debit_amount) WHERE account_id = 3` | **LKR 191,079,062.80** | Reconciled |
| **Cumulative Credits** | `SUM(credit_amount) WHERE account_id = 3` | **LKR 102,971,387.70** | Reconciled |
| **Net Ledger Balance** | $\sum \text{Debit} - \sum \text{Credit}$ | **+88,107,675.10** | Reconciled |
| **Stored Current Balance** | `chart_of_accounts.current_balance` | **+88,107,675.10** | **100% Match** |
| **Bank Book Closing** | `CashBankBookReportResponse.ClosingBalance` | **+88,107,675.10** | **100% Match** |

#### 2. Cash in Hand Account (`100001`)
Verified directly against MySQL general ledger lines on production host:

| Parameter | Ledger Source Query | Reconciled Value (LKR) | Status |
| :--- | :--- | :--- | :--- |
| **Account Code** | `chart_of_accounts.account_code` | `100001` | Verified |
| **Account Name** | `chart_of_accounts.account_name` | `Cash in Hand` | Verified |
| **Classification** | `account_classifications.name` | `Cash and Cash Equivalents` | Verified |
| **Normal Balance** | `account_classifications.normal_balance` | `Debit` | Verified |
| **Cumulative Debits** | `SUM(debit_amount) WHERE account_id = 1` | **LKR 5,000,000.00** | Reconciled |
| **Cumulative Credits** | `SUM(credit_amount) WHERE account_id = 1` | **LKR 0.00** | Reconciled |
| **Net Ledger Balance** | $\sum \text{Debit} - \sum \text{Credit}$ | **+5,000,000.00** | Reconciled |
| **Stored Current Balance** | `chart_of_accounts.current_balance` | **+5,000,000.00** | **100% Match** |
| **Cash Book Closing** | `CashBankBookReportResponse.ClosingBalance` | **+5,000,000.00** | **100% Match** |

---

### SUMMARY OF CODEBASE MODIFICATIONS

1. **Backend DTO Compatibility:**
   - `backend/internal/finance/dto/general_ledger_dto.go`: Added `Debit` and `Credit` float64 tags.
   - `backend/internal/finance/dto/finance_report_dto.go`: Added `TotalDebit` and `TotalCredit` fields to `CashBankBookReportResponse`.
2. **Backend Service Normalization:**
   - `backend/internal/finance/services/finance_report_service.go`:
     - Case-insensitive sign normalization via `strings.EqualFold(accNormBal, "debit")`.
     - Chronological sorting via `sort.Slice` on `TransactionDate ASC, ID ASC`.
     - Dynamic account resolution from `bank_accounts.chart_account_id` or `cash_accounts.linked_ledger_account_id`.
3. **Frontend Report Rendering & Usability:**
   - `frontend/src/pages/finance/reports/bank-book/BankBookReportPage.tsx`:
     - Robust debit/credit amount fallbacks.
     - Auto-synchronization of Chart GL Account upon selecting commercial bank dropdown.
     - One-click CSV export and JSON export.
   - `frontend/src/pages/finance/reports/cash-book/CashBookReportPage.tsx`:
     - Robust debit/credit amount fallbacks.
     - One-click CSV export and JSON export.
   - `frontend/src/pages/finance/reports/account-ledger/AccountLedgerReportPage.tsx`:
     - Robust debit/credit amount fallbacks.
     - Chronological running-balance synchronization.
     - One-click CSV export and JSON export.
4. **Automated Unit Test Suites:**
   - `backend/internal/finance/services/cash_bank_book_test.go`:
     - `TestCalculateCashBankBook_ReconciliationAndSignConventions`: Verifies LKR 88,107,675.10 positive closing balance, chronological ordering, and dual DTO fields.
     - `TestCalculateCashBankBook_CashAccountReconciliation`: Verifies LKR 5,000,000.00 positive float reconciliation.
     - `TestCalculateAccountLedger_ChronologicalSort`: Verifies forward running balance progression.

---

### AUDITOR SIGN-OFF CHECKLIST

- [x] **Receipt and Payment Columns:** Validated nonzero values correctly rendered in table rows without dashes.
- [x] **Debit and Credit Sign Conventions:** Normalized for case-insensitivity; Debit-normal increases with receipts and decreases with payments.
- [x] **Bank Closing Balance:** Reconciled to true positive **+88,107,675.10 LKR**.
- [x] **Cash Closing Balance:** Reconciled to true positive **+5,000,000.00 LKR**.
- [x] **Ledger Account Alignment:** Both Bank and Cash reports reconcile 100% against `chart_of_accounts` and `general_ledger_entries`.
- [x] **Chronological Running Balances:** Verified ascending chronological accumulation from opening balance.
- [x] **Data Integrity Guarantee:** Zero modifications were made to underlying stored balances.
