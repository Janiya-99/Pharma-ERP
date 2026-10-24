# Statutory Financial Audit & Reconciliation Documentation Master Index

**Directory Path:** `/docs/balance-sheet-audit/`  
**Target Modules:** 
- Statutory Financial Intelligence — Statement of Financial Position (Balance Sheet)
- Cash & Treasury Intelligence — Commercial Bank Book & Cash Book (FIN-02)
- General Ledger & Account Ledger Running Balances (FIN-02)
**System Scope:** Enterprise ERP (CeylonMed Global / Multi-Tenant Edition)  
**Audit Period:** Financial Year 2026/2027 (and all comparative periods)  
**Status:** **RESOLVED & VERIFIED IN PRODUCTION LEDGER**  

---

## Folder Manifest

This folder contains the authoritative statutory audit documentation, root-cause analyses (RCA), mathematical proofs, and engineering changelogs for resolving financial reporting defects across the ERP system:

```
docs/balance-sheet-audit/
├── README.md                                # This index and executive orientation
├── BALANCE_SHEET_FIX_AUDIT_REPORT.md        # Balance Sheet statutory audit & engineering report
├── RECONCILIATION_PROOF.md                  # Account-by-account double-entry ledger reconciliation
├── SYSTEM_CHANGELOG.md                      # Balance Sheet engineering changelog & test suites
├── FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md# FIN-02 Bank & Cash Book reconciliation audit
└── FIN_03_AND_04_AUDIT_REPORT.md            # FIN-03 Dashboard KPIs & FIN-04 Tax Settings report
```

---

## Audited Issues & Resolutions

### 1. FIN-02: Bank Book and Cash Book Reconciliation
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **1.1** | **Receipt & Payment columns showing dashes (`-`)** for nonzero transactions. | DTO JSON tags emitted `debit_amount` / `credit_amount`, but frontend accessor expected `debit` / `credit`. | Added dual JSON tags `debit` and `credit` to Go DTO and implemented null-coalescing fallbacks in frontend cells. | Receipts and payments accurately displayed on all rows. |
| **1.2** | **Negative Bank Closing Balance of -88,107,675.10 LKR** on positive bank assets. | Case-sensitive check `"Debit" == "debit"` failed because DB stored `"Debit"`. Routed to Credit-normal (liability) branch, executing `Credit - Debit`. | Normalized with `strings.EqualFold(accNormBal, "debit")` so Asset accounts correctly compute `Opening + Debits - Credits`. | Reconciles to true positive **+88,107,675.10 LKR**, exactly matching `chart_of_accounts.current_balance`. |
| **1.3** | **Negative Cash Closing Balance of -5,000,000.00 LKR** on positive cash float. | Case-sensitive sign check inversion on Cash in Hand account `100001`. | Normalized with `strings.EqualFold()`; Asset cash accounts calculate `Opening + Debits - Credits`. | Reconciles to true positive **+5,000,000.00 LKR**, exactly matching `chart_of_accounts.current_balance`. |
| **1.4** | **Reverse chronological running balance calculations**. | General Ledger SQL queries returned rows ordered descending (`ORDER BY transaction_date DESC`). Accumulating from opening balance compounded backwards. | Extracted `CalculateCashBankBook` and `CalculateAccountLedger` with ascending sort on `TransactionDate ASC, ID ASC` before running balance progression. | Every transaction line reflects the true historical balance immediately following that entry. |
| **1.5** | **Ledger balance integrity**. | Verification required before changes. | Stored accounting balances were verified directly in MySQL and remained 100% untouched. | No database alterations needed; zero accounting corruption. |

