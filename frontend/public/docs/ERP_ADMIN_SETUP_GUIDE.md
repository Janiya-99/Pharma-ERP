# Pharmacy Distribution ERP — Administrator Setup & Configuration Guide

**Document Code:** `DOC-ADM-2026-V1`  
**Target Audience:** Platform Administrators, Company Super Administrators, IT Implementation Teams  
**Version:** 1.0.0 | **Publication Date:** 2026-10-15  
**Verified Platform Environment:** Bluehost VPS (`50.6.230.198`), Go 1.23, React 19, MySQL 8.0, Redis 7

---

## 1. Introduction & Overview

This guide provides definitive, step-by-step instructions for deploying, provisioning, and administering the **Pharmacy Distribution ERP**. It covers the dual administrative roles:
1. **Platform Administrator:** Responsible for global tenant provisioning, database isolation, subscription plan management, and global infrastructure health.
2. **Company Super Administrator:** Responsible for organizational configuration, branch hierarchy, chart of accounts setup, fiscal year definition, Sri Lankan tax settings, user onboarding, and role-permission matrices.

![Figure 1: Overall System Architecture](diagrams/01_overall_system_architecture.svg)

---

## 2. Infrastructure Prerequisites & Environment Setup

### 2.1 Hardware and Runtime Requirements

| Component | Minimum Specification | Recommended Production Specification |
|---|---|---|
| **Host Operating System** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS Dedicated VPS |
| **CPU / Processor** | 4 Cores (x86_64) | 8 Cores (AMD EPYC / Intel Xeon) |
| **RAM Memory** | 8 GB ECC RAM | 16 GB - 32 GB ECC RAM |
| **Storage** | 80 GB SSD | 250 GB NVMe Storage (RAID 1/10) |
| **Go Runtime** | Go 1.23+ | Go 1.25.0 |
| **Node.js** | Node.js v20 LTS | Node.js v22 LTS |
| **Database Engine** | MySQL 8.0 Community | MySQL 8.0 Enterprise / Percona Server |
| **Cache Broker** | Redis 7.0 Alpine | Redis 7.2 Alpine with AOF persistence |
| **Reverse Proxy** | Nginx 1.24+ with SSL (Certbot) | Nginx 1.26+ with HTTP/2 & Gzip |

### 2.2 Environment Variables Configuration

#### Backend `.env` (`backend/.env`)
```bash
# Server Configuration
SERVER_PORT=8080
GIN_MODE=release
LOG_LEVEL=info

# Platform Master Database
PLATFORM_DB_HOST=127.0.0.1
PLATFORM_DB_PORT=3306
PLATFORM_DB_USER=erp_master_user
PLATFORM_DB_PASSWORD=SecureMasterPassword_2026!
PLATFORM_DB_NAME=erp_platform

# Default Tenant Database Connection
TENANT_DB_HOST=127.0.0.1
TENANT_DB_PORT=3306
TENANT_DB_USER=erp_tenant_user
TENANT_DB_PASSWORD=SecureTenantPassword_2026!
TENANT_DB_NAME=erp_phrma

# Redis Cache & Session Broker
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=SecureRedisSecret_2026!
REDIS_DB=0

# Security Secrets (Must be distinct 64-char strings)
PLATFORM_JWT_SECRET=c8f18b348d214e5a96d11e89cf7a9b0c4d2e1f3a5b7c9e0d2f4a6b8c0e2d4f6a
JWT_SECRET=f3a5b7c9e0d2f4a6b8c0e2d4f6ac8f18b348d214e5a96d11e89cf7a9b0c4d2e1
JWT_EXPIRATION_HOURS=24
```

#### Frontend `.env` (`frontend/.env`)
```bash
VITE_API_BASE_URL=https://erp.pixandco.lk/api/v1
VITE_APP_NAME="Pharmaceutical Distribution ERP"
VITE_DEFAULT_LOCALE=en-LK
VITE_BASE_CURRENCY=LKR
```

