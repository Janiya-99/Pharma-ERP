# Antigravity Master QA Instruction — Pharmaceutical Distribution ERP

**Purpose:** Execute a complete, evidence-backed end-to-end quality-assurance audit of the existing ERP. Start by creating a new company from the platform administrator panel; verify the actual database persistence and relationships; sign in as that company's newly created administrator; complete all setup; then run the real purchase-to-pay, inventory-to-sales, order-to-cash, finance, tax, compliance, security, and history scenarios. Produce verifiable test cases and a final defect report.

**Stack:** React + Vite frontend; Go backend; database, test frameworks, and deployment topology **must be discovered from the repository** rather than guessed.

**Modules (exactly five, preserve the current naming and ownership):**
1. **Control Center** — company, branches, users, roles, permissions, designations, settings, audit logs.
2. **Finance** — COA, journals, GL, AR/AP, payments, receipts, bank, tax, reports.
3. **Inventory** — products, batches, expiry, warehouses, GRN, stock transfers, adjustments, stock ledger; purchasing/PO workflow should be tested where the application currently exposes it.
4. **Invoice Center** — sales orders, invoices, invoice items, credit notes, debit notes, customer receipts.
5. **Compliance Center** — NMRA/license documents, batch recalls, batch holds, expiry disposal, regulatory records.

**Architecture instruction:** Keep module implementations separate. Exercise cross-module business workflows as they exist, without merging modules or rewriting architecture. The same business entity must not be independently recreated across modules. Use documented references, genuine relationships, and verifiable transaction events.

## Non-negotiable execution rules

- **Run tests; do not only draft a plan.** Open the real application, use available browser automation when possible, call real Go APIs where available, and verify data with **read-only SQL** against the designated test database.
- **Never claim a case passed without actually executing it and preserving evidence.** Mark `PASS`, `FAIL`, `BLOCKED`, `NOT_IMPLEMENTED`, or `NOT_RUN`. `NOT_RUN` is not `PASS`.
- **Do not run destructive tests against production.** Before inserting any test data, identify and verify the environment. Use an authorized local/staging/test environment with a fresh snapshot/backup, and confirm `APP_ENV`, DB host/name, tenant strategy, and test approval. If environment is unknown or production, stop write activity and report a blocker.
- Use **synthetic** data only. Never use genuine customer, patient, employee, banking, or personal information. Prefix every fixture with `QA20261015_` or a clearly documented unique run ID.
- Do not disclose secrets, passwords, tokens, DB connection strings, tax registration numbers, or raw sensitive records in artifacts. Store credentials only in safe local environment mechanisms. Screenshots and logs must be redacted.
- Do not silently patch a failing feature and call it a pass. First reproduce, preserve evidence and a defect record, then (only if explicitly authorized) fix and rerun as a separate retest. No schema or migration changes without approval.
- Tax compliance findings require confirmation against current Inland Revenue Department (IRD) official sources and a qualified accountant/tax adviser before anyone treats the ERP as legally compliant.
- Regulatory checks must reference current NMRA requirements, but software testing does not constitute NMRA certification.
- Use **separate actions for workflow state**, not arbitrary database writes that bypass validation. Database mutations should result from application's normal UI/API operations, except controlled initial test setup approved in advance.
- Assign a unique execution ID to every run; capture UTC time, local date/time and timezone, app build, backend commit/version, migration version, DB engine/version, test account/tenant ID (sanitized), run environment, and source URLs for regulatory checks.

## Stage 0 — Discover the system and prepare the test environment

