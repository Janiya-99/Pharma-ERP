# Pharmacy Distribution ERP — Project Discovery Report

**Generated:** 2026-10-15  
**Source of Truth:** Verified source code inspection  
**Classification:** Internal Technical Document

---

## 1. Identified Technology Stack

### Backend
| Component | Technology | Version |
|---|---|---|
| Language | Go | 1.25.0 |
| Web Framework | Gin | v1.12.0 |
| ORM | GORM | v1.31.1 |
| Database Driver | MySQL (`gorm.io/driver/mysql`) | v1.6.0 |
| Authentication | JWT (`golang-jwt/jwt`) | v5.3.1 |
| Caching | Redis (`redis/go-redis`) | v9.22.0 |
| Logging | Zap (`uber/zap`) | v1.28.0 |
| Validation | go-playground/validator | v10.30.3 |
| Decimal | shopspring/decimal | v1.4.0 |
| Module ID | `github.com/pixandco/erp-phrma` | — |

### Frontend
| Component | Technology | Version |
|---|---|---|
| Framework | React | 19.0.0 |
| Build Tool | Vite | ^8.0.16 |
| Language | TypeScript | ^7.0.1-rc |
| Styling | Tailwind CSS | ^3.1.8 |
| UI Primitives | Radix UI + shadcn | Latest |
| Data Fetching | TanStack Query | v5 |
| Tables | TanStack Table | v8 |
| Forms | React Hook Form + Zod | v7 + v3 |
| HTTP Client | Axios | v1 |
| State Management | Zustand | v5 |
| Charts | ApexCharts, Recharts, Tremor | — |
| Animations | Framer Motion, dnd-kit | v12 |
| Routing | React Router DOM | v6 |
| Fonts | Inter, Geist Variable | — |

### Infrastructure
| Component | Technology |
|---|---|
| Database | MySQL (dedicated DB per company) |
| Cache | Redis |
| Containerisation | Docker + Docker Compose |
| Frontend Web Server | Nginx |

---

## 2. Multi-Tenancy & Architecture

The system uses **database-per-company** multi-tenancy:
- Platform database (`erp_platform`) stores company registrations
- Each company gets its own MySQL database named from `company_code`
- JWT claims embed `company_id`, `company_code`, `active_branch_id`, and `active_software_code`
- `CompanyAuthMiddleware` validates the JWT and resolves the company database connection on every request
- All company tables also have `company_id` columns for belt-and-suspenders isolation

**Request pipeline:**
```
Browser → React SPA → Axios
  → Gin API (port 8080)
    → CORS → CompanyAuthMiddleware → BranchAccessMiddleware
    → SoftwareAccessMiddleware → RequirePermission
    → Handler → Service → Repository → MySQL (company DB) + Redis
    → Zap structured logging
```

---

## 3. Module Implementation Status

| Module | Backend | Frontend | Notes |
|---|---|---|---|
| **Control Center** | ✅ IMPLEMENTED | ✅ IMPLEMENTED | Full CRUD: company, branches, departments, designations, users, roles, permissions, access matrix, audit logs, login logs, approval workflows, document numbering, security settings |
| **Finance** | ✅ IMPLEMENTED | ✅ IMPLEMENTED | Financial years, CoA, journal entries, payment/receipt vouchers, bank accounts, cheque books, bank transactions, reconciliations, petty cash, fixed assets, general ledger, reports |
| **Inventory** | ✅ IMPLEMENTED | ✅ IMPLEMENTED | Warehouses, product master, products, batches, stock balances/ledger, opening stock, GRNs, transfers, adjustments, purchase/sales returns |
| **Invoice Center** | ✅ IMPLEMENTED | ✅ IMPLEMENTED | Customers, sales orders, sales invoices, credit notes, debit notes, customer receipts, finance settings, posting integration, print formats, reports |
| **Compliance Center** | ❌ NOT IMPLEMENTED | ✅ FRONTEND ONLY | Licenses, batch recall, batch hold, expiry disposal, regulatory — pages exist but no backend API |
| **Platform Admin** | ✅ IMPLEMENTED | N/A | Company provisioning |

---

## 4. Database Tables Summary (80+ tables verified)

