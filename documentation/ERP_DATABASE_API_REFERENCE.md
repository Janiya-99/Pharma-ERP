# Pharmacy Distribution ERP — Database Schema & REST API Reference

**Document Code:** `DOC-REF-2026-V1`  
**Target Audience:** Backend Developers, DevOps Engineers, Database Administrators, System Integrators  
**Version:** 1.0.0 | **Publication Date:** 2026-10-15  
**Backend Framework:** Go 1.23 Gin REST API | **ORM:** GORM | **Database:** MySQL 8.0 Enterprise

---

## 1. Database Architecture & Schema Reference

The ERP utilizes a multi-tenant schema isolation architecture. The platform database (`erp_platform`) manages tenant lifecycle and subscription tiers, while operational tenant databases (`erp_phrma`) maintain company-scoped business entities with strict foreign key constraints.

![Figure 4: ER Diagram](diagrams/04_database_multi_tenancy_er.svg)

### 1.1 Platform Master Database Tables (`erp_platform`)

#### `tenant_companies`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PK` | Unique company identifier |
| `code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Alphanumeric company code (e.g. `QA20261015`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Registered enterprise legal name |
| `legal_registration_no` | `VARCHAR(100)` | `NOT NULL` | Business registration number |
| `db_name` | `VARCHAR(100)` | `NOT NULL` | Target tenant database schema name |
| `status` | `VARCHAR(30)` | `NOT NULL, DEFAULT 'active'` | State: `active`, `suspended`, `pending` |
| `subscription_plan` | `VARCHAR(50)` | `NOT NULL` | Plan: `STANDARD`, `ENTERPRISE` |
| `created_at` | `DATETIME` | `NOT NULL` | Timestamp of provisioning |
| `updated_at` | `DATETIME` | `NOT NULL` | Timestamp of last modification |

#### `platform_admin_users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PK` | Platform administrator ID |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Administrative login email |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Salted bcrypt password hash |
| `role` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'SUPERADMIN'` | Privilege level |
| `status` | `VARCHAR(30)` | `NOT NULL, DEFAULT 'active'` | Status: `active`, `inactive` |

---

### 1.2 Tenant Database Tables (`erp_phrma`)

#### `companies` & `branches`
* `companies`: Stores company settings, base currency (`LKR`), timezone, logo URL.
* `branches`:
  * `id` (`BIGINT UNSIGNED PK`)
  * `company_id` (`BIGINT UNSIGNED NOT NULL, FK -> companies.id`)
  * `code` (`VARCHAR(50) NOT NULL`), `name` (`VARCHAR(255) NOT NULL`)
  * `is_hq` (`BOOLEAN NOT NULL DEFAULT FALSE`)
  * `status` (`VARCHAR(30) NOT NULL DEFAULT 'active'`)

#### `users`, `roles`, & `permissions`
* `users`: `id`, `company_id`, `branch_id`, `username`, `email`, `password_hash`, `is_active`, `department_id`, `designation_id`.
* `roles`: `id`, `company_id`, `name`, `code`, `description`.
* `permissions`: `id`, `name`, `slug` (e.g. `finance:journal:post`, `inventory:grn:approve`).
* `role_permissions`: Composite PK `(role_id, permission_id)`.
* `user_branch_access`: Composite PK `(user_id, branch_id)`.
* `user_software_access`: Composite PK `(user_id, module_id)`.