---

## 3. Platform Administration: Onboarding a New Company

Platform administrators operate via the **Platform Portal** at `https://erp.pixandco.lk/platform-admin`.

![Platform Admin Portal](screenshots/01_platform_admin_portal.svg)

### 3.1 Step-by-Step Tenant Provisioning

1. Authenticate with platform credentials via `POST /api/v1/platform-admin/login`:
   ```bash
   curl -X POST https://erp.pixandco.lk/api/v1/platform-admin/login      -H "Content-Type: application/json"      -d '{
       "email": "superadmin@platform.pixandco.lk",
       "password": "MasterAdminPassword2026!"
     }'
   ```
2. Invoke Tenant Creation endpoint `POST /api/v1/platform-admin/companies`:
   ```json
   {
     "company_code": "QA20261015",
     "company_name": "QA Pharma Distribution (Pvt) Ltd",
     "legal_registration_no": "PV-1029384",
     "contact_email": "admin@qa20261015.lk",
     "contact_phone": "+94 11 234 5678",
     "address": "45/2 Galle Road, Colombo 03, Sri Lanka",
     "base_currency": "LKR",
     "timezone": "Asia/Colombo",
     "subscription_plan": "ENTERPRISE",
     "modules_enabled": [1, 2, 3, 4, 5],
     "initial_admin": {
       "full_name": "Dr. Janith Samarasinghe",
       "email": "admin@qa20261015.lk",
       "username": "janith_admin",
       "password": "InitialSecurePassword2026!"
     }
   }
   ```
3. **Automated Provisioning Sequence:** The platform service automatically performs:
   * Record creation in `erp_platform.tenant_companies` with unique company ID (e.g. `2`).
   * Schema initialization or multi-tenant database binding in `erp_phrma`.
   * Standard Pharmaceutical Chart of Accounts auto-seeding (25 statutory GL accounts).
   * Default Headquarters Branch (`MAIN`) and Administration department creation.
   * Pharmaceutical unit seeders (`Box`, `Bottle`, `Vial`, `Strip`, `Ampoule`).
   * Super Administrator user creation with salted bcrypt password.
   * Full mapping in `user_software_access` for Control, Finance, Inventory, Invoice, and Compliance modules.

---

## 4. First-Time Company Setup Sequence

Once a company is provisioned, the **Company Super Administrator** must complete configuration in the following order:

```
┌─────────────────────────┐
│ 1. Fiscal Year & Tax    │ ➔ Financial Years (e.g. 2026/2027) & Sri Lankan VAT/SSCL
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. Chart of Accounts    │ ➔ Verify statutory ledger accounts & banking ledgers
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. Branch & Warehouses  │ ➔ Configure Regional Depots & Central Cold Chain Stores
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 4. Document Numbering   │ ➔ Set sequences: INV-2026-XXXX, GRN-2026-XXXX, etc.
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 5. Roles & User Wizard  │ ➔ Assign granular RBAC permissions and user branch access
└─────────────────────────┘
```

### 4.1 Step 1: Fiscal Year & Tax Settings
1. Navigate to **Finance ➔ Setup ➔ Financial Years**.
2. Create active financial year:
   * **Name:** `FY 2026/2027`
   * **Start Date:** `2026-04-01`
   * **End Date:** `2027-03-31`
   * **Status:** `OPEN`
3. Configure Sri Lankan Statutory Taxes under **Finance ➔ Setup ➔ Tax Settings**:
   * **Standard VAT:** Code `VAT_STD_18` | Rate `18.00%` | Compound: `No` | GL Account: `2200 - VAT Output Payable`.
   * **Exempt Medicine VAT:** Code `VAT_EXEMPT_PHARMA` | Rate `0.00%` | Compound: `No` | For essential medicines listed under NMRA gazettes.
   * **SSCL (Social Security Contribution Levy):** Code `SSCL_LIABLE` | Rate `2.50%` | Compound: `No` | GL Account: `2210 - SSCL Output Payable`.