1. Inspect project structure, frontend package manager/config, routes, authentication, HTTP client, feature flags, mock interceptors, permission handlers, Go API, migrations/models/query layers, test frameworks, Docker/Compose, CI, seeders, and environment files **without exposing secrets**.
2. Determine whether each of the five modules is real, mock-only, partially wired, or absent. Record endpoints, UI page routes, permission names, statuses, and table names **as discovered**. If an expected page exists only as mock UI, it must not pass a persistence test.
3. Determine tenant isolation model (`company_id` scoping, row-level tenancy, or separate databases), branch scoping, approval flow, source-of-truth ledgers, stock costing method, document posting rules, and tax configuration model.
4. Verify all services are healthy and connected: frontend → Go API → test database. Ensure migrations applied and test database is writable by app; obtain separately authorized **read-only** DB access for verification.
5. Record known compile, lint, build, frontend console, Go backend logs, and database errors before creating data. Distinguish preexisting bugs from test-induced regressions.
6. Confirm snapshot/rollback and cleanup process. Create run-scoped evidence directory. Record browser, viewport, API, and DB versions. If required tools/access are unavailable, mark relevant test cases `BLOCKED` instead of improvising results.
7. Produce `01_environment_inventory.md` including actual routes, modules, endpoints, tables, inferred gaps, and readiness blockers.

## Stage 1 — Create a company from the platform-admin panel

**Action sequence:**
1. Log in with an authorized **platform administrator** account to the existing Control Center admin portal.
2. Create a synthetic pharmaceutical distributor named `QA20261015 Pharma Distribution (Test)`; use unique legal registration reference, fake TIN placeholder **only if the test environment permits it**, email on an approved test domain, base currency `LKR`, timezone `Asia/Colombo`, legal address, branch preference and tax-registration status. Do **not** fabricate a real NMRA license or assume a fake license passes regulatory verification.
3. Submit once. Capture client request/response, network status, UI success message and company ID. Immediately reload the browser and re-open the record.
4. Check database through read-only queries based on **actual discovered table names**: exactly one company; unique code/registration where required; correct name/currency/timezone/status; created_by; timestamps; no unintended duplicates; any related settings/tax profile/license document records only if provisioning is designed to create them.
5. Create the company's first branch if not auto-created. Verify branch belongs to the new company and does not attach to an existing tenant.
6. Create/invite initial company admin user. Verify user row or identity record, company membership, designated role/permission assignments, branch scope, invite lifecycle, password reset status, user creation audit, and absence of plaintext password. If users can belong to multiple companies, verify membership link table rather than assuming `users.company_id`.
7. Test refresh/retry/double-click/concurrent company create, duplicate company registration, invalid details, missing mandatory values, partial failure rollback, and user creation failure handling. Validate uniqueness and atomic provisioning.
8. Log out platform admin. Capture `company_id`, `branch_id`, `user_id`, and assignment IDs in a private sanitized execution manifest.

**Mandatory DB evidence:** company row → membership/role mapping → branch row → company settings → audit events; assert every foreign key exists and scopes agree; no orphaned role memberships, stale invitations, or leaked cross-tenant references.

## Stage 2 — First login with the newly created company user

1. Activate the invitation/reset password via authorized test channel, not by bypassing the UI. Check invite expiry and single use.
2. Sign in using the **new company admin**, not the platform admin. Confirm correct company identity and isolation (sidebar, headers, settings, API tenant scope); ensure no platform-admin access.
3. Complete any forced password change/MFA setup if supported. Test invalid login, lockout/rate limiting, logout, session expiry, reload, refresh token handling, browser back after logout, and user disabled mid-session.
4. Open all five modules and check visibility and permissions for this company. Verify app-level and API-level authorization separately; hidden buttons are not authorization.
5. Open tenant settings and complete **all required initial configuration** below. Save/reload every page, validate persistence in DB, capture an audit trail, and ensure the setup checklist reflects saved state.

## Stage 3 — Full new-company configuration checklist

