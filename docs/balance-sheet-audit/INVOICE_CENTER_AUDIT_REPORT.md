# Invoice Center Audit & Engineering Resolution Report

**Document Reference:** IC-AUDIT-2026-OCT  
**Classification:** Statutory Receivables & Commercial Sales Intelligence  
**Target Modules:** 
- Invoice Center Reports: Customer Balance Report (IC-01)
- Invoice Center Reports: Customer Aging Report (IC-02)
- Sales Invoice Register: Missing Invoices & Status Filtering (IC-03)
- Customer Statements: Date Range Defaults & Running Balances (IC-04)
- Sales Invoice Detail: Financial Presentation & Sales Order Linkage (IC-05)
- Commercial Documentation: Debit Note Header Orthography (IC-06)
- Customer Selector Integrity: Trailing Hyphen Elimination & Safe Naming (IC-07)

**System Scope:** Enterprise ERP (CeylonMed Global / Multi-Tenant Edition)  
**Audit Period:** Financial Year 2026/2027 (and October 2026 Commercial Period)  
**Sign-off Status:** **RESOLVED, VERIFIED, & DEPLOYED IN PRODUCTION**

---

## Executive Summary

During operational audit and quality assurance of the Invoice Center and Commercial Accounts Receivable module, several defects were identified across statutory reporting, invoice visibility, presentation alignment, and customer metadata rendering:

1. **Customer Balance Report (IC-01):** Administrators and authorized financial managers received `"Failed to generate report"` (HTTP 403 / unhandled API error) when attempting to view customer balances.
2. **Customer Aging Report (IC-02):** Report generation failed due to permission misconfigurations, while aging buckets lacked executive KPI visibility and defensive boundary logic.
3. **Sales Invoice Register Missing Records (IC-03):** The October 2026 Sales Invoice Register returned zero records under default filters, completely obscuring critical invoices such as `INV-2026-0114` (dated 20 October 2026).
4. **Customer Statement Date Range Defaults (IC-04):** Blank default dates led to invalid unbound queries or ambiguous statement periods with unformatted zero-dates (`0001-01-01`).
5. **Invoice Detail Presentation Improvements (IC-05):** Numeric financial columns were left-aligned, inconsistent decimal formatting was observed, and clicking linked Sales Orders failed to navigate to the source order.
6. **Debit Note Column Header Typo (IC-06):** List view displayed typographical error `"Original Invioce No."`.
7. **Customer Selector Trailing Hyphen (IC-07):** Report customer filter dropdowns rendered customer options with a trailing hyphen (e.g. `CUST_MAHARAGAMA_PHARM - `) due to referencing a non-existent property `c.company_name`.

All seven issues have been investigated, root-caused, engineered, and verified against the live enterprise backend and compiled frontend.

---

## Detailed Root Cause Analysis & Engineering Resolutions

### 1. IC-01: Customer Balance Report Resolution

#### The Problem
When the tenant administrator or financial controller requested the Customer Balance Report, the UI surfaced `"Failed to generate report"` accompanied by HTTP 403 Forbidden errors or unhandled generation failures. Furthermore, if a customer legitimately had zero transactions, the system displayed an error state rather than an informative empty state.

#### Root Cause
1. **Permission Mapping Discrepancy:** In `backend/internal/company/seeders/permission_seeder.go`, the permission was seeded as `invoice_center.reports.customer_balance.view`, whereas the API route middleware and invoice center seeder checked `invoice_center.report.customer_balance`.
2. **Database Schema Field Mismatch (HTTP 500):** In `backend/internal/invoicecenter/repositories/invoice_center_report_repository.go` (`GetCustomerBalanceSummary`), the SQL query attempted `COALESCE((SELECT name FROM customer_categories WHERE id = customers.customer_category_id), '')`. In the database schema, `customer_categories` defines the column as **`category_name`**, not `name`. When executed against MySQL, the query triggered `Error 1054: Unknown column 'name' in 'field list'`, causing the backend to throw HTTP 500 Internal Server Error (`Request failed with status code 500`).
3. **Conflation of Error vs. Empty State:** The frontend initially failed to distinguish between network/permission faults and legitimate zero-record returns, triggering error banners on valid zero-balance queries.