### 4.2 Step 2: Chart of Accounts Verification
Navigate to **Finance ➔ Chart of Accounts**. Verify that default five root classes exist:
* `1000 - Assets` (Current Assets, Accounts Receivable, Inventory, Bank Accounts)
* `2000 - Liabilities` (Current Liabilities, Accounts Payable, VAT Payable, SSCL Payable)
* `3000 - Equity` (Share Capital, Retained Earnings)
* `4000 - Revenue` (Pharmaceutical Sales Revenue, Discounts Allowed)
* `5000 - Expenses` (Cost of Goods Sold, Warehouse Logistics, Administrative Expenses)

![Chart of Accounts UI](screenshots/03_finance_chart_of_accounts.svg)

### 4.3 Step 3: Multi-Branch & Warehouse Configuration
1. Navigate to **Control Center ➔ Branches**.
2. Set up organizational branches:
   * `MAIN` — Colombo Head Office & Central Hub (`is_hq = true`).
   * `QA_CMB` — Colombo Central Distribution Depot.
   * `QA_KDY` — Kandy Regional Distribution Hub.
3. Navigate to **Inventory ➔ Warehouses**.
4. Configure warehouse locations:
   * `QA_MAIN` — Central Cold Chain Warehouse (Temperature: 2°C - 8°C).
   * `QA_SECONDARY` — Ambient Pharmaceutical Transit Store (Temperature: 15°C - 25°C).

### 4.4 Step 4: Document Numbering Sequences
Navigate to **Control Center ➔ Document Numbering Rules**. Define standard zero-padded prefixes:

| Document Type | Prefix | Current Number | Padding Length | Sample Generated ID |
|---|---|---|---|---|
| Sales Order | `SO-2026-` | 1 | 4 | `SO-2026-0001` |
| Sales Invoice | `INV-2026-` | 1 | 5 | `INV-2026-00001` |
| Goods Receipt Note | `GRN-2026-` | 1 | 4 | `GRN-2026-0001` |
| Customer Receipt | `RCT-2026-` | 1 | 5 | `RCT-2026-00001` |
| Journal Voucher | `JV-2026-` | 1 | 5 | `JV-2026-00001` |

---

## 5. User Onboarding & RBAC Matrix Configuration

User management is operated via a multi-step modal wizard in **Control Center ➔ Users**.

![User Roles & Permission Matrix](screenshots/02_control_center_user_roles.svg)

### 5.1 User Creation Wizard Steps
1. **Step 1: Identity & Credentials:** Full Name, Username, Corporate Email, Temporary Password, Designation, Department.
2. **Step 2: Branch Scoping:** Select default branch and check all accessible branches (e.g. user permitted to transact only in `QA_CMB`).
3. **Step 3: Role & Permission Assignment:** Assign enterprise roles:
   * `Super Admin`: Unrestricted system access.
   * `Finance Manager`: GL, journals, CoA, payments, receipts, taxes.
   * `Warehouse Officer`: GRN receiving, putaway, stock transfers, batch holds.
   * `Billing Officer`: Orders, invoices, customer receipts, credit limits.
   * `Compliance Officer`: Batch recalls, quarantine, regulatory audit logs.
4. **Step 4: Module Access Gates:** Toggle software module licenses (Control, Finance, Inventory, Invoice, Compliance).

---

## 6. Security Policies & Audit Monitoring

1. Navigate to **Control Center ➔ Security Settings**.
2. Enforce company password complexity:
   * Minimum password length: 10 characters.
   * Require numbers, uppercase letters, and special symbols.
   * Account lockout threshold: 5 consecutive failed login attempts.
   * Session inactivity timeout: 30 minutes.
3. Monitor access violations in **Control Center ➔ Access Audit Logs**. Every failed authorization check, privilege escalation attempt, or cross-tenant query generates an immutable audit entry with timestamp, user ID, IP address, and requested action.