| Setup order | Module | Configure and verify |
|---|---|---|
| 01 | Control Center | Legal company details, LKR, timezone, locale/date/decimal precision, addresses, tax registration status, branch code, fiscal defaults, active/inactive state |
| 02 | Control Center | Branches, departments, designations, staff, user invitations, roles, explicit permissions, scope per company/branch/warehouse, maker-checker approval matrices, numbering sequences, audit retention and document status history |
| 03 | Finance | Financial year and accounting periods; chart of accounts (assets, liabilities, equity, sales, COGS, expense, control accounts); opening balances; bank/cash accounts; receivable/payable mappings; stock/GRNI/COGS mappings; journal approval thresholds |
| 04 | Finance | Tax registration applicability, effective-dated tax codes and classification, VAT vs exempt vs zero-rated vs outside scope, SSCL where applicable, input/output tax accounts, rounding, tax reporting, invoice document templates, effective-date changes |
| 05 | Inventory | Branch warehouse(s), bins, storage zones, quarantine area, temperature/storage fields if supported, units (unit/strip/box/carton), conversion factors, manufacturers, brands, categories, dosage forms, product registration info, reorder settings, cost method, FEFO/minimum shelf life |
| 06 | Inventory | Suppliers, supplier payment terms, product suppliers, initial stock policy (opening balance via controlled transaction), purchase authorization levels, PO/GRN numbering, quarantine/release policy |
| 07 | Invoice Center | Customers, customer categories, approved pharmacy/license data, routes/sales reps, credit terms/limits, tax details, price lists, discounts, sales orders, invoice numbering and printing, sales return/credit note rules, receipt allocation methods |
| 08 | Compliance Center | Product and supplier/customer license document types, registration/expiry warning thresholds, recall roles, batch hold/release approvals, disposal workflow, complaint categories, recall traceability, compliance reports |
| 09 | Cross-module | Audit trail, status history, notification triggers, approval escalation, period locks, print/export, status transitions, stock/GL posting mappings, minimum required evidence |

Do not invent missing system configuration silently. Report it as `NOT_IMPLEMENTED` or `BLOCKED` and describe the exact business impact.

## Stage 4 — Configure and test Sri Lanka tax correctly (mandatory)

**Regulatory baseline as checked 15 Oct 2026; re-verify against IRD during the run:**
- IRD's published **standard VAT rate** is **18%** from 1 January 2024. **Do not charge 18% on all products.** A published VAT exemption covers qualifying pharmaceutical products and drugs (excluding cosmetics; with stated conditions). Product tax treatment must depend on classification and the actual transaction.
- IRD lists an **SSCL rate of 2.5%** and exempt pharmaceutical wholesale/retail turnover. Other items/services and distributor categories can have different liable turnover bases. **SSCL is not automatically an extra line of 2.5% added to every sales invoice.**
- Gazette **2481/22** defines the revised VAT tax invoice; Gazette **2500/106** moved its mandatory effective date to **1 October 2026**. Test invoice headings, supplier/purchaser identification, required fields, prescribed serial-number convention, invoice and supply dates, LKR precision, value excluding VAT, VAT amount and total. Its tax-invoice requirement relates to VAT-taxable supplies; do not mix exempt-only goods into a VAT tax invoice contrary to the specified rule.
- Always distinguish **VAT-exempt** from **zero-rated** and from **outside scope**; the right to input-tax deduction and reports may differ. A `0%` tax rate alone is not enough metadata to express legal treatment.
- If entity is not VAT registered, check behavior appropriate to that status; never permit issuance of a VAT tax invoice purporting to charge VAT without entitlement.

**Official reference URLs for the agent to check:**
- VAT general: https://www.ird.gov.lk/en/Type%20of%20Taxes/SitePages/Value%20Added%20Tax%20%28VAT%29.aspx
- VAT exemption list: https://www.ird.gov.lk/en/Lists/Latest%20News%20%20Notices/Attachments/554/PN_VAT_2023-01_18122023_E%20-%20Exempt%20List.pdf
- SSCL: https://www.ird.gov.lk/en/Type%20of%20Taxes/SitePages/Social%20Security%20Contribution%20Levy%20%28SSCL%29.aspx
- 2026 revised VAT invoice Gazette: https://www.ird.gov.lk/en/publications/Gazette_Documents/2026_2481-22_E.pdf
- 2026 effective date amendment: https://www.ird.gov.lk/en/publications/Gazette_Documents/2026_2500_106_E.pdf
- NMRA GDP/recall/storage/disposal guidelines: https://www.nmra.gov.lk/pages/guidelines

