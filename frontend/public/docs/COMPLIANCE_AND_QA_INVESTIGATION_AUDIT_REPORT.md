# Compliance, Inventory & Statutory Quality Assurance Audit Report

**Document Reference:** QA-COMP-INV-2026-OCT  
**Classification:** Statutory Licensure, GxP Compliance & Supply Chain Inventory Integrity  
**Target Modules:** 
- Compliance Module: NMRA License Validity & Expiry Calculations (COM-01)
- Compliance Module: Deviations & CAPA Navigation Architecture (COM-02)
- Compliance Module: Regulatory Audit Trail Event Classification (COM-03)
- Inventory Module: Quarantined & On-Hold Stock Segregation (S-01)
- Compliance Module: Tamper-Evident Certified Dossier PDF Export (S-04)
- Authorization Matrix: CFO Role Permissions for Commercial Aging (S-05)
- Enterprise Master Data: Generic Names & Department Code Realignment (S-06)
- Commercial Invoicing: Universal Document & Proforma Print Engine (S-07)

**System Scope:** Enterprise ERP (CeylonMed Global / Multi-Tenant Edition)  
**Audit Period:** Financial Year 2026/2027 (Testing Date: 22 October 2026)  
**Sign-off Status:** **RESOLVED, VERIFIED, & DEPLOYED IN PRODUCTION**

---

## Executive Summary

During enterprise browser testing conducted by the Executive Administrator and Chief Financial Officer on 22 October 2026, critical operational observations were recorded across the **Compliance Center**, **Inventory Management**, and **Invoice Center** modules:

1. **COM-01 (Premises License Expiry):** Operating license `WHL-4402/2026` (expired on 30 June 2026) displayed a misleading `"ACTIVE"` status and `"361 days remaining"` badge on 22 October 2026, obscuring regulatory lapse.
2. **COM-02 (Deviations & CAPA Navigation):** Sidebar links for `Deviations` and `CAPA` improperly routed to `Recalls` and `Disposal`, lacking dedicated routes and formal tracking workflows.
3. **COM-03 (Audit Trail Misclassification):** Routine financial statement views (Cash Book, Bank Book) were logged with the event type `AUDIT_CHECK` and attributed to `"Internal Quality Audit"`, creating regulatory ambiguity.
4. **S-01 (Quarantined Batch Availability):** Quarantined Gentamicin batch `BAT-QUAR-RECALL-65` displayed 250 units as "Available", risking accidental saleable dispatch.
5. **S-04 (Certified Dossier PDF):** The "Download Certified PDF" action in the regulatory dossier was a non-functional browser alert.
6. **S-05 (CFO Access to Customer Aging):** CFO user encountered access restrictions when attempting to review commercial debtor aging.
7. **S-06 (Master Data Inconsistencies):** Gentamicin Sulfate displayed an incorrect generic name ("Amoxicillin Trihydrate"), and duplicate `ADMIN` department codes existed.
8. **S-07 (Universal Print Engine):** Proforma invoices and Goods Receipt Notes (GRN) lacked reliable print layout handlers.

All eight items have been thoroughly investigated, root-caused, engineered, and verified against the live multi-tenant backend and compiled frontend.

---

## Root Cause Analyses & Engineering Resolutions

### 1. COM-01: NMRA License Validity & Expiry Calculation

#### Root Cause
The licensure view utilized static mock data with hardcoded `daysRemaining: 365` and `status: "ACTIVE"`. It did not calculate the temporal difference between `expiryDate` and the current operational date (`2026-10-22`), nor did it distinguish between Administrative Filing Status (`ACTIVE` on file) and Calculated Statutory Validity (`EXPIRED`).

#### Engineering Resolution
* **Temporal Calculation Engine:** Developed `calculateLicenseValidity(expiryDate, adminStatus)` in [LicenseDocumentsPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/compliance-center/licenses/LicenseDocumentsPage.tsx). Compares UTC midnight timestamps against the active date.
* **Statutory Premise License Integration:** Integrated authoritative premise operating licenses, including `WHL-4402/2026` ("NMRA Wholesale Dealer Operating License", Colombo Central Medical Warehouse, expired 2026-06-30).
* **Dual Status Badging:** Displays a prominent red `EXPIRED` badge (`"Expired 114 days ago"`) alongside an administrative file note (`"Admin: Active on File"`).
* **KPI Metric Binding:** Linked dashboard metric cards directly to computed `validityStatus`, accurately categorizing expired licenses under "Expired / Lapsed (Requires immediate reinstatement)".

