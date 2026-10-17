# Pharmacy Distribution ERP — Database Schema Reference

**Version:** 1.0 | **Generated:** 2026-10-15

---

## Overview

- **Platform DB:** `erp_platform` — company registration records
- **Company DB:** `erp_<company_code>` — all ERP data for that company
- All monetary values: `DECIMAL(18,2)` 
- All quantities: `DECIMAL(18,3)`
- Soft delete: `deleted_at DATETIME NULL` (GORM soft delete) on all major tables
- All primary keys: `BIGINT UNSIGNED AUTO_INCREMENT`

---

## Control Center / Company Core Tables

### `companies`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_code | varchar(50) | UNIQUE |
| company_name | varchar(150) | NOT NULL |
| registration_number | varchar(100) | |
| tax_number | varchar(100) | |
| address | text | |
| phone | varchar(50) | |
| email | varchar(150) | |
| website | varchar(150) | |
| logo_url | text | |
| status | varchar(30) | default: active |
| created_at / updated_at / deleted_at | | |

### `branches`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_id | bigint unsigned | FK → companies.id |
| branch_code | varchar(50) | UNIQUE per company |
| branch_name | varchar(150) | |
| branch_type | varchar(50) | |
| address / phone / email | | |
| is_main_branch | boolean | default: false |
| status | varchar(30) | default: active |

### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_id | bigint unsigned | FK |
| employee_code | varchar(50) | UNIQUE per company |
| name | varchar(150) | NOT NULL |
| email | varchar(150) | UNIQUE |
| password_hash | varchar(255) | bcrypt |
| phone | varchar(50) | |
| department_id | bigint unsigned | FK (nullable) |
| designation_id | bigint unsigned | FK (nullable) |
| default_branch_id | bigint unsigned | FK (nullable) |
| user_type | varchar(50) | default: company_user |
| login_enabled | boolean | |
| two_factor_enabled | boolean | |
| force_password_change | boolean | |
| last_login_at | datetime | |
| login_count | int | |
| status | varchar(30) | default: active |

### `roles` / `permissions` / `role_permissions`
Standard RBAC tables. Permissions use format `module.resource.action`.

### `approval_workflows`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_id | bigint unsigned | |
| module | varchar(50) | Finance, Inventory, Invoice Center |
| document_type | varchar(50) | journal_entry, grn, sales_invoice, etc. |
| branch_scope | varchar(30) | all_branches / selected_branches |
| status | varchar(20) | draft / published / archived |
| version_number | int | |
| stages | HasMany | → approval_workflow_stages |

### `document_numbering_rules`
| Column | Type | Notes |
|---|---|---|
| module | varchar(50) | Finance, Inventory, etc. |
| document_type | varchar(50) | journal_entry, grn, sales_invoice, etc. |
| prefix | varchar(30) | e.g. "GRN-" |
| suffix | varchar(30) | optional |
| padding | int | default: 6 (zero-padded) |
| reset_frequency | varchar(30) | never / monthly / yearly / financial_year |
| status | varchar(20) | draft / published / archived |

### `security_policies`
| Column | Type | Notes |
|---|---|---|
| min_password_length | int | default: 8 |
| require_uppercase/lowercase/number/special_char | boolean | |
| password_expiry_days | int | 0 = never |
| max_failed_login_attempts | int | default: 5 |
| lockout_duration_minutes | int | default: 30 |
| session_idle_timeout_minutes | int | default: 60 |
| max_concurrent_sessions | int | default: 3 |
| require_mfa | boolean | |
| mfa_policy | varchar(30) | optional / required_all |

---

## Finance Tables

### `financial_years`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_id | bigint unsigned | |
| year_name | varchar(100) | e.g. "FY 2025/2026" |
| start_date / end_date | date | |
| status | varchar(30) | open / closed |