**Required tax setup exercise:**
1. Capture fake company VAT registration status and TIN. Enter test-only tax registration numbers permitted by test validators. Check system validation vs regulatory compliance; do not treat fake records as legitimate registrations.
2. Create distinct codes: `VAT_STD_18` (18% standard), `VAT_EXEMPT_PHARMA` (exemption reason/documented basis), `VAT_ZERO` (0% zero-rated only where legally supported), `VAT_OUT_OF_SCOPE`, `SSCL_LIABLE`, `SSCL_EXEMPT_PHARMA`. Configure account mappings, reporting types, effective dates, product/taxpayer applicability.
3. Classify two controlled test products: one **hypothetically qualifying medicine** and one **hypothetically taxable non-exempt item** (e.g. appropriately classified accessory/non-pharma item). Require a human reviewer to confirm legal category; the automated test only checks that ERP follows its approved classification.
4. Enter a taxable example in test fixtures: one line `LKR 1,000.00` excluding VAT × 18% → VAT `LKR 180.00` → total `LKR 1,180.00`. Exempt medicine example `LKR 1,000.00` → VAT `LKR 0.00` with exemption code retained. Check tax-exclusive and tax-inclusive price entry without double charging.
5. Test discount-before-tax arithmetic: `3 × LKR 250.00 = 750.00`; 10% discount `75.00`; VAT-taxable net `675.00`; VAT at 18% `121.50`; grand total `796.50`.
6. Verify line-level vs invoice-level rounding, boundary cents, negative adjustments, returns, credit/debit notes, different branches, historical tax date, changed rates on future effective date, backdated documents (subject to period rules), cross-year transitions, cash/credit customer, non-VAT customer, exemption expiry/rule change.
7. Test that invoice print/PDF/preview and DB tax transaction, GL postings and tax report all agree; ensure legally relevant invoice fields are snapshotted on posting. Confirm current format against Gazettes at execution time.
8. For **SSCL reporting**: separately verify taxable turnover basis and applicable activity category. Example **only where a liable wholesale/retail activity with 50% turnover base applies**: LKR `200,000.00` eligible turnover × 50% × 2.5% = LKR `2,500.00` levy. A registered distributor category may have a 25% base instead; the system must choose based on legal category. Qualifying pharmaceutical-exempt turnover should be excluded from liable turnover; compare output to legally confirmed sample cases.
9. Check exemptions on purchases/imports, supplier-bill input VAT accounting, debit/credit reversals and blocked input VAT where ineligible. Do not assert all pharma purchases, imports, medical devices, cosmetics or services are uniformly exempt.
10. If legal classification, registration, invoice format, or tax policy is uncertain, raise a **Compliance Review Required** finding rather than guessing expected production tax behavior.

## Stage 5 — Seed realistic, isolated trading partners and products through the UI

Create at least:
- 2 branches (`QA_CMB`, `QA_KDY`) and 2 warehouses (`QA_MAIN`, `QA_SECONDARY`) plus quarantine and bin locations.
- 4 roles: Company Admin, Purchase Officer, Warehouse Officer, Sales/Billing Officer; plus Finance Accountant, Finance Approver and Compliance Officer, each with unique test users. Have at least 1 limited branch-specific user.
- 2 suppliers: local and importer/foreign supplier (if supported) with differing credit terms and document status.
- 3 customers: cash pharmacy, credit pharmacy, hospital/corporate; set credit limit and terms for the credit customer; retain synthetic NMRA/license metadata.
- 4 products: two batches of a medicine (same SKU, different expiry dates), another product with different unit of measure, a taxable non-exempt test item; optional service/nonstock product if supported.
- 2 tax classes and 2 pricing strategies. Build opening-balance or starting inventory through the application's **supported** controlled process only.