### Control Center / Company Core
`companies`, `branches`, `departments`, `designations`, `designation_default_roles`, `designation_departments`, `users`, `roles`, `permissions`, `role_permissions`, `user_branch_access`, `user_branch_roles`, `user_software_access`, `user_organization_assignments`, `software_modules`, `audit_logs`, `login_logs`, `password_reset_tokens`, `system_settings`, `approval_workflows`, `approval_workflow_versions`, `approval_workflow_stages`, `document_numbering_rules`, `document_number_sequences`, `security_policies`, `trusted_ip_rules`, `backup_policies`, `notification_rules`

### Finance (37 tables)
`financial_years`, `accounting_periods`, `account_classifications`, `account_groups`, `chart_of_accounts`, `opening_balances`, `tax_settings`, `journal_entries`, `journal_entry_lines`, `journal_entry_approvals`, `journal_entry_reversals`, `payment_vouchers`, `payment_voucher_lines`, `payment_voucher_approvals`, `receipt_vouchers`, `receipt_voucher_lines`, `receipt_voucher_approvals`, `bank_accounts`, `cash_accounts`, `cheque_books`, `cheque_leaves`, `bank_transactions`, `bank_reconciliations`, `bank_reconciliation_lines`, `petty_cash_funds`, `petty_cash_vouchers`, `petty_cash_voucher_lines`, `petty_cash_voucher_approvals`, `petty_cash_replenishments`, `petty_cash_replenishment_approvals`, `fixed_asset_categories`, `fixed_assets`, `fixed_asset_depreciation_runs`, `fixed_asset_depreciation_lines`, `fixed_asset_disposals`, `fixed_asset_disposal_approvals`, `general_ledger_entries`

### Inventory (31 tables)
`warehouses`, `warehouse_locations`, `product_categories`, `product_units`, `dosage_forms`, `generic_names`, `manufacturers`, `suppliers`, `products`, `product_barcodes`, `product_batches`, `stock_balances`, `stock_ledger_entries`, `opening_stock_entries`, `opening_stock_entry_lines`, `opening_stock_entry_approvals`, `goods_receipt_notes`, `goods_receipt_note_lines`, `goods_receipt_note_approvals`, `stock_transfers`, `stock_transfer_lines`, `stock_transfer_approvals`, `stock_adjustments`, `stock_adjustment_lines`, `stock_adjustment_approvals`, `purchase_returns`, `purchase_return_lines`, `purchase_return_approvals`, `sales_returns`, `sales_return_lines`, `sales_return_approvals`

### Invoice Center (22 tables)
`customer_categories`, `customers`, `customer_addresses`, `customer_contacts`, `sales_orders`, `sales_order_lines`, `sales_order_approvals`, `sales_invoices`, `sales_invoice_lines`, `sales_invoice_approvals`, `credit_notes`, `credit_note_lines`, `credit_note_approvals`, `debit_notes`, `debit_note_lines`, `debit_note_approvals`, `customer_receipts`, `customer_receipt_lines`, `customer_receipt_approvals`, `invoice_center_finance_settings`, `invoice_center_finance_postings`, `invoice_print_formats`

---

## 5. Document Lifecycle Pattern

All transactional documents follow a consistent two-track lifecycle:

**Approval Track:** `draft → submitted → approved / rejected`  
**Posting Track:** `unposted → posted`

Posting requires prior approval and irreversibly commits changes to the general ledger and/or stock ledger.

---

## 6. Permission System

Permissions follow the pattern `module.resource.action` (e.g., `finance.journal.approve`, `inventory.grn.post`).

Middleware checks permissions on every protected route:
- `RequirePermission("finance.journal.approve")` — checks user's role-based permissions
- Branch access is also enforced via `BranchAccessMiddleware`
- Software module access is enforced via `SoftwareAccessMiddleware`

---

## 7. Known Gaps & Technical Risks

| Item | Severity | Details |
|---|---|---|
| Compliance Center backend missing | HIGH | 6 frontend routes have no API |
| No Purchase Order entity | MEDIUM | GRNs reference PO by free text only |
| Customer balance denormalisation | MEDIUM | `customers.current_balance` must stay in sync with postings |
| GL running balance | MEDIUM | Denormalised field; rebuild endpoint exists |
| No supplier bill/AP table | LOW | Payments handled through payment vouchers |
| 2FA model exists, logic unverified | LOW | `two_factor_enabled` flag in user model |
| No inventory valuation report | LOW | No API endpoint found |
| No VAT/SSCL tax-specific report | LOW | No tax report endpoint found |