### `chart_of_accounts`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_id | bigint unsigned | |
| account_code | varchar(50) | UNIQUE per company |
| account_name | varchar(150) | |
| account_classification_id | bigint unsigned | FK |
| parent_account_id | bigint unsigned | FK (self-ref, nullable) |
| account_level | int | hierarchy depth |
| account_type | varchar(50) | |
| normal_balance | varchar(20) | debit / credit |
| is_control_account | boolean | |
| is_bank_account | boolean | |
| is_cash_account | boolean | |
| opening_balance | decimal(18,2) | |
| current_balance | decimal(18,2) | denormalised |

### `journal_entries`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned | PK |
| company_id | bigint unsigned | |
| branch_id | bigint unsigned | |
| financial_year_id | bigint unsigned | FK |
| accounting_period_id | bigint unsigned | FK |
| journal_number | varchar(50) | UNIQUE per company |
| journal_date | date | |
| reference_number | varchar(100) | |
| description | text | |
| total_debit / total_credit | decimal(18,2) | must balance |
| approval_status | varchar(30) | draft/submitted/approved/rejected |
| posted_status | varchar(30) | unposted/posted |
| is_reversed | boolean | |
| reversed_journal_id | bigint unsigned | FK (nullable) |
| lines | HasMany | → journal_entry_lines |

### `journal_entry_lines`
| Column | Type | Notes |
|---|---|---|
| account_id | bigint unsigned | FK → chart_of_accounts |
| description | text | |
| debit_amount / credit_amount | decimal(18,2) | |

### `payment_vouchers` / `receipt_vouchers`
| Column | Type | Notes |
|---|---|---|
| voucher_number | varchar(50) | UNIQUE per company |
| payment_date | date | |
| payment_type | varchar(50) | supplier / other |
| payment_method | varchar(50) | cash / cheque / bank_transfer |
| supplier_id / customer_id | bigint unsigned | optional FK |
| paid_from_account_id | bigint unsigned | FK → chart_of_accounts |
| cheque_number / cheque_date | | optional |
| total_amount | decimal(18,2) | |
| approval_status / posted_status | varchar(30) | |

### `tax_settings`
| Column | Type | Notes |
|---|---|---|
| tax_code | varchar(50) | e.g. "VAT_15", "SSCL_2.5" |
| tax_name | varchar(150) | |
| tax_rate | decimal(8,4) | percentage |
| tax_account_id | bigint unsigned | FK → chart_of_accounts |

### `general_ledger_entries`
| Column | Type | Notes |
|---|---|---|
| source_type | varchar(80) | "journal_entry", "sales_invoice", "grn", etc. |
| source_id | bigint unsigned | FK to source document |
| source_number | varchar(100) | human-readable reference |
| account_id / account_code / account_name | | denormalised |
| debit_amount / credit_amount | decimal(18,2) | |
| running_balance | decimal(18,2) | denormalised, per account |
| normal_balance | varchar(20) | debit/credit |

---

## Inventory Tables

### `products`
| Column | Type | Notes |
|---|---|---|
| product_code | varchar(50) | UNIQUE per company |
| product_name | varchar(200) | |
| product_category_id | bigint unsigned | FK (nullable) |
| generic_name_id | bigint unsigned | FK (nullable) |
| dosage_form_id | bigint unsigned | FK (nullable) |
| manufacturer_id | bigint unsigned | FK (nullable) |
| base_unit_id | bigint unsigned | FK → product_units |
| strength | varchar(100) | e.g. "500mg" |
| pack_size | varchar(100) | e.g. "10 tablets/strip" |
| product_type | varchar(50) | default: medicine |
| requires_batch_tracking | boolean | default: true |
| requires_expiry_tracking | boolean | default: true |
| storage_condition | varchar(50) | normal/refrigerated/frozen |
| reorder_level / reorder_quantity | decimal(18,2) | |
| nmra_registration_number | varchar(100) | Pharmaceutical regulatory |
| nmra_expiry_date | date | |
| purchase/sales/inventory/cogs account IDs | bigint unsigned | FK to CoA |