Save actual IDs and screenshots. Verify all records persist after reload and have correct tenant/branch ownership. Inspect DB uniqueness/FK/check constraints, tax assignments and history events. Use **no hardcoded table names** unless confirmed in migration/schema.

## Stage 6 — End-to-end procurement and inventory receiving

1. Create purchase requisition where supported; create Purchase Order `PO-A` for **100 units** of medicine batch `QA_LOT_A`, expiry `2027-12-31`, unit cost `LKR 120`, and **60 units** of same medicine intended for `QA_LOT_B`, expiry `2027-06-30`, at unit cost `LKR 120`. Include an independently taxable/non-exempt item in a separate PO if tax handling requires distinct invoice types.
2. Save PO draft; verify no stock or GL impact. Submit and approve as an **independent** authorized user; reject self-approval. Check notifications, audit/status history and DB state.
3. Perform **partial GRN** for 100 units lot A; record manufacturer, batch, manufacturing/expiry data, purchase conversion and warehouse/bin. Compare receipt quantities to PO quantities; reject overdelivery unless explicit tolerance approval.
4. GRN remainder 60 units as lot B. Check PO remaining qty and closure. Save a draft GRN and verify it has **not** increased available stock nor posted GL. Post approved GRN and compare with stock ledger, physical/quarantine status, and inventory valuation / GRNI accounting policy.
5. If quality acceptance is required, place received inventory in quarantine and approve release before sale. Inspect FEFO ordering: lot B expires earlier than A.
6. Create supplier bill matched to GRN; ensure no duplicate recognition of stock from invoice; verify accounts payable entry, GRNI clearing, tax classification, discounts/freight/cost allocation and supplier aging.
7. Supplier partial payment followed by final payment; verify payment allocation, cash/bank decrease, AP balance, GL and audit.
8. Exercise PO cancel, GRN rejection, wrong batch, duplicate supplier invoice, receipt over-quantity, missing expiry, expired lot, unit conversion, multi-warehouse putaway, return to supplier, overpayment, supplier credit note, tax adjustment.

## Stage 7 — Inventory FEFO / transfers / adjustment / safety

1. At baseline, test total **160 physical units** across lot A=100 and lot B=60. Compare physical stock, sellable stock, reserved stock and quarantined stock by lot/location.
2. Create a sales order for **25 units** and reserve it, but **do not ship or post the invoice yet**. FEFO must preferentially reserve lot B (2027-06-30) before lot A unless permitted override with approved reason. Reject a blocked/expired lot.
3. Confirm reservations reduce **available-to-promise**, not total physical stock. Release expired/cancelled reservations correctly.
4. Transfer **15 units of lot A** between warehouses; ensure out/in ledger movements reconcile to zero net company-wide movement and preserve lot identity. Test transfer in transit and destination acceptance if designed.
5. Write off **3 units of lot A** due to damage with approval and accounting consequence; check no negative stock.
6. Temporarily hold lot B and verify that new allocations are blocked and the existing reserved order is treated safely; then have the authorized compliance officer **release** the hold before Stage 8. Perform the **full recall of lot B only after the 25-unit sale in Stage 8**, during Stage 10, so affected-customer tracing is meaningful.
7. Physically count stock and create a controlled count variance adjustment. Verify batch ledger, cost valuation and journal posting. Test replay/retry does not double-post.
8. Test expiry warnings, FEFO ties, min-shelf-life by customer, damaged/quarantine/returned stock, missing bin, package conversion, concurrent allocations and a last-unit race.

