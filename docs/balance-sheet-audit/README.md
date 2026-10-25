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

docs/balance-sheet-audit/
├── README.md                                # This index and executive orientation
├── BALANCE_SHEET_FIX_AUDIT_REPORT.md        # Balance Sheet statutory audit & engineering report
├── RECONCILIATION_PROOF.md                  # Account-by-account double-entry ledger reconciliation
├── SYSTEM_CHANGELOG.md                      # Balance Sheet engineering changelog & test suites
├── INVOICE_CENTER_AUDIT_REPORT.md           # Invoice Center & receivables statutory audit (IC-01 to IC-07)
├── FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md# FIN-02 Bank & Cash Book reconciliation audit
├── FIN_03_AND_04_AUDIT_REPORT.md            # FIN-03 Dashboard KPIs & FIN-04 Tax Settings report
├── CONTROL_CENTER_AND_REPORT_EXPORT_AUDIT_REPORT.md # Control Center (CC-01-03, AUTH-01) & Export audit
└── COMPLIANCE_AND_QA_INVESTIGATION_AUDIT_REPORT.md  # Compliance (COM-01-03), Inventory (S-01), & QA Report
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

### 6. Control Center Governance & Authentication (CC-01 to CC-03, AUTH-01)
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **6.1** | **Admin quick-login identity mismatch (AUTH-01)**. | Shortcut labeled `Admin (Kavinda)` logged into `admin@ceylonmed.lk` which belongs to `Dr. Kalinga Silva`. | Aligned labels with seeded accounts: `Admin (Dr. Kalinga Silva)`, `CFO (Ruwani)`, `Accountant (Chaminda)`. | Operator identity verified across session tokens and display badges. |
| **6.2** | **Company Profile displaying Ceylon MedEx while General Settings displayed OMACX (CC-01)**. | `GeneralSettingsPage` had hardcoded `OMACX` state variables instead of binding to `/control/company` and `useAuth()`. | Connected `useAuth().company` and `getCompanyProfile()` dynamically; save syncs `updateCompanyProfile` + `refreshContext()`. | Active company profile accurately unified across all Control Center pages. |
| **6.3** | **Dashboard Audit Date Range fixed to July 1-7, 2024 above October 2026 events (CC-02)**. | Hardcoded static `Jul 1, 2024 - Jul 7, 2024` badge in table header; backend lacked date filtering. | Replaced with dynamic date range selector (7D, 30D, Month, All, Custom) bound to `filteredEvents` and backend query params. | Date badge and event table dynamically bound to exact identical filter window. |
| **6.4** | **July 4, 2026 events appearing under Last 24 Hours in Access Audit (CC-03)**. | UI defaulted to `24H`, but `filteredEvents` ignored `selectedTimeframe` and API called without date parameters. | Enforced strict client-side cutoff, passed date bounds to `/control/audit-logs`, added historical badge & archive view. | Recent 24h view strictly contains current events; historical archive isolated. |

### 7. Universal Report Export Engine & Table Pagination
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **7.1** | **Report Exports truncating to current page size instead of full dataset**. | Previous exports only captured the current DOM table page (10 or 25 rows) rather than the entire filtered dataset. | Created `reportExportUtils.ts` fetching complete unpaginated dataset for both PDF (`jspdf`) and Excel (`xlsx`). | Full, complete datasets exported with corporate formatting and audit totals. |
| **7.2** | **Standardized Reusable Table Pagination**. | Reports lacked uniform pagination controls across modules. | Created `TablePagination.tsx` with page size selection (`10`, `25`, `50`, `100`) and integrated across all reports. | Uniform, responsive pagination across all commercial and financial reporting screens. |