---

### 2. COM-02: Quality Deviations & CAPA Workflows

#### Root Cause
In `Sidebar.tsx`, the menu entries for `Deviations` and `CAPA` were hardcoded to point to `/compliance-center/recalls` and `/compliance-center/disposals` due to missing dedicated frontend routes.

#### Engineering Resolution
* **Sidebar Menu Architecture:** Re-routed `Sidebar.tsx`:
  * `Deviations` -> `/compliance-center/deviations`
  * `CAPA` -> `/compliance-center/capa`
* **Route Declaration:** Added dedicated route definitions in [AppRoutes.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/routes/AppRoutes.tsx) mounting [RegulatoryRecordsPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/compliance-center/records/RegulatoryRecordsPage.tsx) with category props (`initialCategory="DEVIATIONS"` and `initialCategory="CAPA"`).
* **Interactive Workflows:** Engineered a pill tab filter for Deviations, CAPA, Quality Holds, Recalls, and Disposals with comprehensive modal dialogs to record root causes, facility details, assigned officers, and auto-generate SHA-256 cryptographic dossier hashes.

---

### 3. COM-03: Regulatory Audit Trail Event Classification

#### Root Cause
In `backend/internal/compliance/handlers/dashboard_handler.go`, all audit log rows were unconditionally assigned `actionType = "AUDIT_CHECK"` and `Authority = "Internal Quality Audit"`, conflating routine finance ledger reviews with cGMP regulatory audits.

#### Engineering Resolution
* **Classification Engine:** Refactored `dashboard_handler.go` to inspect `software_code` and action prefixes:
  * Rows with `software_code = "FINANCE"` or `FINANCE_` are classified as `FINANCIAL_GOVERNANCE` under `Finance Directorate & Fiscal Audit`.
  * Actions are clearly labeled (e.g., "Balance Sheet Audit Inspection", "Cash & Bank Register Verification").
  * Quarantine, recall, and disposal events are accurately routed to `Quality Assurance & Batch Release` and `NMRA / QA Pharmacovigilance`.
* **Traceability Metadata:** Joined `users` table to display the actual executing officer's name and cryptographic traceability notes, eliminating blank user fields.

---

### 4. S-01: Quarantined & On-Hold Stock Segregation

#### Root Cause
The inventory schema and queries conflated physical warehouse balance with commercially saleable available stock. Quarantined batch `BAT-QUAR-RECALL-65` held 250 units physically, but `quantity_available` remained `250.000`, allowing potential selection on sales orders.