**Reconciliation checkpoints:** At end of Stage 7, before sale or returns: Received 160 − damage writeoff 3 = **157 physical units** company-wide. Reserved 25 reduces available-to-promise but not physical quantity. The transfer of 15 changes warehouse balances, **not** total physical stock. After Stage 8 ships 25: **132 physical units** remain. If a physical customer return of 5 is accepted into quarantine, total on-hand becomes **137**, but sellable stock excludes the 5 quarantined units until released. Verify the actual event timestamps and document state; do not assume invoice creation itself ships goods.

## Stage 8 — Sales orders, invoices, receipts, AR and tax

1. Use the existing **25-unit reserved order from Stage 7** as the primary credit-sales fixture; also create a separate cash order for a different customer and quantity. Perform stock check; price/discount/tax resolution; customer credit-limit approval; independent sales approval; reserve FEFO batches and verify DB reservations.
2. Perform allocation → pick → pack → dispatch/issue → invoice posting according to **actual** ERP event policy; check no stock deducted twice; returned/undelivered items are handled appropriately.
3. Verify posted invoice numbering is unique per company/series and, when a **VAT Tax Invoice** is legally required, follows Gazette 2481/22 as amended. Compare printed invoice, DB items, tax ledger, stock ledger, and AR/COGS/stock journal entries.
4. Create a **cash invoice** and immediately record receipt; check bank/cash balance, AR, payment method and receipt allocation.
5. Create a **credit invoice** within credit limit, part-pay it, then settle it; assert statuses `UNPAID → PARTIALLY_PAID → PAID`, receipts sum to invoice amount and no rounding drift. Repeat beyond limit, disabled customer, expired registration, inactive products, insufficient stock, blocked/expired lot.
6. Return **5 units** against original invoice to **quarantine**; approve inspection, then choose restock or disposal according to policy. Issue credit note and reverse the appropriate sales/AR/tax/COGS/stock amounts exactly once. Verify stock physically returns but is not automatically sellable.
7. Debit note for legitimate price correction/additional charge; refund and overpayment handling; reversal not deletion; void draft vs posted cancellation; duplicate click/idempotency; invoice edit lock after posting.
8. Test mixed taxable and exempt merchandise: ordinary invoice vs VAT tax invoice printing rules; legally appropriate separate documents where required, no unauthorized aggregation.

## Stage 9 — Finance accounting verification

1. Review/complete COA, company/branch fiscal period, opening balances, bank GL, stock asset, GRNI, COGS, revenue, AR, AP, input/output VAT, SSCL liability where applicable, variance and write-off accounts.
2. Confirm **no GL entry on unposted draft**, and all required GL entries are posted **exactly once** on business-approved event. Balance per journal: `SUM(debit) = SUM(credit)`; check no zero-line or duplicate posted journals.
3. Compare each inventory/purchase/sales/payment/credit note/return business event to ledger rows by source reference, document number, company, branch, timestamp, user and status. Use posted reversal entries instead of editing journals in place.
4. Verify supplier aging, customer aging, cashbook/bank, GL account balances, trial balance, P&L, balance sheet, inventory valuation, gross profit, VAT schedules/SSCL schedules against underlying documents.
5. Bank transfer must balance debit/credit; reconciliation must not silently lose unmatched items. Test cheque bounced/reversed, duplicate bank statement rows, partial reconciliation, advance payments, late allocation, petty cash and fixed assets only where implemented.
6. Close a fiscal period, attempt late/backdated posting and opening-period edits; verify authorized reopening policy. Test posting to inactive GL account, account mapping missing, negative/zero amount, multi-branch permission, tax mismatch and unbalanced journal rejection.
7. Cross-check consistency between **finance GL** and **journal entry lines**. If project defines `fin_gl_transactions` as ledger source of truth or as a materialized projection, identify and assert that invariant rather than producing two independent totals that can diverge.

## Stage 10 — Compliance / recalls / licenses

