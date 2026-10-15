# Pharmaceutical ERP — Test Execution and Defect Report (TEMPLATE ONLY)

> **No execution has occurred by merely generating this template.** Replace placeholders exclusively from measured UI/API/DB evidence. If blocked, state the exact blocker.

## 1. Build/environment

| Field | Value |
|---|---|
| QA run ID | [RUN_ID] |
| Execution start/end UTC | [TIMES] |
| Environment | [STAGING / LOCAL / TEST, NOT PRODUCTION] |
| React/Vite frontend build/commit | [VALUE] |
| Go API build/commit | [VALUE] |
| DB engine/version and migration head | [VALUE] |
| Browser/test runner version | [VALUE] |
| Company fixture ID (sanitized) | [VALUE] |
| Tax rules verified at | [DATE + official links] |
| Evidence root | [PATH] |

## 2. Executive decision

**Release recommendation:** [GO / CONDITIONAL / NO-GO]

**Reason:** [state the major evidence and risks, not assumptions]

| Metric | Actual |
|---|---:|
| Total registered test cases | [261 plus dynamically discovered tests] |
| Executed | [VALUE] |
| PASS | [VALUE] |
| FAIL | [VALUE] |
| BLOCKED | [VALUE] |
| NOT_IMPLEMENTED | [VALUE] |
| NOT_RUN | [VALUE] |
| P0 | [VALUE] |
| P1 | [VALUE] |
| P2 | [VALUE] |
| P3 | [VALUE] |
| P4 | [VALUE] |

**Execution rate:** executed / applicable registered tests (show denominator and exclusions). **Pass rate:** PASS / actually executed PASS+FAIL only; do not inflate with blocked cases.

## 3. Company first-time setup trace

| Checkpoint | Frontend evidence | API evidence | Read-only database evidence | Result |
|---|---|---|---|---|
| Platform admin logged in | | | | |
| New company created exactly once | | | | |
| Company settings persisted | | | | |
| Branch created/scoped correctly | | | | |
| Company admin user created/invited | | | | |
| User-role/permission/membership persisted | | | | |
| New admin invitation and login | | | | |
| Finance COA/tax settings complete | | | | |
| Warehouses/products/supplier/customer complete | | | | |
| Audit records present | | | | |

## 4. Coverage by module

| Module | Registered | PASS | FAIL | BLOCKED | NOT_IMPLEMENTED | NOT_RUN | Top issue IDs |
|---|---:|---:|---:|---:|---:|---:|---|
| ENV | | | | | | | |
| CC | | | | | | | |
| TAX | | | | | | | |
| INV | | | | | | | |
| BILL | | | | | | | |
| FIN | | | | | | | |
| COMP | | | | | | | |
| SEC | | | | | | | |

## 5. Purchase-to-pay reconciliation

| Event | Source doc | Qty/value | Expected ledger | Actual ledger | Difference | Evidence |
|---|---|---|---|---|---|---|
| PO approved | | | None until defined posting | | | |
| GRN lot A received | | 100 units at 120 LKR | Stock +100; GRNI/Inventory if configured | | | |
| GRN lot B received | | 60 units at 120 LKR | Stock +60; no double-post | | | |
| Supplier bill | | | Clear GRNI; recognize AP/tax if applicable | | | |
| Supplier payment | | | Reduce AP/bank | | | |

## 6. Stock reconciliation

| Checkpoint | Lot A | Lot B | Total physical | Quarantine | Available to promise | Evidence |
|---|---:|---:|---:|---:|---:|---|
| After GRNs | 100 | 60 | 160 | [policy] | [policy] | |
| After reserve 25 | 100 | 60 | 160 | | [minus 25] | |
| After transfer 15 of A | 100 across 2 warehouses | 60 | 160 | | | |
| After damage writeoff 3 A | 97 | 60 | 157 | | | |
| After sale/dispatch 25 B | 97 | 35 | 132 | | | |
| After return 5 B to quarantine | 97 | 40 | 137 | +5 | [excludes 5] | |
| After recall B | 97 | 40 | 137 | [B held] | [B excluded] | |

Actual balances must be computed by source documents; any additional cash-order quantities must be added to the reconciliation explicitly. These numbers are a **reference scenario**, not a substitute for reading actual balances.

## 7. Invoice + AR + GL reconciliation

| Document | Net | VAT/exempt | Gross | AR open | Stock issue | Balanced journal | Evidence |
|---|---:|---:|---:|---:|---|---|---|
| Credit invoice | | | | | | | |
| Cash invoice | | | | | | | |
| Partial receipt | | | | | N/A | | |
| Full receipt | | | | 0 | N/A | | |
| Credit note/return | | | | | Returned to quarantine | | |
| Debit note | | | | | N/A | | |

## 8. Tax validation

| Rule | Legal reference and date | Configured rule | Expected | Actual | Status | Reviewer needed |
|---|---|---|---|---|---|---|
| VAT standard 18% | | | 1000 -> 180 VAT | | | |
| Qualifying pharma VAT exemption | | | 1000 -> 0 VAT with reason | | | |
| Discount + VAT rounding | | | 675 + 121.50 = 796.50 | | | |
| VAT tax invoice Oct 2026 template | Gazette 2481/22 amended 2500/106 | | Required fields/number | | | |
| SSCL exempt pharmaceutical turnover | | | Excluded from liable turnover | | | |
| SSCL eligible wholesale example | | | 200000 x 50% x 2.5% = 2500 | | | |
| SSCL distributor eligible base example | | | 200000 x 25% x 2.5% = 1250 | | | |
| Tax invoice/GL/report equality | | | Equal totals | | | |

## 9. Findings by severity

### P0 / Blocker
[Bug ID, title, impact, reproduction, evidence, remediation, retest]

### P1 / Critical
[Bug ID, title, impact, reproduction, evidence, remediation, retest]

### P2 / Major
[...]

### P3 / Minor
[...]

### P4 / Enhancement
[...]

## 10. Security, logs, normalization and data consistency

- Tenant isolation: [pass/fail/evidence]
- Branch/warehouse permissions: [pass/fail/evidence]
- Passwords/tokens/log sanitation: [pass/fail/evidence]
- Immutable posted GL/stock/audit: [pass/fail/evidence]
- Header/detail orphan checks: [counts]
- Duplicate invoice/PO/GRN references: [counts]
- Ledger double posting/idempotency: [counts]
- Per-document debit minus credit: [counts of unbalanced]
- Product-batch FEFO/expiry/recall: [pass/fail/evidence]
- Report/print/API/DB cross-check: [pass/fail/evidence]

## 11. Unimplemented / blocked / legal review

| Item | Reason | Missing prerequisite | Owner | Risk | Next action |
|---|---|---|---|---|---|

## 12. Release gate checklist

- [ ] No unresolved P0
- [ ] No unresolved P1 impacting stock, taxes, finance, tenancy or legal invoicing
- [ ] Created company/user persisted with traceable relationship
- [ ] Company admin login isolated from platform admin
- [ ] PO → GRN → stock → invoice → receipt → GL proven with actual database evidence
- [ ] Batch expiry, hold, recall, quarantine and disposal blocks proven
- [ ] All applicable posted journals balanced
- [ ] Tax classification and invoicing reviewed against current IRD rules by designated reviewer
- [ ] All failures assigned and scheduled for retest
- [ ] Evidence collected and secrets redacted

**Reviewer/approval:** [QA Lead] / [Finance Owner] / [Compliance Owner] / [Engineering Owner]

**Final decision:** [GO / CONDITIONAL / NO-GO] with dated sign-off.