### 8. Compliance, Statutory Licensure & QA Integrity Engine
| # | Issue Identified | Root Cause | Engineering Resolution | Statutory Verification |
|---|---|---|---|---|
| **8.1** | **License WHL-4402/2026 displayed ACTIVE / 361 days remaining despite expiry on 30 June 2026 (COM-01)**. | Static mock days remaining without dynamic date calculation; conflated administrative status with calculated validity. | Developed `calculateLicenseValidity()` computing elapsed days against current date (22 Oct 2026); separated Admin status from validity. | Accurately calculates 114 days expired; prominent red EXPIRED badge; KPI counts verified. |
| **8.2** | **Deviations and CAPA menus routed to Recalls and Disposals (COM-02)**. | Missing dedicated frontend routes; sidebar links hardcoded to incorrect destinations. | Added dedicated routes `/compliance-center/deviations` and `/compliance-center/capa`, tabbed register, and modal dialogs with SHA-256 hash generation. | Full separation of quality deviations, CAPA actions, batch holds, recalls, and disposals. |
| **8.3** | **Viewing Cash Book/Bank Book logged as AUDIT_CHECK under Internal Quality Audit (COM-03)**. | Backend audit logger unconditionally assigned actionType `AUDIT_CHECK` and quality audit authority. | Categorized events by `software_code`: finance views map to `FINANCIAL_GOVERNANCE` under `Finance Directorate & Fiscal Audit` with actual user name. | Normal financial report views distinguished from regulatory inspections; zero blank user fields. |
| **8.4** | **Quarantined batch BAT-QUAR-RECALL-65 showed 250 units as Available (S-01)**. | Conflated physical inventory with commercially saleable available stock; sales order lookups included held batches. | Decoupled physical on-hand (`250.000`) from saleable available (`0.000`), excluded hold/quarantine status from lookup queries, added Holding Status badges. | Held inventory completely blocked from saleable checkout; non-saleable hold clearly labeled. |
| **8.5** | **Download Certified PDF in regulatory dossier was an alert placeholder (S-04)**. | Placeholder alert in UI without PDF generation logic. | Built formal `jsPDF` + `jspdf-autotable` certified PDF generator with SHA-256 hash stamp, 21 CFR Part 11 / cGMP certification, and signature blocks. | Emits formal certified tamper-evident PDF dossiers. |
| **8.6** | **CFO access restricted on Customer Aging Report (S-05)**. | Permission ID `230` assigned only to Super Admin role. | Assigned permission ID `230` to `role_id = 2` (CFO) and `role_id = 3` (Senior Accountant). | CFO accesses Customer Aging Report cleanly without permission errors. |
| **8.7** | **Master-data inconsistencies in generic names & departments (S-06)**. | Gentamicin linked to generic `Amoxicillin Trihydrate`; duplicate department code `ADMIN`. | Created generic `GEN_GENTA` ("Gentamicin Sulfate"), renamed department ID 2 to `EXEC` ("Executive Management & Governance"), synced enterprise seeds. | Clean master data; zero duplicate department codes. |
| **8.8** | **Document & Proforma Invoice print engine gaps (S-07)**. | Lacked loaders for proforma invoices and GRN; crashed on non-standard line item keys. | Registered `proforma_invoice` (with invoice/order fallback) and `grn`, implemented multi-key line item extraction (`lines`, `sales_invoice_lines`, `items`, `allocations`). | Clean, verified print layouts across sales invoices, proformas, and GRNs. |

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
6. **[CONTROL_CENTER_AND_REPORT_EXPORT_AUDIT_REPORT.md](./CONTROL_CENTER_AND_REPORT_EXPORT_AUDIT_REPORT.md)**  
   Statutory audit for Control Center Governance (CC-01 to CC-03), Authentication identity (AUTH-01), and full dataset PDF/Excel exports.
7. **[COMPLIANCE_AND_QA_INVESTIGATION_AUDIT_REPORT.md](./COMPLIANCE_AND_QA_INVESTIGATION_AUDIT_REPORT.md)**  
   Statutory audit report for NMRA Licensure (COM-01), Deviations & CAPA (COM-02), Audit Trail (COM-03), Quarantined Stock Isolation (S-01), Certified Dossier PDF (S-04), CFO Permissions (S-05), Master Data (S-06), and Universal Print (S-07).
8. **[SYSTEM_CHANGELOG.md](./SYSTEM_CHANGELOG.md)**  
   Engineering changelog detailing all modified files, schema queries, and automated unit test suites.

---

## Admin Panel Access

This documentation is also directly accessible within the ERP interface:
* **Platform Admin Documentation:** Navigate to `Platform Admin -> Documentation -> Audit & Reports` or `/platform-admin/documentation`
* **Tenant Control Center:** Navigate to `Control Center -> Audit & Security -> System Fixes & Audit` or `/control-center/system-fixes-audit`
* **In-App Balance Sheet Modal:** Click the **"Audit Fix Documentation"** button on the Balance Sheet page (`/finance/reports/balance-sheet`)

