# STATUTORY AUDIT & TECHNICAL RESOLUTION REPORT
## FIN-03 & FIN-04: Finance Dashboard KPIs & Tax Settings Formatting

- **Audit References:** `AUDIT-FIN-03-DASHBOARD-KPIS` & `AUDIT-FIN-04-TAX-FORMATTING`
- **System:** Enterprise Pharmacy ERP (CeylonMed / PixAndCo)
- **Financial Scope:** Executive Finance Dashboard, Working Capital Metrics, Tax Rate Registry
- **Effective Periods:** All Active Financial Years & Production Configurations
- **Sign-off Status:** **RESOLVED & VERIFIED**
- **Date of Verification:** October 24, 2026
- **Audited By:** Lead Enterprise Systems & Financial Engineering Team

---

### EXECUTIVE SUMMARY

A rigorous code-level and financial data lineage audit was conducted to address defects in the **Executive Finance Dashboard** and **Tax Settings Configuration**:

1. **Cash Discrepancy (5M in Card vs. 32.4M in Alert):**
   - The Cash Balance KPI card reported **LKR 5.0M** (reflecting physical cash in hand in GL Account `100001`).
   - Simultaneously, an alert in the Financial Alerts card displayed: `"Cash balance is 15% below target | Current: LKR 32.4M | Target: LKR 38M"`.
   - **Finding:** The 32.4M figure was an unlinked, hardcoded static mock string inside `FinancialAlertsCard.tsx` and an obsolete fallback in `FinanceDashboardPage.tsx`. The backend API did not provide dynamic alert generation.

2. **Accounts Receivable Discrepancy (4.55M AR vs. 11.95M Overdue AR):**
   - The Accounts Receivable KPI card reported **LKR 4.55M** (GL `110001` customer debtors control).
   - Simultaneously, the Overdue Receivables card and an alert reported **LKR 11,950,421 (11.95M)**.
   - **Finding:** Having overdue receivables exceed total receivables was mathematically contradictory. The 11.95M was hardcoded as `baseOverdueReceivables = 11950421` in frontend state and hardcoded in mock alerts. The backend now computes overdue receivables dynamically from sales invoices where `due_date < CURDATE()`.

3. **Arbitrary Period Multipliers:**
   - Period switching in `FinanceDashboardPage.tsx` artificially inflated figures using hardcoded multipliers (`1.05`, `1.12`, `1.25`, `1.45`) instead of displaying real accounting data for the selected period.

4. **Tax Settings Formatting (LKR 18.00 instead of 18%):**
   - In `FinanceQuickResourcePage.tsx`, `field.name.includes("rate")` was grouped inside the currency amount formatter, prefixing tax rates with `LKR ` and displaying two decimal currency values.
   - Zero-rated taxes (0.00%) rendered as dashes (`-`), obscuring legitimate zero-rated or exempt configurations.

---

### ROOT CAUSE ANALYSIS & REMEDIATIONS

#### 1. FIN-03: Dashboard KPIs & Alert Lineage Normalization

| Component / Metric | Defect Mechanism | Engineering Remediation |
|---|---|---|
| **Cash in Hand (GL 100001)** | Card showed 5.0M while Alert displayed 32.4M | Removed hardcoded alert. Generated dynamic alerts on backend where Alert 5 displays actual Cash in Hand (5.0M) and Bank (88.1M). Labelled card as **"Cash in Hand"** linking to the Cash Book. |
| **Bank Balance (GL 100003)** | Card lacked explicit GL reconciliation link | Sourced directly from GL Account `100003` (88,107,675.10 LKR). Labelled card as **"Bank Balance"** linking to the Bank Book. |
| **Accounts Receivable** | Card showed 4.55M while Overdue showed 11.95M | Eliminated hardcoded `11950421`. Backend now computes `OverdueAmount` strictly from customer sales invoices where `due_date < CURDATE()`. Overdue AR is guaranteed to be a valid subset of total AR. |
| **Top Customers & Suppliers** | Rendered static mock entity names | Added `fetchTopCustomers` and `fetchTopSuppliers` to `dashboard_service.go`, returning actual live database accounts with outstanding balances. |
| **Period Multipliers** | Fictional multipliers scaled dashboard figures | Removed `periodMultipliers`. Filter changes trigger live backend queries with reactive updates. |

#### 2. FIN-04: Tax Settings Percentage & Zero-Rated Formatting

| Screen / Field | Defect | Resolution |
|---|---|---|
| **Tax Rate Table Cell** | Displayed as currency: `LKR 18.00`, `LKR 2.50` | Extracted dedicated percentage renderer in `FinanceQuickResourcePage.tsx` formatting rates as `18%`, `2.5%`, etc. |
| **Zero-Rated Taxes** | Displayed as dash `-` | Renders a styled emerald badge: `0% (Zero-Rated / Exempt)`. |
| **Tax Rate Form Input** | Integer step restricted decimal rates; lacked % indicator | Added `step="any"`, `%` suffix icon, and placeholder `e.g. 18 for 18%, 2.5 for 2.5%, 0 for exempt`. |
| **Data Preservation** | Stored decimal precision | Backend GORM decimal(8,4) column and service validation preserved unchanged. |

---

### METRIC LINEAGE SPECIFICATION

| Metric | Accounting Definition | Authoritative Source | Reconciled Statutory Report |
|---|---|---|---|
| **Cash in Hand** | Physical till floats, petty cash, drawer balances | GL Account `100001` (Cash in Hand) | [Cash Book Report](file:///finance/reports/cash-book) |
| **Bank Balance** | Commercial checking and deposit accounts | GL Account `100003` (Commercial Bank) | [Bank Book Report](file:///finance/reports/bank-book) |
| **Accounts Receivable** | Customer receivables control | GL Account `110001` & customer subledgers | [Customer Aging Report](file:///invoice-center/reports/customer-aging) |
| **Accounts Payable** | Trade creditors control | GL Account `200001` & purchase vouchers | [Payment Vouchers](file:///finance/banking/payment-vouchers) |
| **Overdue AR** | Receivables past credit term due date | `sales_invoices` where `due_date < CURDATE()` | [Customer Aging (Overdue)](file:///invoice-center/reports/customer-aging) |
| **Net Liquidity Surplus** | Inflows minus disbursements | `general_ledger_entries` for cash/bank | [Trial Balance](file:///finance/reports/trial-balance) |

---

### VERIFICATION & COMPLIANCE SIGN-OFF

- **Backend Unit Tests:** `TestDashboardService_AlertsGeneration` and `TestDashboardService_AlertsWhenNoOverdue` passed (`go test -v ./internal/finance/services/...`).
- **Backend Build:** `go build ./...` compiled cleanly with exit code 0.
- **Frontend Production Build:** `npx vite build` succeeded in 17.66s without bundle errors.