### 2. FIN-01: Balance Sheet Presentation & Equilibrium
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **2.1** | **Total Assets showed `LKR 0.00`** with "No accounts found". | Case-sensitive check `raw.NormalBalance == "debit"` failed against title-case `"Debit"`. | Replaced with case-insensitive `strings.EqualFold()` and hierarchical code prefix matching (`1xxxx` = Assets). | **LKR 190,565,999.44** in Assets accurately recognized and presented. |
| **2.2** | **Asset accounts appeared under Liabilities**. | Classification type check failed, dumping accounts into the `else` (Liabilities) fallback. | Implemented robust dual-layer classification distinguishing Assets (`1xxxx`), Liabilities (`2xxxx`), and Equity (`3xxxx`). | Asset accounts moved to Assets; Liabilities correctly reduced to true creditors (**LKR 184,141,022.18**). |
| **2.3** | **False Green "Balanced" Badge** displayed when unbalanced. | Backend DTO omitted equilibrium fields; frontend evaluated `0 - 0 < 0.01 = true`. | Added `TotalAssets`, `TotalLiabilitiesAndEquity`, `Difference`, and `IsBalanced` to backend DTO; frontend computes real status badge. | Accurate status: Red alert when out of balance; Green verified checkmark when truly balanced (`Difference == 0.00`). |
| **2.4** | **Missing Net Profit line in Equity**. | Net income from P&L was accumulated into total balance but omitted from `Equity.Lines`. | Explicit line item `PL-NET Net Profit / (Loss) for the Period` automatically appended to Equity lines. | Equity clearly traces **LKR 6,424,977.26** back to the Statement of Profit and Loss. |

### 3. FIN-03 & FIN-04: Dashboard KPIs & Tax Settings Formatting
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **3.1** | **Cash showed 5M while Alert showed 32.4M**. | Alert was a static hardcoded mock string (`32.4M`), and dashboard defaulted to 32.45M fallback. | Backend now generates dynamic alerts based on live GL cash (5.0M) and bank (88.1M) balances. | Dashboard alert matches Cash Book and GL ledger exactly. |
| **3.2** | **AR showed 4.55M while Overdue AR showed 11.95M**. | Overdue AR had hardcoded `11950421` fallback in UI. | Overdue AR is computed dynamically from sales invoices where `due_date < CURDATE()`. | Overdue AR is mathematically consistent with total receivables. |
| **3.3** | **Tax Rates formatted as Currency (`LKR 18.00`)**. | `field.name.includes("rate")` was included in currency formatter. | Extracted percentage formatter rendering `18%`, `2.5%`, etc. | Displays proper percentages across all tax rates. |
| **3.4** | **Zero-Rated Taxes displayed as dash (`-`)**. | Zero numeric rate defaulted to empty placeholder. | Formatted with explicit badge `0% (Zero-Rated / Exempt)`. | Legitimate zero-rated/exempt settings clearly visible. |

---

## Detailed Documents in this Folder

1. **[FIN_03_AND_04_AUDIT_REPORT.md](./FIN_03_AND_04_AUDIT_REPORT.md)**  
   Statutory audit report for Finance Dashboard KPIs, metric lineage, and tax percentage formatting.
2. **[FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md](./FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md)**  
   Full statutory audit for Bank Book and Cash Book reconciliation, column dash fixes, sign conventions, and chronological running-balance calculations.
3. **[BALANCE_SHEET_FIX_AUDIT_REPORT.md](./BALANCE_SHEET_FIX_AUDIT_REPORT.md)**  
   Statutory audit report for the Balance Sheet equilibrium, LKAS 1 structure, and financial intelligence indicators.
4. **[RECONCILIATION_PROOF.md](./RECONCILIATION_PROOF.md)**  
   Mathematical theorem and account-by-account double-entry ledger proof for all general ledger accounts.
5. **[SYSTEM_CHANGELOG.md](./SYSTEM_CHANGELOG.md)**  
   Engineering changelog detailing all modified files, schema queries, and automated unit test suites.

---

## Admin Panel Access

This documentation is also directly accessible within the ERP interface:
* **Platform Admin Documentation:** Navigate to `Platform Admin -> Documentation -> Audit & Reports` or `/platform-admin/documentation`
* **Tenant Control Center:** Navigate to `Control Center -> Audit & Security -> System Fixes & Audit` or `/control-center/system-fixes-audit`
* **In-App Balance Sheet Modal:** Click the **"Audit Fix Documentation"** button on the Balance Sheet page (`/finance/reports/balance-sheet`)