#### Engineering Fix
* **Database Query Refactoring & LEFT JOIN Optimization:** Updated [invoice_center_report_repository.go](file:///home/janith/Projects/pixandco-web/erp/backend/internal/invoicecenter/repositories/invoice_center_report_repository.go) to replace the failing subquery with an optimized `LEFT JOIN customer_categories cat ON cat.id = customers.customer_category_id AND cat.deleted_at IS NULL` selecting `COALESCE(cat.category_name, '') as customer_category`, and joined `chart_of_accounts coa`. Also wrapped `credit_limit` and `current_balance` in `COALESCE` to prevent NULL arithmetic issues in `GREATEST` and `SUM`.
* **Backend Permission Alignment:** Added `invoice_center.report.customer_balance` and `invoice_center.reports.customer_balance.view` to the administrator role assignments and wildcard fallback middleware.
* **Separation of States in UI:** Updated [CustomerBalanceReportPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/invoice-center/reports/CustomerBalanceReportPage.tsx) to explicitly display `ReportErrorState` only on actual HTTP failures, while rendering a clean `ReportDataTable` empty state (`"No customer balance records match your filter criteria."`) when data is legitimately empty.
* **Export Validation:** Connected `ReportExportActions` with explicit column definitions (`Customer Code`, `Customer Name`, `Credit Limit`, `Current Balance`, `Status`), enabling instant CSV spreadsheet download and print-ready layouts.

---

### 2. IC-02: Customer Aging Report Resolution

#### The Problem
Administrators could not generate the Customer Aging Report due to permission errors. Furthermore, the report lacked executive summary metrics to assess overdue debt concentrations across aging buckets.

#### Root Cause
1. Route middleware strictly required `invoice_center.report.customer_aging`, which was missing from the Admin permission mapping seed.
2. The aging report table did not provide quick aggregations for credit risk management (Current & <30d, 31-60d, 61-90d, 91-120d, >120d).

#### Engineering Fix
* **Permission Grant:** Seeded permission `invoice_center.report.customer_aging` into the Admin role matrix.
* **Executive Summary KPI Ribbon:** Added dynamic summary cards to [CustomerAgingReportPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/invoice-center/reports/CustomerAgingReportPage.tsx):
  * **Total Accounts:** Count of active customer accounts evaluated.
  * **Current & < 30d:** Immediate receivables within normal trade terms.
  * **Overdue (31-120d):** Accounts requiring active collections follow-up.
  * **Critical (> 120d):** High-risk overdue debt requiring provisioning/escalation.
  * **Total Outstanding:** Mathematical sum of all aging buckets, matching general ledger accounts receivable.
* **Error Resilience:** Embedded `ReportErrorState` with retry and reset triggers to handle temporary failures gracefully.

---

### 3. IC-03: Sales Invoice Register Missing Records (October 2026)

#### The Problem
When accessing the Sales Invoice Register for October 2026, the report returned **0 records**. In particular, invoice `INV-2026-0114` (dated 20 October 2026 for customer Maharagama Pharmacy) was not displayed, misleading users into believing no commercial activity had occurred.

#### Root Cause
1. **Restrictive Default Filter (`posted_only = true`):** The default filter in `invoice_center_report_dto.go` and `SalesInvoiceRegisterReportPage.tsx` was configured to `posted_only: true`. Any invoice currently in `draft`, `submitted`, `approved`, or `unposted` status was completely omitted.
2. **Date Range Timestamp Truncation:** Date filters compared timestamps against `00:00:00`, truncating invoices created later during the target end date.

#### Engineering Fix
* **Flexible Status Filtering:** In [invoice_center_report_repository.go](file:///home/janith/Projects/pixandco-web/erp/backend/internal/invoicecenter/repositories/invoice_center_report_repository.go), modified the query to only enforce `status = 'posted'` when the user explicitly enables the toggle; otherwise, all valid commercial invoices (approved, unposted, posted, paid, partially paid) are included.
* **Inclusive Timestamp Boundary:** Adjusted date filters to cover the entire 24-hour window through `23:59:59` for `date_to`.
* **Verification:** Invoice `INV-2026-0114` (dated 20 October 2026) and all October 2026 records now render immediately under default and date-filtered register views.

---

### 4. IC-04: Customer Statement Report Date Range Defaults

#### The Problem
Opening the Customer Statement page previously displayed blank Date From (`""`) and Date To (`""`) inputs. Generating statements with empty dates resulted in unbounded queries or unformatted zero timestamps (`0001-01-01`).

#### Root Cause
Missing pre-populated sensible date defaults and lack of client-side date order validation.

#### Engineering Fix
* **Current Month-to-Date Default:** Implemented `getDefaultDateRange()` in [CustomerStatementReportPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/invoice-center/reports/CustomerStatementReportPage.tsx), defaulting `date_from` to the 1st of the current month and `date_to` to today.
* **Input Validation:** Enforced check that `date_from <= date_to`, displaying an informative toast error (`"Date From cannot be later than Date To"`) if violated.
* **Zero-Date Cleansing:** Implemented `formatReportDate()` to intercept Go zero timestamps (`0001-01-01T00:00:00Z`, `null`, `undefined`) and render clean localized dates (e.g. `20 Oct 2026`) or dashes.
* **Export Integration:** Integrated `ReportExportActions` with formatted running balances, document types, and transaction references.

---

### 5. IC-05: Sales Invoice Detail Presentation Improvements

#### The Problem
In invoice line tables, numeric columns (Quantity, Unit Price, Discount, Tax, Subtotal) were left-aligned, conflicting with accounting best practices. In addition, clicking the linked Sales Order did not navigate to the order details.

#### Root Cause
1. Table cells used default left text alignment instead of `text-right` / `tabular-nums`.
2. The sales order link component rendered plain text rather than an active routing link.

#### Engineering Fix
* **Right-Aligned Numeric Columns:** Updated [SalesInvoiceLineTable.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/components/invoice-center/SalesInvoiceLineTable.tsx) to align all numeric quantities, unit rates, discounts, tax amounts, and line totals to the right with font tabular numerals (`tabular-nums font-mono`).
* **Active Sales Order Linkage:** Updated [SalesInvoiceSalesOrderLinkCard.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/components/invoice-center/SalesInvoiceSalesOrderLinkCard.tsx) to render a clickable link navigating directly to `/invoice-center/sales-orders/:id`.
* **Standardized Currency Formatting:** Ensured all amounts display with 2 decimal places and thousands separators (e.g., `LKR 1,250.00`).

---

### 6. IC-06: Debit Note Column Header Typo Fix

#### The Problem
In the Debit Notes register page, the table column header for the source invoice was misspelled as `"Original Invioce No."`.

#### Root Cause
Typographical error in the column definition of [DebitNotesPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/invoice-center/debit-notes/DebitNotesPage.tsx).

#### Engineering Fix
* Corrected column header string to `"Original Invoice No."`.

---

### 7. IC-07: Customer Selector Trailing Hyphen (`CUST_CODE - `)

#### The Problem
In the **Select Customer** dropdown of the Customer Aging Report, Customer Balance Report, and Customer Statement Report, options rendered with an awkward trailing hyphen:
```text
CUST_MAHARAGAMA_PHARM - 
```

#### Root Cause
In React JSX, the option template was written as:
```tsx
<SelectItem key={c.id} value={c.customer_code || c.company_name}>
  {c.customer_code} - {c.company_name}
</SelectItem>
```
The Customer entity model from the backend database schema (`customers` table) defines the name field as **`customer_name`** (`c.customer_name`), not `company_name`. Because `c.company_name` was `undefined`, React rendered `{c.customer_code} - {undefined}`, leaving the trailing hyphen ` - `.

#### Engineering Fix
Updated customer mapping across all dropdowns to use `c.customer_name` and implemented a defensive guard:
```tsx
{customers.map((c) => {
  const customerName = c.customer_name || c.company_name;
  const label = customerName
    ? `${c.customer_code} - ${customerName}`
    : (c.customer_code || `Customer #${c.id}`);
  return (
    <SelectItem key={c.id} value={c.customer_code || String(c.id)}>
      {label}
    </SelectItem>
  );
})}
```
Now, options display clearly as `CUST_MAHARAGAMA_PHARM - Maharagama Pharmacy`, or strictly `CUST_MAHARAGAMA_PHARM` if a customer name is absent, eliminating trailing hyphens system-wide.

---

## Verification Matrix & Sign-off

| Item | Requirement | Verification Method | Result | Status |
|---|---|---|---|---|
| **IC-01** | Admin Customer Balance Report Generation | Tested API request & permission seeder. Verified zero-data state vs error alert. | Generates cleanly; returns 200 OK. | **PASSED** |
| **IC-02** | Customer Aging Report & Summary KPIs | Verified aging buckets, summary ribbon totals, and CSV export. | Buckets compute accurately; exports clean CSV. | **PASSED** |
| **IC-03** | October 2026 Sales Invoices Visibility | Verified invoice `INV-2026-0114` appears under default & date filters. | All October invoices visible; zero omissions. | **PASSED** |
| **IC-04** | Customer Statement Default Date Range | Verified month-to-date default (`1st of month` to `today`) and date order checks. | Defaults populated; zero dates cleanly formatted. | **PASSED** |
| **IC-05** | Numeric Column Alignment & Order Link | Verified right-alignment, currency format, and sales order link click. | Aligned right; order link navigates correctly. | **PASSED** |
| **IC-06** | Debit Note Header Typo Fix | Inspected Debit Notes page column header. | Corrected to `"Original Invoice No."`. | **PASSED** |
| **IC-07** | Customer Dropdown Trailing Hyphen Fix | Verified Select Customer trigger and dropdown list. | Displays `CODE - Customer Name` with no trailing `-`. | **PASSED** |

---

## Build & Integration Verification
- **Backend Tests:** `go test ./...` in `backend/` passed with 0 failures.
- **Frontend Build:** `npm run build` in `frontend/` passed with exit code 0 and generated optimized static production chunks.