### `product_batches`
| Column | Type | Notes |
|---|---|---|
| product_id | bigint unsigned | FK |
| batch_number | varchar(100) | UNIQUE per product per company |
| manufacture_date / expiry_date | date | nullable |
| supplier_id / manufacturer_id | bigint unsigned | FK (nullable) |
| purchase_rate / selling_price / mrp | decimal(18,2) | |
| batch_status | varchar(30) | active/expired/recalled/blocked |
| is_blocked | boolean | |
| block_reason | text | |

### `goods_receipt_notes`
| Column | Type | Notes |
|---|---|---|
| grn_number | varchar(50) | UNIQUE per company |
| grn_date | date | |
| supplier_id / warehouse_id / branch_id | bigint unsigned | FK |
| supplier_invoice_number / date | varchar(100) | |
| purchase_order_number | varchar(100) | free text, no FK |
| total_quantity / total_free_quantity / total_stock_quantity | decimal(18,3) | |
| subtotal / discount / tax / total amount | decimal(18,2) | |
| approval_status / posted_status | varchar(30) | |

### `stock_ledger_entries`
| Column | Type | Notes |
|---|---|---|
| warehouse_id / warehouse_location_id | bigint unsigned | FK |
| product_id / product_batch_id | bigint unsigned | FK |
| transaction_date | datetime | |
| source_module / source_type / source_id / source_number | | audit trail |
| movement_type | varchar(30) | in/out/transfer/adjustment |
| quantity_in / quantity_out / balance_quantity | decimal(18,3) | |
| unit_cost / total_cost | decimal(18,2) | |

### `stock_balances`
| Column | Type | Notes |
|---|---|---|
| warehouse_id / warehouse_location_id | bigint unsigned | FK |
| product_id / product_batch_id | bigint unsigned | FK |
| available_quantity / reserved_quantity / total_quantity | decimal(18,3) | |

---

## Invoice Center Tables

### `customers`
| Column | Type | Notes |
|---|---|---|
| customer_code | varchar(50) | UNIQUE per company |
| customer_name | varchar(255) | |
| customer_type | varchar(50) | default: pharmacy |
| business_registration_number | varchar(100) | |
| tax_registration_number | varchar(100) | |
| primary_contact_person / number / email | | |
| billing_address / shipping_address | text | |
| credit_limit | decimal(18,2) | |
| credit_days | int | |
| receivable_account_id | bigint unsigned | FK → chart_of_accounts |
| current_balance | decimal(18,2) | denormalised |

### `sales_invoices`
| Column | Type | Notes |
|---|---|---|
| invoice_number | varchar(50) | UNIQUE per company |
| invoice_date / due_date | date | |
| customer_id / warehouse_id / branch_id | bigint unsigned | FK |
| sales_order_id | bigint unsigned | FK (nullable) |
| financial_year_id / accounting_period_id | bigint unsigned | FK (nullable) |
| subtotal / discount / tax / total amount | decimal(18,2) | |
| paid_amount / balance_amount | decimal(18,2) | |
| payment_status | varchar(30) | unpaid/partial/paid |
| approval_status / posted_status | varchar(30) | |
| finance_post_status | varchar(30) | unposted/posted |
| finance_reference_number | varchar(100) | |

### `customer_receipts`
| Column | Type | Notes |
|---|---|---|
| receipt_number | varchar(50) | UNIQUE per company |
| receipt_date | date | |
| customer_id | bigint unsigned | FK |
| payment_method | varchar(50) | cash/cheque/bank_transfer |
| total_amount / unallocated_amount | decimal(18,2) | |
| allocations | HasMany | → customer_receipt_allocations (invoice-level allocation) |

### `invoice_print_formats`
| Column | Type | Notes |
|---|---|---|
| format_name | varchar(150) | |
| is_default | boolean | |
| paper_size | varchar(20) | A4/Letter |
| header/footer/body configuration | JSON fields | |
| company logo, address display options | boolean fields | |
