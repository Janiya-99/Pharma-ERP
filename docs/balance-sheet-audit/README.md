# Statutory Financial Audit & Reconciliation Documentation Master Index

**Directory Path:** `/docs/balance-sheet-audit/`  
**Target Modules:** 
- Statutory Financial Intelligence — Statement of Financial Position (Balance Sheet)
- Trade Debtors Subledger & Customer Collections Reconciliation (FIN-05)
- Cash & Treasury Intelligence — Commercial Bank Book & Cash Book (FIN-02)
- General Ledger & Account Ledger Running Balances (FIN-02)
- Executive Dashboards & Financial Settings (FIN-03 / FIN-04)
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
├── INVOICE_CENTER_AUDIT_REPORT.md           # Invoice Center & receivables statutory audit (IC-01 to IC-07)
├── FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md# FIN-02 Bank & Cash Book reconciliation audit
└── FIN_03_AND_04_AUDIT_REPORT.md            # FIN-03 Dashboard KPIs & FIN-04 Tax Settings report
```

---

## Audited Issues & Resolutions

### 1. FIN-05: Trade Debtors Negative Sign Reconciliation (`-LKR 82,235,890.80`)
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **1.1** | **Trade Debtors showed negative `-LKR 82,235,890.80`** on the Balance Sheet. | Multi-year settlement JV 998 credited Trade Debtors for 4 years of collections (`111.08M`) in FY 4, whereas FY 4 sales billings were only `28.84M`. With `Debits - Credits = 28.84M - 111.08M`, a credit excess of `82.24M` resulted in a negative asset. | Partitioned FY 4 collections to true FY 4 collections (`24,297,441.80`), and rolled forward prior years' verified opening balances (`JV-2026-OPENING`). | Trade Debtors reflects strictly positive **`+LKR 4,545,730.20`**, matching `sales_invoices` unpaid balances and `chart_of_accounts.current_balance`. |
| **1.2** | **Omission of Stated Share Capital & Reserves in FY 4**. | Opening balances from prior years were not rolled forward into FY 4 general ledger entries. | Established `JV-2026-OPENING` with Dr Cash 5M, Dr Bank 68.35M, Dr Inventory 52.82M, Cr Trade Creditors 6.62M, Cr Share Capital 100M, and Cr Retained Earnings 19.54M. | Full equity of **`LKR 125,966,033.64`** correctly reflects capital, prior reserves, and current profit. |
| **1.3** | **Exact Mathematical Equilibrium**. | Verifying $Assets = Liabilities + Equity$. | Total Assets = **`LKR 132,588,165.30`**; Total Liabilities + Equity = **`LKR 132,588,165.30`**. | **Difference: `LKR 0.00`** with verified green `Balanced` badge. |

### 2. FIN-01: Balance Sheet Presentation & Classification
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **2.1** | **Total Assets showed `LKR 0.00`** with "No accounts found". | Case-sensitive check `raw.NormalBalance == "debit"` failed against title-case `"Debit"`. | Replaced with case-insensitive `strings.EqualFold()` and hierarchical code prefix matching (`1xxxx` = Assets). | **LKR 132,588,165.30** in Assets accurately recognized and presented. |
| **2.2** | **Asset accounts appeared under Liabilities**. | Classification type check failed, dumping accounts into the `else` (Liabilities) fallback. | Implemented robust dual-layer classification distinguishing Assets (`1xxxx`), Liabilities (`2xxxx`), and Equity (`3xxxx`). | Asset accounts moved to Assets; Liabilities correctly reduced to true creditors (**LKR 6,622,131.66**). |
| **2.3** | **False Green "Balanced" Badge** displayed when unbalanced. | Backend DTO omitted equilibrium fields; frontend evaluated `0 - 0 < 0.01 = true`. | Added `TotalAssets`, `TotalLiabilitiesAndEquity`, `Difference`, and `IsBalanced` to backend DTO; frontend computes real status badge. | Accurate status: Red alert when out of balance; Green verified checkmark when truly balanced (`Difference == 0.00`). |
| **2.4** | **Missing Net Profit line in Equity**. | Net income from P&L was accumulated into total balance but omitted from `Equity.Lines`. | Explicit line item `PL-NET Net Profit / (Loss) for the Period` automatically appended to Equity lines. | Equity clearly traces **LKR 6,424,977.26** back to the Statement of Profit and Loss. |

### 3. FIN-02: Bank Book and Cash Book Reconciliation
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **3.1** | **Receipt & Payment columns showing dashes (`-`)** for nonzero transactions. | DTO JSON tags emitted `debit_amount` / `credit_amount`, but frontend accessor expected `debit` / `credit`. | Added dual JSON tags `debit` and `credit` to Go DTO and implemented null-coalescing fallbacks in frontend cells. | Receipts and payments accurately displayed on all rows. |
| **3.2** | **Negative Bank Closing Balance of -88,107,675.10 LKR** on positive bank assets. | Case-sensitive check `"Debit" == "debit"` failed because DB stored `"Debit"`. Routed to Credit-normal (liability) branch, executing `Credit - Debit`. | Normalized with `strings.EqualFold(accNormBal, "debit")` so Asset accounts correctly compute `Opening + Debits - Credits`. | Reconciles to true positive **+88,107,675.10 LKR**, exactly matching `chart_of_accounts.current_balance`. |
| **3.3** | **Negative Cash Closing Balance of -5,000,000.00 LKR** on positive cash float. | Case-sensitive sign check inversion on Cash in Hand account `100001`. | Normalized with `strings.EqualFold()`; Asset cash accounts calculate `Opening + Debits - Credits`. | Reconciles to true positive **+5,000,000.00 LKR**, exactly matching `chart_of_accounts.current_balance`. |
| **3.4** | **Reverse chronological running balance calculations**. | General Ledger SQL queries returned rows ordered descending (`ORDER BY transaction_date DESC`). Accumulating from opening balance compounded backwards. | Extracted `CalculateCashBankBook` and `CalculateAccountLedger` with ascending sort on `TransactionDate ASC, ID ASC` before running balance progression. | Every transaction line reflects the true historical balance immediately following that entry. |

### 4. FIN-03 & FIN-04: Dashboard KPIs & Tax Settings Formatting
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **4.1** | **Cash showed 5M while Alert showed 32.4M**. | Alert was a static hardcoded mock string (`32.4M`), and dashboard defaulted to 32.45M fallback. | Backend now generates dynamic alerts based on live GL cash (5.0M) and bank (88.1M) balances. | Dashboard alert matches Cash Book and GL ledger exactly. |
| **4.2** | **AR showed 4.55M while Overdue AR showed 11.95M**. | Overdue AR had hardcoded `11950421` fallback in UI. | Overdue AR is computed dynamically from sales invoices where `due_date < CURDATE()`. | Overdue AR is mathematically consistent with total receivables. |
| **4.3** | **Tax Rates formatted as Currency (`LKR 18.00`)**. | `field.name.includes("rate")` was included in currency formatter. | Extracted percentage formatter rendering `18%`, `2.5%`, etc. | Displays proper percentages across all tax rates. |
| **4.4** | **Zero-Rated Taxes displayed as dash (`-`)**. | Zero numeric rate defaulted to empty placeholder. | Formatted with explicit badge `0% (Zero-Rated / Exempt)`. | Legitimate zero-rated/exempt settings clearly visible. |

### 5. IC-01 to IC-07: Invoice Center & Commercial Receivables Intelligence
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **5.1** | **Customer Balance Report generation failed (HTTP 500)**. | SQL query in `GetCustomerBalanceSummary` referenced non-existent column `name` instead of `category_name` in `customer_categories`. | Refactored query to use clean `LEFT JOIN customer_categories cat` selecting `COALESCE(cat.category_name, '')` and wrapped arithmetic in `COALESCE`. | Instant report generation with active balances, credit limits, and zero-record fallback. |
| **5.2** | **Customer Aging Report permission & KPI visibility**. | Permission `invoice_center.report.customer_aging` missing from Admin role, and table lacked executive concentration indicators. | Added permission to seed matrix, and added 5-card Executive Summary Ribbon (Total Accounts, Current, Overdue 31-120d, Critical >120d, Total Outstanding). | Granular aging audit with immediate concentration insights matching GL AR. |
| **5.3** | **Sales Invoice Register Missing October 2026 Records**. | Unrestricted or improper date bounds caused zero records to display, obscuring `INV-2026-0114` (dated 20 Oct 2026). | Applied month-to-date default date range, resilient multi-status filtering, and debounced auto-loading. | All October invoices including `INV-2026-0114` immediately visible upon page load. |
| **5.4** | **Customer Statement Date Defaults & Running Balance**. | Uninitialized date range caused queries to fail or return unbound history with unformatted dates. | Standardized month-to-date defaults (`date_from <= date_to` validation) and ascending balance roll-forward. | Accurate statement generation with verified closing debtor balance. |
| **5.5** | **Sales Invoice Details Financial Alignment & SO Navigation**. | Financial numeric columns were left-aligned, and clicking linked Sales Order did not navigate. | Right-aligned all numeric amounts in line items, formatted unit prices to 2 decimals, and linked Sales Order cards to `/sales/orders/:id`. | Clean financial typography and 1-click cross-module navigation. |
| **5.6** | **Debit Note Header Typo**. | Column header displayed typographical error `"Original Invioce No."`. | Corrected header orthography to `"Original Invoice No."`. | Verified spelling across table headers and export definitions. |
| **5.7** | **Customer Selector Trailing Hyphen**. | Customer dropdown labels displayed trailing hyphen (`CUST_MAHARAGAMA_PHARM - `) when `company_name` was undefined. | Updated selector formatting to prioritize `c.customer_name || c.name` with clean `${c.customer_code} - ${c.customer_name}` output. | Clean customer selection across all report filter bars. |
| **5.8** | **Automatic Report Reloading on Filter Change**. | Reports required manual button clicks, causing desynchronized report states when dropdowns changed. | Implemented debounced (300ms) automatic fetching across all 14 commercial and financial report pages. | Effortless, live data exploration upon changing branch, date, or customer filters. |

---

## Detailed Documents in this Folder

1. **[RECONCILIATION_PROOF.md](./RECONCILIATION_PROOF.md)**  
   Mathematical theorem, double-entry ledger extract, and account-by-account equilibrium proof for FY 2026/2027.
2. **[BALANCE_SHEET_FIX_AUDIT_REPORT.md](./BALANCE_SHEET_FIX_AUDIT_REPORT.md)**  
   Full statutory audit report for Balance Sheet equilibrium, Trade Debtors settlement reconciliation, LKAS 1 structure, and financial intelligence indicators.
3. **[INVOICE_CENTER_AUDIT_REPORT.md](./INVOICE_CENTER_AUDIT_REPORT.md)**  
   Comprehensive statutory audit for Invoice Center reports (Customer Balance & Aging), missing invoice resolution, month-to-date defaults, and auto-loading filters.
4. **[FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md](./FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md)**  
   Full statutory audit for Bank Book and Cash Book reconciliation, column dash fixes, sign conventions, and chronological running-balance calculations.
5. **[FIN_03_AND_04_AUDIT_REPORT.md](./FIN_03_AND_04_AUDIT_REPORT.md)**  
   Statutory audit report for Finance Dashboard KPIs, metric lineage, and tax percentage formatting.
6. **[SYSTEM_CHANGELOG.md](./SYSTEM_CHANGELOG.md)**  
   Engineering changelog detailing all modified files, schema queries, and automated unit test suites.

---

## Admin Panel Access

This documentation is also directly accessible within the ERP interface:
* **Platform Admin Documentation:** Navigate to `Platform Admin -> Documentation -> Audit & Reports` or `/platform-admin/documentation`
* **Tenant Control Center:** Navigate to `Control Center -> Audit & Security -> System Fixes & Audit` or `/control-center/system-fixes-audit`
* **In-App Balance Sheet Modal:** Click the **"Audit Fix Documentation"** button on the Balance Sheet page (`/finance/reports/balance-sheet`)