1. Create synthetic product registration, supplier/customer license documents, issuer, dates, expiry, linked files and approval statuses; verify reminders/blocked business flows based on configured rules.
2. Place lot on hold (reason + approver); check immediate sales/PO/stock reservation restrictions as appropriate. Test pending pick/order workflows after hold.
3. Initiate recall for one lot; generate affected sold invoice/customer/delivery trace, quantities sold, quantity on hand, quantity returned, and unresolved quantity. Validate all documents are in the same company and linked to exact batch, not just product SKU.
4. Create complaint, investigation, corrective action and recall closure with evidence. Perform expired stock disposal request and approval; require physical quantity, reason, source lot, assigned warehouse, journal/write-off impact, immutable history.
5. Test unauthorized recall release, expired licenses, missing evidence, attachment rejection/size/content type, stored files permissions, duplicate recall, recall reversal/closure, and traceability of returned batches.

## Stage 11 — Security, multi-tenancy, logging, reliability

- **Isolation:** Create a second `QA20261015_OTHER` company with a separate user. Attempt to view/edit/export/download new-company records using the second company's UI and direct API references; ensure no data leakage, including reports, autocomplete, attachments, logs, and file URLs.
- **RBAC:** Check each role's create/read/update/approve/post/delete/export actions. Test a denied action via direct API, not only disabled buttons. Check revoked role mid-session, disabled account, unauthorized warehouse, own-approval, cross-branch access.
- **Auth:** Password hashing at rest, no password disclosure via API/audit/logs; reasonable session expiration, token refresh, signout, CSRF controls where cookie auth is used, CORS, rate limits, MFA if supported; no secrets in JS bundle or browser storage where avoidable.
- **Injection and content:** SQL injection probes, XSS payloads, unsafe upload type, massive payload, path traversal / insecure direct object reference, mass assignment attempt, price/tax/approved_by changes via crafted request; use non-destructive test strings.
- **Race/idempotency:** Double-submit PO, GRN, invoice, receipt, payment and recall; verify one posting, one stock event, one journal, one generated number. Simulate API timeout then retry; ensure consistent status/atomic rollback.
- **Audit:** Create/update/status/approve/post/reverse/delete/deactivate/login/denied events; verify actor, company, branch, timestamp, before/after, reason, source, correlation/trace ID where available, retention, read-only access, no plaintext secrets. No `ON DELETE CASCADE` removal of posted ledger/audit history.
- **DB normalization:** FK referential integrity, tenant-inclusive unique keys, no orphan details, correct header/detail relationship, explicit pivots for multi-valued roles/warehouse access, temporal price/tax histories, document snapshots, immutable ledgers, unique idempotency/source keys, indexes for company/date/product/batch.
- **Resilience:** Go restart/recovery, timeout, offline frontend behavior, 500/429 errors, rollback on partial DB write, timezone midnight boundary, currency rounding, paginated large lists, load 1,000+ product rows and 10,000+ stock ledger rows in safe environment, no uncontrolled N+1 behavior, accessibility and responsive layout.

## Stage 12 — Execution, evidence and defect policy

Use the companion `ERP_QA_TEST_CASES.csv` **as the minimum test register**, then generate additional tests from discovered screens/controls/API endpoints. For **every** case record: test ID, requirement/module, environment/run ID, setup fixture, actual action sequence, expected result, actual result, status, tester/agent, execution timestamp, screenshot/network/server log reference, read-only database evidence reference, trace ID, defect ID, severity, retest status, comments.

**Pass criteria:** All three must align where applicable: (a) frontend UI/print, (b) Go API state and response, (c) database persistence plus ledger/audit. An apparent green toast alone **never** proves persistence. If a backend API or database verification is inaccessible, case is `BLOCKED`, not `PASS`.

**Severity:**
- `P0 / Blocker`: cross-tenant leak, unlicensed/blocked stock sale, irreparable data loss, critical unauthorized posting, financial postings corrupting integrity, exposed secrets.
- `P1 / Critical`: wrong tax posting, duplicate stock/GL posting, false invoice payment, broken core onboarding, approval bypass, recall trace failure.
- `P2 / Major`: broken partial GRN, discrepancy in report/print, wrong expiry or aging, broken role workflow, significant data mismatch.
- `P3 / Minor`: UI validation/message/layout, recoverable nonfinancial usability bug.
- `P4 / Enhancement`: optional usability or feature suggestion (record separately, not as a defect unless requirement).