#### `chart_of_accounts`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PK` | Account identifier |
| `company_id` | `BIGINT UNSIGNED` | `NOT NULL, FK` | Scoped tenant ID |
| `code` | `VARCHAR(50)` | `NOT NULL` | Account code (e.g. `1010`, `1100`, `4000`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Account title |
| `parent_id` | `BIGINT UNSIGNED` | `NULL, FK -> chart_of_accounts.id` | Tree hierarchy parent account |
| `account_type` | `VARCHAR(50)` | `NOT NULL` | `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE` |
| `is_reconciled` | `BOOLEAN` | `DEFAULT FALSE` | Reconciliation flag |
| `current_balance` | `DECIMAL(18,4)` | `NOT NULL, DEFAULT 0.0000` | Real-time computed balance |

#### `journal_entries` & `journal_entry_lines`
* `journal_entries`: `id`, `company_id`, `branch_id`, `financial_year_id`, `voucher_no`, `posting_date`, `total_debit`, `total_credit`, `status` (`DRAFT`, `POSTED`, `CANCELLED`).
* `journal_entry_lines`: `id`, `journal_entry_id`, `account_id`, `debit_amount`, `credit_amount`, `description`.
* **Database Constraint:** Check constraint / Application trigger verifying $\text{total\_debit} == \text{total\_credit}$.

#### `products` & `product_batches`
* `products`: `id`, `company_id`, `sku`, `generic_name`, `brand_name`, `dosage_form_id`, `category_id`, `base_unit_id`, `min_shelf_life_days`, `is_taxable`.
* `product_batches`:
  | Column | Type | Constraints | Description |
  |---|---|---|---|
  | `id` | `BIGINT UNSIGNED` | `AUTO_INCREMENT, PK` | Unique batch ID |
  | `company_id` | `BIGINT UNSIGNED` | `NOT NULL, FK` | Scoped tenant ID |
  | `product_id` | `BIGINT UNSIGNED` | `NOT NULL, FK` | Foreign key to products |
  | `batch_no` | `VARCHAR(100)` | `NOT NULL` | Physical lot/batch string |
  | `mfg_date` | `DATE` | `NOT NULL` | Date of manufacture |
  | `expiry_date` | `DATE` | `NOT NULL, INDEX` | Expiry date (FEFO sort key) |
  | `buy_price` | `DECIMAL(18,4)` | `NOT NULL` | Purchase cost per unit |
  | `mrp` | `DECIMAL(18,4)` | `NOT NULL` | Maximum retail price |
  | `stock_quantity` | `DECIMAL(18,4)` | `NOT NULL, DEFAULT 0` | Current physical stock |
  | `status` | `VARCHAR(30)` | `NOT NULL, DEFAULT 'ACTIVE'` | Status: `ACTIVE`, `HOLD`, `EXPIRED` |

#### `sales_invoices` & `sales_invoice_items`
* `sales_invoices`: `id`, `company_id`, `branch_id`, `customer_id`, `invoice_number`, `invoice_date`, `subtotal`, `sscl_amount`, `vat_amount`, `grand_total`, `paid_amount`, `status` (`DRAFT`, `POSTED`, `PAID`, `CANCELLED`).
* `sales_invoice_items`: `id`, `sales_invoice_id`, `product_id`, `batch_id`, `quantity`, `unit_price`, `subtotal`, `tax_amount`, `total_amount`.

---

## 2. Complete REST API Endpoint Reference

All endpoints expect JSON request payloads and return standard envelope responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

![Figure 3: Request Pipeline](diagrams/03_backend_request_pipeline.svg)

### 2.1 Authentication & Platform Administration APIs

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | *Public* | Authenticates company user, returns JWT and user profile |
| `POST` | `/api/v1/auth/logout` | *Authenticated* | Invalidates JWT and places token JTI in Redis blacklist |
| `POST` | `/api/v1/platform-admin/login` | *Public* | Authenticates global platform administrator |
| `GET` | `/api/v1/platform-admin/companies` | *Platform Admin* | Lists all registered tenant companies |
| `POST` | `/api/v1/platform-admin/companies` | *Platform Admin* | Provisions a new tenant company database and admin user |

### 2.2 Control Center APIs

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/control/company` | `control:company:read` | Returns active company profile and settings |
| `PUT` | `/api/v1/control/company` | `control:company:write` | Updates active company profile |
| `GET` | `/api/v1/control/branches` | `control:branch:read` | Lists branches belonging strictly to current tenant |
| `POST` | `/api/v1/control/branches` | `control:branch:write` | Creates new organizational branch |
| `GET` | `/api/v1/control/users` | `control:user:read` | Lists tenant users with branch and role assignments |
| `POST` | `/api/v1/control/users` | `control:user:manage` | Creates a new tenant user via the wizard |
| `GET` | `/api/v1/control/roles` | `control:role:read` | Lists enterprise roles |
| `GET` | `/api/v1/control/roles/:id/permissions` | `control:role:read` | Gets permission matrix for specified role |
| `PUT` | `/api/v1/control/roles/:id/permissions` | `control:role:write` | Updates role permission assignments |
| `GET` | `/api/v1/control/access-audit` | `control:audit:view` | Retrieves system security access audit logs |

### 2.3 Finance APIs

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/finance/chart-of-accounts` | `finance:coa:view` | Returns hierarchical chart of accounts tree |
| `POST` | `/api/v1/finance/chart-of-accounts` | `finance:coa:edit` | Creates a new general ledger account |
| `GET` | `/api/v1/finance/journal-entries` | `finance:journal:view` | Lists journal entry vouchers |
| `POST` | `/api/v1/finance/journal-entries` | `finance:journal:create` | Creates a draft journal entry |
| `POST` | `/api/v1/finance/journal-entries/:id/post` | `finance:journal:post` | Verifies balance invariant and posts to general ledger |
| `GET` | `/api/v1/finance/tax-settings` | `finance:tax:view` | Lists configured VAT and SSCL tax rules |
| `POST` | `/api/v1/finance/tax-settings` | `finance:tax:manage` | Configures tax rates, compounds, and liability accounts |

### 2.4 Inventory & Batch APIs

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/inventory/products` | `inventory:product:read` | Lists catalog products with dosage forms and categories |
| `POST` | `/api/v1/inventory/products` | `inventory:product:create` | Adds new pharmaceutical SKU |
| `GET` | `/api/v1/inventory/product-batches` | `inventory:batch:read` | Lists batches with expiry dates and stock balances |
| `GET` | `/api/v1/inventory/product-batches/fefo` | `inventory:batch:read` | Returns batches sorted strictly in FEFO priority order |
| `POST` | `/api/v1/inventory/product-batches/:id/quarantine` | `compliance:batch:quarantine` | Quarantines batch, switching status to `HOLD` |
| `GET` | `/api/v1/inventory/grns` | `inventory:grn:view` | Lists Goods Receipt Notes |
| `POST` | `/api/v1/inventory/grns` | `inventory:grn:create` | Creates draft GRN with batch and expiry details |
| `POST` | `/api/v1/inventory/grns/:id/approve` | `inventory:grn:approve` | Approves GRN, increments stock, writes stock ledger |
| `GET` | `/api/v1/inventory/stock-ledger` | `inventory:ledger:view` | Queries append-only stock movement audit ledger |

### 2.5 Invoice Center APIs

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/invoice-center/customers` | `invoice:customer:read` | Lists customers with credit limits and balances |
| `POST` | `/api/v1/invoice-center/customers` | `invoice:customer:create` | Creates customer record |
| `GET` | `/api/v1/invoice-center/sales-orders` | `invoice:order:read` | Lists sales orders |
| `POST` | `/api/v1/invoice-center/sales-orders` | `invoice:order:create` | Creates draft sales order |
| `POST` | `/api/v1/invoice-center/sales-orders/:id/approve` | `invoice:order:approve` | Validates credit limit and reserves FEFO batch stock |
| `GET` | `/api/v1/invoice-center/sales-invoices` | `invoice:bill:read` | Lists sales invoices |
| `POST` | `/api/v1/invoice-center/sales-invoices` | `invoice:bill:create` | Creates draft sales invoice |
| `POST` | `/api/v1/invoice-center/sales-invoices/:id/post` | `invoice:bill:issue` | Deducts inventory, posts balanced GL journals, finalizes invoice |
| `GET` | `/api/v1/invoice-center/customer-receipts` | `invoice:receipt:read` | Lists customer receipt payments |
| `POST` | `/api/v1/invoice-center/customer-receipts` | `invoice:receipt:collect` | Records customer payment and settles invoice balance |

### 2.6 Compliance Center APIs

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/compliance-center/recalls` | `compliance:recall:view` | Lists statutory product batch recalls |
| `POST` | `/api/v1/compliance-center/recalls` | `compliance:recall:create` | Initiates formal Class I / Class II recall |
| `GET` | `/api/v1/compliance-center/recalls/:batch_id/trace` | `compliance:recall:view` | Generates customer recall audit trace list |
| `POST` | `/api/v1/compliance-center/disposals` | `compliance:disposal:manage` | Records drug destruction certificate and GL write-off |
