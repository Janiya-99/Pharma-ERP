# Enterprise ERP System — Master Credentials & Access Directory

**Document Reference:** `DOC-CRED-2026-FINAL`  
**Target Environment:** Production Cloud VPS (`https://erp.pixandco.lk`)  
**Publication Date:** October 16, 2026  
**Status:** Certified Active & Verified Live  

---

## 1. Platform Master Admin Panel (Platform Owner Portal)

The Platform Admin Portal provides multi-tenant administration, tenant onboarding, database provisioning, module licensing, subscription management, and global audit logging.

| Attribute | Platform Admin Details |
|---|---|
| **Portal Web URL** | [https://erp.pixandco.lk/platform/login](https://erp.pixandco.lk/platform/login) |
| **Alternative URL** | [https://erp.pixandco.lk/admin/login](https://erp.pixandco.lk/admin/login) |
| **Username** | `admin` |
| **Email Address** | `admin@platform.com` |
| **Password** | `Admin@12345` |
| **Master Database** | `erp_phrma` (`platform_admin_users`) |
| **Administrative Scope** | Full Platform Ownership (Tenant Companies, Billing, Subscriptions, Database Routing, Global Audit Logs) |

---

## 2. Enterprise Tenant Admin (1,000+ Record Enterprise — Ceylon MedEx)

### Organization Overview
- **Company Name:** Ceylon MedEx Pharmaceuticals & Healthcare Lanka PLC  
- **Tenant Code:** `CEYLONMED`  
- **Tenant Database:** `erp_ceylonmed`  
- **Enterprise Dataset Scope:** **1,124+ role-permission mappings**, 383 unique permission keys, 394 general ledger lines, 369 sales invoice lines, 275 product batches, 195 GRN receiving lines, 110 customer receipts.  
- **ERP Web Application Portal:** [https://erp.pixandco.lk/auth/login](https://erp.pixandco.lk/auth/login)  
- **Shared Standard Initial Password:** `CeylonAdmin@2026`  

---

### Company Super Administrator
| Field | Value |
|---|---|
| **Managing Director & Super Admin** | **Dr. Kalinga Silva** |
| **Email Address** | `admin@ceylonmed.lk` |
| **Password** | `CeylonAdmin@2026` |
| **Role Code** | `SUPER_ADMIN` |
| **Department** | Executive Management & Administration |
| **Module Scope** | Unrestricted Access across all 5 Modules (Control Center, Finance, Inventory, Invoice Center, Compliance Center) |
| **Branch Scope** | All 5 Regional Logistics Hubs & Consolidated View |

---

### Complete Enterprise User & Role Login Directory (12 Verified Accounts)

Every account is pre-configured with active status, high-resolution professional avatars, and strict Role-Based Access Control (RBAC).

| # | Persona & Designation | Email Address | Password | Role Code | Department | Permitted Modules | Branch Access |
|---|---|---|---|---|---|---|---|
| 1 | **Dr. Kalinga Silva**<br/>*Managing Director* | `admin@ceylonmed.lk` | `CeylonAdmin@2026` | `SUPER_ADMIN` | Executive Management | All 5 Modules | All 5 Hubs |
| 2 | **Ruwani Jayawardena**<br/>*Chief Financial Officer* | `cfo@ceylonmed.lk` | `CeylonAdmin@2026` | `FINANCE_DIRECTOR` | Finance & Accounting | Control, Finance, Invoice | All 5 Hubs |
| 3 | **Chaminda Bandara**<br/>*Senior Financial Accountant* | `accountant@ceylonmed.lk` | `CeylonAdmin@2026` | `SENIOR_ACCOUNTANT` | Finance & Accounting | Finance | Colombo, Kandy |
| 4 | **Niroshan Perera**<br/>*Head of Warehouses & Logistics* | `warehouse.manager@ceylonmed.lk` | `CeylonAdmin@2026` | `WAREHOUSE_MANAGER` | Supply Chain & Warehousing | Control, Inventory | All 5 Hubs |
| 5 | **Kumara Wickramasinghe**<br/>*Senior Storekeeper (Maker)* | `storekeeper@ceylonmed.lk` | `CeylonAdmin@2026` | `STOREKEEPER` | Supply Chain & Warehousing | Inventory | Colombo Hub Only |
| 6 | **Dharshani Samarasekara**<br/>*Quality Assurance Director* | `qa.director@ceylonmed.lk` | `CeylonAdmin@2026` | `QA_DIRECTOR` | QA & Regulatory Affairs | Inventory, Compliance | All 5 Hubs |
| 7 | **Dr. Sanduni Fernando**<br/>*QC Laboratory Pharmacist (Maker)* | `qc.officer@ceylonmed.lk` | `CeylonAdmin@2026` | `QC_OFFICER` | QA & Regulatory Affairs | Inventory, Compliance | Colombo, Biyagama |
| 8 | **Priyantha De Silva**<br/>*Commercial Sales Director* | `sales.director@ceylonmed.lk` | `CeylonAdmin@2026` | `SALES_DIRECTOR` | Commercial Sales | Control, Invoice | All 5 Hubs |
| 9 | **Anura Gunaratne**<br/>*Billing & Invoicing Specialist* | `billing.officer@ceylonmed.lk` | `CeylonAdmin@2026` | `BILLING_OFFICER` | Commercial Sales | Invoice Center | Colombo Hub Only |
| 10 | **Malik Senanayake**<br/>*Chief Internal Auditor* | `auditor@ceylonmed.lk` | `CeylonAdmin@2026` | `INTERNAL_AUDITOR` | Internal Audit & Risk | All 5 Modules *(Read-Only)* | All 5 Hubs |
| 11 | **Fathima Rizna**<br/>*Branch Cashier* | `cashier@ceylonmed.lk` | `CeylonAdmin@2026` | `BRANCH_CASHIER` | Finance & Accounting | Finance, Invoice | Colombo Hub Only |
| 12 | **Kasun Jayasuriya**<br/>*Territory Medical Representative* | `medical.rep@ceylonmed.lk` | `CeylonAdmin@2026` | `SALES_REP` | Commercial Sales | Invoice Center | Kandy Hub Only |

---

## 3. Four-Eyes Principle: Maker vs Checker Approval Workflows

The enterprise access model enforces regulatory segregation between entry creation (*Maker*) and financial/statutory authorization (*Approver*):

| Business Workflow | Drafter / Maker Account | Approver / Checker Account | Governance Rule |
|---|---|---|---|
| **Inventory Goods Receipt Notes (GRN)** | `storekeeper@ceylonmed.lk` | `warehouse.manager@ceylonmed.lk` | Receiving dock clerks draft physical counts; warehouse manager inspects and authorizes stock and ledger posting. |
| **Sales Orders & Customer Credit** | `medical.rep@ceylonmed.lk` / `billing.officer@ceylonmed.lk` | `sales.director@ceylonmed.lk` | Commercial reps draft orders; credit extensions and price exception orders require executive sign-off. |
| **Credit Notes & Adjustments** | `billing.officer@ceylonmed.lk` | `sales.director@ceylonmed.lk` / `cfo@ceylonmed.lk` | Billing clerks cannot issue credit refunds unilaterally. |
| **NMRA Quarantine & Batch Recalls** | `qc.officer@ceylonmed.lk` | `qa.director@ceylonmed.lk` | Laboratory pharmacists record physical batch assay failures; official NMRA recall notices require QA Director sign-off. |
| **General Ledger & Period Closing** | `accountant@ceylonmed.lk` | `cfo@ceylonmed.lk` | Accountants prepare vouchers and bank recs; fiscal period closing and write-offs require CFO authorization. |
| **Independent Audit Surveillance** | `auditor@ceylonmed.lk` | *Read-Only Surveillance* | Granted 123 read-only access keys across ledgers, stock balances, audit logs, and compliance records. |

---

## 4. Secondary Test Company (QA20261015 Pharma Distribution)

For parallel isolated testing or sandbox validation:

| Attribute | Details |
|---|---|
| **Company Name** | QA20261015 Pharma Distribution (Test) |
| **Tenant Code** | `QA20261015` |
| **Tenant Database** | `erp_qa20261015` |
| **Portal Web URL** | [https://erp.pixandco.lk/auth/login](https://erp.pixandco.lk/auth/login) |
| **Administrator Name** | Dr. Janith Samarasinghe |
| **Admin Email** | `admin@qa20261015.lk` |
| **Password** | `CeylonAdmin@2026` *(or `Admin@123`)* |

---

## 5. Branch Network & Logistics Hub Scopes

| Hub ID | Branch Code | Branch Name | Facility Type | Primary Assigned Roles |
|---|---|---|---|---|
| **1** | `COL-01` | **Colombo Central Logistics Hub** | Central Distribution Facility & Headquarters | All Roles, Super Admin, CFO, Storekeeper |
| **2** | `KDY-02` | **Kandy Regional Distribution Hub** | Regional Hill Country Facility | Medical Rep, Accountant |
| **3** | `GAL-03` | **Galle Coastal Distribution Center** | Southern Province Logistics Facility | Regional Logistics |
| **4** | `BYG-04` | **Biyagama Cold Chain Logistics Hub** | Temperature-Controlled Biologics & Vaccines Facility | QC Officer, Warehouse Manager |
| **5** | `JFN-05` | **Jaffna Northern Hub** | Northern Province Medical Hub | Regional Distribution |

---

## 6. Technical Access & Server Connection Details

- **Application Domain:** `https://erp.pixandco.lk`
- **Backend API Gateway:** `https://erp.pixandco.lk/api/v1`
- **Production Server Host:** `50.6.230.198` (Bluehost Dedicated VPS)
- **SSH Deployment User:** `deploy@50.6.230.198`
- **Production Containers:**
  - `pharma-erp-frontend` (Nginx 1.24, port 80/443 reverse proxy)
  - `pharma-erp-backend` (Go Gin REST API, port 8080)
  - `shared-mysql` (MySQL 8.0, port 3306)
  - `shared-redis` (Redis 7.0 cache & session store, port 6379)