Do not close a test as passed if critical security or ledger integrity constraints fail. For an error, capture exact reproduction: **preconditions, fixture IDs (sanitized), steps, expected, actual, evidence links, root-cause hypothesis (not asserted as proven), impact, proposed fix, owner, fix commit if any, retest result.**

## Stage 13 — Final deliverables: generate files after running tests

Write actual results to `qa-results/<run-id>/` (or a suitable project-specific results location):

1. `00_EXecutive_QA_Summary.md` — run ID, build/environment, coverage, case totals, verified PASS/FAIL/BLOCKED/NOT_IMPLEMENTED/NOT_RUN, P0–P4 bug totals, top risks and **release recommendation GO / CONDITIONAL / NO-GO**.
2. `01_Environment_Inventory.md` — discovered architecture, frontend routes, Go endpoints, DB engine/schema/migrations, tenant model, dependencies, unavailable tooling.
3. `02_Company_Onboarding_Trace.md` — company → first user → memberships/permissions → first login → configuration, with record keys anonymized and SQL evidence.
4. `03_Configuration_Checklist.md` — field-by-field records of completed/failed/missing company, tax, COA, product, supplier, customer, warehouse, credit, regulatory, approval settings.
5. `04_Test_Execution.csv` — **one row per real executed case** with status/evidence and exact time; use companion register as source. Distinguish executed from theoretical cases.
6. `05_Bug_Report.csv` and `05_Bug_Report.md` — deduplicated defects ranked by severity, exact reproduction and screenshots/network+DB evidence.
7. `06_Financial_Reconciliation.md` — independently recomputed journal balancing, AR/AP settlement, PO–GRN–bill matching, stock valuation, ledger matching, sales/return/tax figures.
8. `07_Tax_Compliance_Check.md` — confirmed applicable IRD/Gazette requirements, tax classifications, invoice print compliance checks, fixture expected-versus-actual results, findings requiring accountant review.
9. `08_Stock_Batch_Traceability.md` — chronological movements for A/B lots, FEFO, transfer, issue, returns, recall/hold, quarantine, disposal and reconciliation.
10. `09_Security_Audit_Data_Integrity.md` — tenant isolation, RBAC, login/session, history completeness, database constraints, duplicates/orphans and edge-case results.
11. `10_Unimplemented_And_Blocked.md` — separate scope gaps from actual bugs; note unavailable integration vs broken implementation.
12. `11_Retest_Plan.md` — fixed issue evidence, regression scope, unresolved risks and explicit re-execution checklist.
13. `evidence/` — timestamped redacted screenshots, HAR/network captures (sanitized), application/server error extracts, SQL-query result excerpts with limited fields, and report exports.

**Final response after execution:** Give the QA verdict; actual test totals; list all P0/P1 bugs first; what worked; what failed; exact module and workflow; evidence file paths; database integrity statement; tax compliance exceptions; precise next steps. **Do not invent test pass percentages or results if you could not run tests.**

## Agent execution cadence

Proceed sequentially. At the end of **each stage**, report progress in 3–5 lines: stage name, tests executed and status totals, DB evidence captured, blockers/defects, next stage. Continue through remaining stages unless prohibited by safety/environment access or a P0 integrity/security issue that makes further writes unsafe. Never replace the test sequence with only a new UI design, frontend scaffold, or theoretical checklist.

**Start now with Stage 0.** Do not attempt company creation until test DB and staging environment are confirmed. If this repository contains an earlier `finance_implementation_process_plan.md`, inspect it and compare actual finance schema to the prescribed design; report mismatches, but do not treat that document as proof the schema is already deployed.
