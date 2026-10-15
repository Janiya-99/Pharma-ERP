# Enterprise Users, Roles, Passwords & Permissions Matrix Manual

**Organization:** Ceylon MedEx Pharmaceuticals & Healthcare Lanka PLC  
**Tenant Code:** `CEYLONMED`  
**Tenant Database:** `erp_ceylonmed`  
**Web Application Portal:** [https://erp.pixandco.lk/auth/login](https://erp.pixandco.lk/auth/login)  
**Shared Initial Password:** `CeylonAdmin@2026`  
**Date of Audit & Certification:** October 15, 2026  
**Security Model:** Role-Based Access Control (RBAC) with Multi-Branch Isolation & Maker-Checker Approval Guardrails  

---

## 1. Enterprise User Directory & Login Credentials

All 12 enterprise accounts are pre-configured, verified, and active on the production deployment.

| # | Persona & Designation | Email Address | Password | Role Code | Department | Assigned Modules | Branch Scope |
|---|-----------------------|---------------|----------|-----------|------------|------------------|--------------|
| 1 | **Dr. Kalinga Silva**<br/>*Managing Director* | `admin@ceylonmed.lk` | `CeylonAdmin@2026` | `SUPER_ADMIN` | Executive Management | All 5 Modules | All 5 Hubs |
| 2 | **Ruwani Jayawardena**<br/>*Chief Financial Officer* | `cfo@ceylonmed.lk` | `CeylonAdmin@2026` | `FINANCE_DIRECTOR` | Finance & Accounts | Control, Finance, Invoice | All 5 Hubs |
| 3 | **Chaminda Bandara**<br/>*Senior Financial Accountant* | `accountant@ceylonmed.lk` | `CeylonAdmin@2026` | `SENIOR_ACCOUNTANT` | Finance & Accounts | Finance | Colombo, Kandy |
| 4 | **Niroshan Perera**<br/>*Head of Warehouses & Logistics* | `warehouse.manager@ceylonmed.lk` | `CeylonAdmin@2026` | `WAREHOUSE_MANAGER` | Supply Chain & Logistics | Control, Inventory | All 5 Hubs |
| 5 | **Kumara Wickramasinghe**<br/>*Senior Storekeeper* | `storekeeper@ceylonmed.lk` | `CeylonAdmin@2026` | `STOREKEEPER` | Supply Chain & Logistics | Inventory | Colombo Hub Only |
| 6 | **Dharshani Samarasekara**<br/>*Quality Assurance Director* | `qa.director@ceylonmed.lk` | `CeylonAdmin@2026` | `QA_DIRECTOR` | QA & Regulatory Affairs | Inventory, Compliance | All 5 Hubs |
| 7 | **Dr. Sanduni Fernando**<br/>*QC Laboratory Pharmacist* | `qc.officer@ceylonmed.lk` | `CeylonAdmin@2026` | `QC_OFFICER` | QA & Regulatory Affairs | Inventory, Compliance | Colombo, Biyagama |
| 8 | **Priyantha De Silva**<br/>*Commercial Sales Director* | `sales.director@ceylonmed.lk` | `CeylonAdmin@2026` | `SALES_DIRECTOR` | Commercial Sales | Control, Invoice | All 5 Hubs |
| 9 | **Anura Gunaratne**<br/>*Billing & Invoicing Specialist* | `billing.officer@ceylonmed.lk` | `CeylonAdmin@2026` | `BILLING_OFFICER` | Commercial Sales | Invoice Center | Colombo Hub Only |
| 10 | **Malik Senanayake**<br/>*Chief Internal Auditor* | `auditor@ceylonmed.lk` | `CeylonAdmin@2026` | `INTERNAL_AUDITOR` | Internal Audit & Risk | All 5 Modules | All 5 Hubs |
| 11 | **Fathima Rizna**<br/>*Branch Cashier* | `cashier@ceylonmed.lk` | `CeylonAdmin@2026` | `BRANCH_CASHIER` | Finance & Accounts | Finance, Invoice | Colombo Hub Only |
| 12 | **Kasun Jayasuriya**<br/>*Territory Medical Representative* | `medical.rep@ceylonmed.lk` | `CeylonAdmin@2026` | `SALES_REP` | Commercial Sales | Invoice Center | Kandy Hub Only |

---

## 2. High-Resolution Profile Images & User Avatars

Every user account has an individual professional headshot linked in their user profile and returned in the login payload (`profile_image_url` and `avatar_url`). The top navigation bar displays the user's avatar image with an automatic fallback to their initials.

| Persona Name | Email | Role | Profile Avatar URL |
|--------------|-------|------|--------------------|
| **Dr. Kalinga Silva** | `admin@ceylonmed.lk` | Super Admin | `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face` |
| **Ruwani Jayawardena** | `cfo@ceylonmed.lk` | Finance Director | `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face` |
| **Chaminda Bandara** | `accountant@ceylonmed.lk` | Senior Accountant | `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face` |
| **Niroshan Perera** | `warehouse.manager@ceylonmed.lk` | Warehouse Manager | `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face` |
| **Kumara Wickramasinghe** | `storekeeper@ceylonmed.lk` | Storekeeper | `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face` |
| **Dharshani Samarasekara** | `qa.director@ceylonmed.lk` | QA Director | `https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face` |
| **Dr. Sanduni Fernando** | `qc.officer@ceylonmed.lk` | QC Officer | `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face` |
| **Priyantha De Silva** | `sales.director@ceylonmed.lk` | Sales Director | `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face` |
| **Anura Gunaratne** | `billing.officer@ceylonmed.lk` | Billing Officer | `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face` |
| **Malik Senanayake** | `auditor@ceylonmed.lk` | Internal Auditor | `https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=face` |
| **Fathima Rizna** | `cashier@ceylonmed.lk` | Branch Cashier | `https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&h=200&fit=crop&crop=face` |
| **Kasun Jayasuriya** | `medical.rep@ceylonmed.lk` | Medical Rep | `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face` |

---

## 3. Four-Eyes Principle: Maker vs Approver Permission Guardrails

The ERP system strictly separates creation rights from approval authority to satisfy pharmaceutical regulatory and financial compliance requirements.

### A. Supply Chain & Inventory Receiving
- **Drafter / Maker (`storekeeper@ceylonmed.lk`):**
  - Permitted: `inventory.grn.create`, `inventory.grn.view`, `inventory.grn.update`, `inventory.stock_transfer.create`, `inventory.stock_adjustment.create`, `inventory.stock_balance.view`.
  - Blocked: `inventory.grn.approve`, `inventory.stock_transfer.approve`, `inventory.stock_adjustment.approve`, `inventory.opening_stock.approve`.
- **Approver / Checker (`warehouse.manager@ceylonmed.lk`):**
  - Permitted: `inventory.grn.approve`, `inventory.grn.reject`, `inventory.stock_transfer.approve`, `inventory.stock_adjustment.approve`, `inventory.opening_stock.approve`.
  - *Result:* When a Storekeeper enters goods received at the warehouse dock, the stock balance and accounting ledger are not incremented until the Warehouse Manager reviews and formally approves the GRN.

### B. Invoicing, Sales Orders & Customer Credit
- **Drafter / Maker (`billing.officer@ceylonmed.lk`):**
  - Permitted: `invoice_center.sales_invoice.create`, `invoice_center.customer_receipt.create`, `invoice_center.customer_receipt.view`, `invoice_center.print_format.view`.
  - Blocked: `invoice_center.sales_order.approve`, `invoice_center.credit_note.create`, `invoice_center.credit_note.approve`.
- **Approver / Checker (`sales.director@ceylonmed.lk`):**
  - Permitted: `invoice_center.sales_order.approve`, `invoice_center.credit_note.approve`, `invoice_center.customer.create`, `invoice_center.customer.update`.
  - *Result:* Sales orders exceeding customer credit ceilings or price exceptions require Sales Director digital sign-off. Credit notes cannot be issued unilaterally by billing clerks.

### C. NMRA Compliance, Quarantine & Product Recalls
- **Drafter / Inspector (`qc.officer@ceylonmed.lk`):**
  - Permitted: `compliance.batch_hold.create`, `compliance.expiry_disposal.create`, `compliance.batch_hold.view`, `compliance.expiry_disposal.view`, `inventory.product_batch.view`.
  - Blocked: `compliance.batch_recall.approve`, `compliance.batch_hold.approve`, `compliance.expiry_disposal.approve`.
- **Regulatory Authority (`qa.director@ceylonmed.lk`):**
  - Permitted: `compliance.batch_recall.approve`, `compliance.batch_hold.approve`, `compliance.expiry_disposal.approve`, `compliance.nmra.create`, `compliance.nmra.view`.
  - *Result:* QC Officers log physical batch testing failures and request quarantine. Formal recall notices sent to hospitals/pharmacies and toxic waste batch destruction require the QA Director's digital authorization.

### D. General Ledger, Bank Reconciliations & Fiscal Year Closing
- **Drafter / Accountant (`accountant@ceylonmed.lk`):**
  - Permitted: `finance.journal.create`, `finance.journal.update`, `finance.payment.create`, `finance.receipt.create`, `finance.bank_reconciliation.create`.
  - Blocked: `finance.journal.approve`, `finance.accounting_period.close`, `finance.financial_year.close`.
- **Financial Officer (`cfo@ceylonmed.lk`):**
  - Permitted: `finance.journal.approve`, `finance.accounting_period.close`, `finance.financial_year.close`, `finance.bank_reconciliation.approve`.
  - *Result:* Year-end period closing locks ledgers against further modification and can only be executed by the CFO.

### E. Independent Read-Only Auditor Surveillance
- **Internal Auditor (`auditor@ceylonmed.lk`):**
  - Permitted: 123 read-only surveillance keys, including:
    - `finance.report.trial_balance.view`
    - `finance.report.balance_sheet.view`
    - `finance.general_ledger.view`
    - `inventory.stock_ledger.view`
    - `compliance.nmra.view`
    - `compliance.report.view`
    - `control.audit.view`
    - `control.login_logs.view`
  - Blocked: All `*.create`, `*.update`, `*.delete`, `*.approve`, and `*.close` permissions (0 modification permissions).
  - *Result:* Complete visibility into multi-branch operations and immutable audit trails without the ability to alter financial or operational records.

---

## 4. Multi-Branch Operational Scoping

The tenant features 5 operational hubs across Sri Lanka:
1. `COL_MAIN` (Branch ID: 1): Colombo Central Hub *(Headquarters & Central Logistics)*
2. `KANDY_REG` (Branch ID: 2): Kandy Hill Country Regional Branch
3. `GALLE_SOUTH` (Branch ID: 3): Galle Southern Hub
4. `BIYAGAMA_LOG` (Branch ID: 4): Biyagama Cold Chain Logistics Depot
5. `JAFFNA_NORTH` (Branch ID: 5): Jaffna Northern Distribution Depot

- **Enterprise-Wide Access (All 5 Branches):**
  - `admin@ceylonmed.lk` (Managing Director)
  - `cfo@ceylonmed.lk` (CFO)
  - `warehouse.manager@ceylonmed.lk` (Head of Warehouses)
  - `qa.director@ceylonmed.lk` (QA Director)
  - `sales.director@ceylonmed.lk` (Sales Director)
  - `auditor@ceylonmed.lk` (Internal Auditor)

- **Regional & Local Branch Isolation:**
  - `storekeeper@ceylonmed.lk`: Restricted to `COL_MAIN` (Colombo Central Hub only).
  - `billing.officer@ceylonmed.lk`: Restricted to `COL_MAIN` (Colombo Central Hub only).
  - `cashier@ceylonmed.lk`: Restricted to `COL_MAIN` (Colombo Central Hub only).
  - `accountant@ceylonmed.lk`: Restricted to `COL_MAIN` and `KANDY_REG`.
  - `qc.officer@ceylonmed.lk`: Restricted to `COL_MAIN` and `BIYAGAMA_LOG`.
  - `medical.rep@ceylonmed.lk`: Restricted to `KANDY_REG` (Kandy Hill Country Branch only).

---

## 5. Automated Verification Sign-Off

- **Test Suite Script:** `Test/test_enterprise_users_roles.py`
- **Result:** **12 out of 12 Enterprise Users Verified (100% Pass Rate)**
- **Verification Criteria:**
  - [x] Successful JWT authentication for each account
  - [x] Valid high-resolution avatar image URL present
  - [x] Software module access matching enterprise requirements
  - [x] Multi-branch access limits enforced
  - [x] Approval privileges strictly bounded (Maker vs Approver isolation verified)