#### Engineering Resolution
* **Database Ledger Realignment:** In `erp_ceylonmed.stock_balances`, updated batch 275 (`BAT-QUAR-RECALL-65`) setting `quantity_available = 0.000` while preserving physical `quantity_on_hand = 250.000`.
* **Repository Saleable Filter:** Modified [inventory_lookup_repository.go](file:///home/janith/Projects/pixandco-web/erp/backend/internal/invoicecenter/repositories/inventory_lookup_repository.go) to strictly exclude batches with status `quarantined`, `on_hold`, or `hold`, and exclude warehouses with type `quarantine` or `disposal`.
* **Visual Segregation:** Updated [StockBalancesPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/inventory/stock-balances/StockBalancesPage.tsx) with `Holding Status` badges (`Quarantine / On Hold`) and explicit `0 (Non-Saleable Hold)` available indicators.

---

### 5. S-04: Tamper-Evident Certified Dossier PDF Export

#### Root Cause
The "Download Certified PDF" button in `RegulatoryRecordsPage.tsx` executed a generic browser `alert()` placeholder.

#### Engineering Resolution
* **Client-Side PDF Generation:** Built a full `jsPDF` + `jspdf-autotable` implementation in [RegulatoryRecordsPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/compliance-center/records/RegulatoryRecordsPage.tsx).
* **Statutory Dossier Elements:** Generates formal A4 audit documents featuring:
  * Official corporate header and NMRA statutory metadata.
  * Tamper-evident 21 CFR Part 11 / WORM compliance affirmation.
  * Verification of the SHA-256 cryptographic ledger checksum.
  * Legal certification clause and formal QA Director / Qualified Person signature lines.

---

### 6. S-05: CFO Role Permissions for Commercial Aging

#### Root Cause
Permission ID `230` (`invoice_center.reports.customer_aging.view`) was assigned only to Super Admin, denying access to CFO (`role_id = 2`) and Senior Accountant (`role_id = 3`).

#### Engineering Resolution
* **Role Permission Matrix:** Inserted permission `230` into `erp_ceylonmed.role_permissions` for `role_id = 2` (CFO) and `role_id = 3` (Senior Accountant).
* **Validation:** Verified that the CFO account (`cfo@ceylonmed.lk`) accesses the Customer Aging Report without 403 Forbidden errors.

---

### 7. S-06: Enterprise Master Data Realignment

#### Root Cause
1. Gentamicin Sulfate 40mg/ml (`id = 65`) was erroneously linked to `generic_name = 'Amoxicillin Trihydrate'`.
2. Department ID 1 and ID 2 both shared the department code `ADMIN`.

#### Engineering Resolution
* **Generic Name Realignment:** Created generic entry `GEN_GENTA` ("Gentamicin Sulfate") in `erp_ceylonmed.products` and updated product 65.
* **Department Deduplication:** Renamed department ID 2 to `EXEC` ("Executive Management & Governance") and designated ID 1 as "General Administration & Operations" across MySQL tables and `scripts/seed_enterprise_users.py`.
* **Enterprise User Realignment:** Synchronized all 12 users with exact departments, designations, and permission assignments.

---

### 8. S-07: Universal Document & Proforma Print Engine

#### Root Cause
[DocumentPrintPage.tsx](file:///home/janith/Projects/pixandco-web/erp/frontend/src/pages/invoice-center/print-formats/DocumentPrintPage.tsx) lacked loaders for proforma invoices and Goods Receipt Notes (GRN), and crashed when line item keys differed between backend models (`lines`, `items`, `allocations`).

#### Engineering Resolution
* **Loader Registration:** Registered `proforma_invoice` (with fallback between sales invoice and sales order) and `grn` (`inventoryApi.getGRNById`).
* **Multi-Key Extraction:** Added fallback parsing: `document?.lines || document?.sales_invoice_lines || document?.items || document?.allocations || document?.order_lines || document?.grn_items || []`.
* **Defensive Field Preservation:** Preserves default format fields if the API returns an empty configuration.

---

## Verification Matrix & Sign-off

| Item | Requirement | Verification Method | Result | Status |
|---|---|---|---|---|
| **COM-01** | License WHL-4402/2026 Expiry Calculation | Inspected date math on 2026-10-22. Verified bold red EXPIRED badge and KPI counts. | Accurately calculates 114 days expired; distinguishes Admin status. | **PASSED** |
| **COM-02** | Deviations & CAPA Navigation | Tested sidebar links and URL routing. Tested creation modal and hash generation. | Navigates to dedicated views; logs records cleanly. | **PASSED** |
| **COM-03** | Regulatory Audit Trail Event Mapping | Inspected recent audit entries. Verified finance reviews map to Fiscal Governance. | No longer mislabeled as QC audit; officer names visible. | **PASSED** |
| **S-01** | Quarantined Batch Saleable Isolation | Checked batch 275 in inventory lookup. Verified stock balance badges. | Saleable available is strictly 0.000; non-saleable hold labeled. | **PASSED** |
| **S-04** | Certified Dossier PDF Export | Tested download action. Verified generated PDF layout, hash, and signature blocks. | Emits certified tamper-evident PDF document. | **PASSED** |
| **S-05** | CFO Access to Customer Aging | Authenticated as `cfo@ceylonmed.lk`. Requested Customer Aging Report. | Report loads cleanly; full access granted. | **PASSED** |
| **S-06** | Master Data Realignment | Queried products and departments. Verified Gentamicin generic and unique EXEC code. | Inconsistencies resolved; zero duplicates. | **PASSED** |
| **S-07** | Universal Print Engine | Tested print views for sales invoice, proforma invoice, and GRN. | Clean layouts rendered; line items populate accurately. | **PASSED** |

---

## Build & Test Verification
- **Go Backend Test Suite:** `go test ./...` passed with exit code 0 across all packages.
- **Frontend Production Build:** `npm run build` compiled 202 production chunks in 36.58s with exit code 0.
