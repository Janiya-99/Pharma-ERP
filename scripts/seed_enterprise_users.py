#!/usr/bin/env python3
"""
seed_enterprise_users.py
Seeds 12 realistic enterprise users with tailored roles, permissions, departments, designations, and avatars
into erp_ceylonmed on the production MySQL server.
"""

import subprocess
import json

MYSQL_CMD = "docker exec -i shared-mysql mysql -u root -p'V1KeGRCVjjEM2p3yJ4EHM7mVpVx3BsFi6WGMCcVGKis=' erp_ceylonmed"
SSH_HOST = "deploy@50.6.230.198"

def run_sql(sql):
    cmd = f'ssh -o StrictHostKeyChecking=no {SSH_HOST} "{MYSQL_CMD}"'
    proc = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = proc.communicate(input=sql)
    if proc.returncode != 0:
        print(f"SQL Error: {stderr}")
        raise Exception(f"SQL failed with code {proc.returncode}: {stderr}")
    return stdout

def seed_enterprise():
    print("[*] Starting Enterprise User & Role Seeding for Ceylon MedEx Pharmaceuticals...")

    # 1. Departments
    print("[1/6] Seeding Departments...")
    sql_dept = """
    INSERT INTO departments (company_id, department_code, department_name, description, status, created_at, updated_at)
    VALUES
      (1, 'ADMIN', 'Executive Management & Administration', 'Executive oversight, board governance, and enterprise administration', 'active', NOW(), NOW()),
      (1, 'FIN', 'Finance & Accounting', 'General ledger, accounts receivable, payables, and fiscal audits', 'active', NOW(), NOW()),
      (1, 'LOG', 'Supply Chain & Warehousing', 'Pharmaceutical inventory, batch quarantine, cold-chain distribution, and logistics', 'active', NOW(), NOW()),
      (1, 'QA', 'Quality Assurance & Regulatory Affairs', 'NMRA compliance, batch recall governance, QC assays, and disposal witnessing', 'active', NOW(), NOW()),
      (1, 'SALES', 'Commercial Sales & Hospital Accounts', 'Hospital sales distribution, retail pharmacy orders, and customer billing', 'active', NOW(), NOW()),
      (1, 'AUDIT', 'Internal Audit & Risk Management', 'Independent operational, fiscal, and regulatory compliance verification', 'active', NOW(), NOW())
    ON DUPLICATE KEY UPDATE department_name = VALUES(department_name), description = VALUES(description);
    """
    run_sql(sql_dept)

    # 2. Designations
    print("[2/6] Seeding Designations...")
    sql_des = """
    INSERT INTO designations (company_id, designation_name, description, status, created_at, updated_at)
    VALUES
      (1, 'Managing Director', 'Chief Executive and Executive Managing Director', 'active', NOW(), NOW()),
      (1, 'Chief Financial Officer', 'Director of Corporate Finance and Financial Governance', 'active', NOW(), NOW()),
      (1, 'Senior Financial Accountant', 'Senior General Ledger and Accounts Specialist', 'active', NOW(), NOW()),
      (1, 'Head of Warehouses & Logistics', 'Director of Supply Chain and Multi-Warehouse Logistics', 'active', NOW(), NOW()),
      (1, 'Senior Storekeeper', 'Receiving Bay Supervisor and Stock Controller', 'active', NOW(), NOW()),
      (1, 'Quality Assurance Director', 'Head of Regulatory Affairs and NMRA Compliance', 'active', NOW(), NOW()),
      (1, 'QC Laboratory Pharmacist', 'Quality Control Assay and Batch Holding Officer', 'active', NOW(), NOW()),
      (1, 'Commercial Sales Director', 'Head of Institutional and Hospital Sales Distribution', 'active', NOW(), NOW()),
      (1, 'Billing & Invoicing Specialist', 'Accounts Receivable and Billing Officer', 'active', NOW(), NOW()),
      (1, 'Chief Internal Auditor', 'Lead Enterprise Risk and Regulatory Auditor', 'active', NOW(), NOW()),
      (1, 'Branch Cashier', 'Point of Sale and Cash Collection Specialist', 'active', NOW(), NOW()),
      (1, 'Territory Medical Representative', 'Field Sales and Hospital Account Executive', 'active', NOW(), NOW())
    ON DUPLICATE KEY UPDATE description = VALUES(description);
    """
    run_sql(sql_des)

    # 3. Roles
    print("[3/6] Seeding Functional Enterprise Roles...")
    sql_roles = """
    INSERT INTO roles (id, role_name, role_code, description, is_system_role, status, created_at, updated_at)
    VALUES
      (1, 'Super Admin', 'SUPER_ADMIN', 'Unrestricted administrative authority across all modules and branches', 1, 'active', NOW(), NOW()),
      (2, 'Finance Director', 'FINANCE_DIRECTOR', 'Executive financial authority: period closing, ledger approvals, payment authorization', 0, 'active', NOW(), NOW()),
      (3, 'Senior Accountant', 'SENIOR_ACCOUNTANT', 'General ledger management, voucher processing, reconciliation entry', 0, 'active', NOW(), NOW()),
      (4, 'Warehouse Manager', 'WAREHOUSE_MANAGER', 'Warehouse operations oversight, GRN approval, stock transfer/adjustment approval', 0, 'active', NOW(), NOW()),
      (5, 'Storekeeper', 'STOREKEEPER', 'Receiving bay operations, GRN drafting, transfer request creation', 0, 'active', NOW(), NOW()),
      (6, 'QA Director', 'QA_DIRECTOR', 'Regulatory governance, batch quarantine holds, recall approval, disposal witnessing', 0, 'active', NOW(), NOW()),
      (7, 'QC Officer', 'QC_OFFICER', 'Laboratory testing, inspection recording, quarantine hold drafting', 0, 'active', NOW(), NOW()),
      (8, 'Sales Director', 'SALES_DIRECTOR', 'Commercial sales leadership, order approval, credit limit extension approval', 0, 'active', NOW(), NOW()),
      (9, 'Billing Officer', 'BILLING_OFFICER', 'Sales invoice generation, customer receipt processing, customer billing profile maintenance', 0, 'active', NOW(), NOW()),
      (10, 'Internal Auditor', 'INTERNAL_AUDITOR', 'Read-only audit surveillance across general ledgers, inventory, sales, and compliance', 0, 'active', NOW(), NOW()),
      (11, 'Branch Cashier', 'BRANCH_CASHIER', 'Front-desk customer receipting and daily cash book records', 0, 'active', NOW(), NOW()),
      (12, 'Medical Representative', 'SALES_REP', 'Territory sales drafting, customer inquiry management', 0, 'active', NOW(), NOW())
    ON DUPLICATE KEY UPDATE role_name = VALUES(role_name), description = VALUES(description);
    """
    run_sql(sql_roles)

    # 4. Role Permissions Mapping
    print("[4/6] Mapping tailored permissions to each role in role_permissions...")
    # Clear existing role_permissions for roles 2-12 so we can re-assign cleanly
    run_sql("DELETE FROM role_permissions WHERE role_id >= 2;")

    # Super Admin (Role 1): Already has all permissions or ensure all permissions are assigned
    run_sql("""
    INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 1, id, NOW(), NOW() FROM permissions;
    """)

    # Finance Director (Role 2): All finance.*, invoice_center.finance_posting.*, invoice_center.report.*, control.branch.view, control.audit.view
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 2, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE 'finance.%'
       OR permission_key LIKE 'invoice_center.finance_posting.%'
       OR permission_key LIKE 'invoice_center.report.%'
       OR permission_key IN ('control.branch.view', 'control.audit.view', 'invoice_center.dashboard.view', 'invoice_center.customer.view');
    """)

    # Senior Accountant (Role 3): finance.* EXCEPT finance.financial_year.close, finance.accounting_period.close, finance.bank_reconciliation.cancel
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 3, id, NOW(), NOW() FROM permissions
    WHERE (permission_key LIKE 'finance.%' 
           AND permission_key NOT LIKE '%.close' 
           AND permission_key NOT LIKE '%.cancel'
           AND permission_key != 'finance.journal.approve')
       OR permission_key IN ('finance.journal.view', 'finance.journal.create', 'finance.journal.update', 'finance.payment.view', 'finance.payment.create', 'finance.receipt.view', 'finance.receipt.create');
    """)

    # Warehouse Manager (Role 4): All inventory.* permissions including approve, plus control.branch.view
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 4, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE 'inventory.%'
       OR permission_key IN ('control.branch.view', 'control.audit.view');
    """)

    # Storekeeper (Role 5): inventory.*.view, create, update (NO APPROVE)
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 5, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE 'inventory.%'
      AND permission_key NOT LIKE '%.approve'
      AND permission_key NOT LIKE '%.cancel'
      AND permission_key NOT LIKE '%.delete';
    """)

    # QA Director (Role 6): All compliance.*, inventory.product_batch.*, inventory.stock_balance.view, control.audit.view
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 6, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE 'compliance.%'
       OR permission_key LIKE 'inventory.product_batch.%'
       OR permission_key IN ('inventory.dashboard.view', 'inventory.product_master.view', 'inventory.stock_balance.view', 'control.audit.view');
    """)

    # QC Officer (Role 7): compliance.*.view, compliance.batch_hold.create, compliance.expiry_disposal.create, inventory.product_batch.view (NO APPROVE)
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 7, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE 'compliance.%.view'
       OR permission_key IN ('compliance.dashboard.view', 'compliance.batch_hold.create', 'compliance.expiry_disposal.create', 'inventory.product_batch.view', 'inventory.stock_balance.view');
    """)

    # Sales Director (Role 8): All invoice_center.* permissions including approvals, plus control.branch.view
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 8, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE 'invoice_center.%'
       OR permission_key IN ('control.branch.view', 'control.audit.view');
    """)

    # Billing Officer (Role 9): invoice_center.*.view, create, print (NO APPROVE on credit notes or orders)
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 9, id, NOW(), NOW() FROM permissions
    WHERE (permission_key LIKE 'invoice_center.%'
           AND permission_key NOT LIKE '%.approve'
           AND permission_key != 'invoice_center.credit_note.create'
           AND permission_key != 'invoice_center.credit_note.update')
       OR permission_key IN ('invoice_center.sales_invoice.create', 'invoice_center.customer_receipt.create', 'invoice_center.print_format.view');
    """)

    # Internal Auditor (Role 10): All *.view permissions across all 5 modules (STRICTLY READ-ONLY)
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 10, id, NOW(), NOW() FROM permissions
    WHERE permission_key LIKE '%.view'
       OR permission_key LIKE '%.report.%';
    """)

    # Branch Cashier (Role 11): customer receipting, cash book, and customer view
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 11, id, NOW(), NOW() FROM permissions
    WHERE permission_key IN (
      'invoice_center.dashboard.view',
      'invoice_center.customer.view',
      'invoice_center.customer_receipt.view',
      'invoice_center.customer_receipt.create',
      'invoice_center.customer_receipt.print',
      'finance.report.cash_book.view',
      'finance.receipt_voucher.view'
    );
    """)

    # Medical Representative (Role 12): sales orders drafting & customer viewing
    run_sql("""
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    SELECT 12, id, NOW(), NOW() FROM permissions
    WHERE permission_key IN (
      'invoice_center.dashboard.view',
      'invoice_center.customer.view',
      'invoice_center.sales_order.view',
      'invoice_center.sales_order.create'
    );
    """)

    # 5. Users
    print("[5/6] Seeding 12 Enterprise Users with Professional Profile Images...")
    # Password hash for CeylonAdmin@2026: $2a$10$JOQtKH1Qy669GIA7upG5pu17rAWV726kLOtBxFt94toIZnSorswp2
    pwd_hash = "$2a$10$JOQtKH1Qy669GIA7upG5pu17rAWV726kLOtBxFt94toIZnSorswp2"

    users_data = [
        # id, employee_code, name, email, phone, dept_id, des_id, default_branch, user_type, avatar_url, role_id, software_ids, branch_ids
        (1, 'EMP-001', 'Dr. Kalinga Silva', 'admin@ceylonmed.lk', '+94 77 123 4567', 1, 1, 1, 'super_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', 1, [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),
        (2, 'EMP-002', 'Ruwani Jayawardena', 'cfo@ceylonmed.lk', '+94 77 234 5678', 2, 2, 1, 'company_user', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face', 2, [1, 2, 4], [1, 2, 3, 4, 5]),
        (3, 'EMP-003', 'Chaminda Bandara', 'accountant@ceylonmed.lk', '+94 77 345 6789', 2, 3, 1, 'company_user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', 3, [2], [1, 2]),
        (4, 'EMP-004', 'Niroshan Perera', 'warehouse.manager@ceylonmed.lk', '+94 77 456 7890', 3, 4, 1, 'company_user', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', 4, [1, 3], [1, 2, 3, 4, 5]),
        (5, 'EMP-005', 'Kumara Wickramasinghe', 'storekeeper@ceylonmed.lk', '+94 77 567 8901', 3, 5, 1, 'company_user', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', 5, [3], [1]),
        (6, 'EMP-006', 'Dharshani Samarasekara', 'qa.director@ceylonmed.lk', '+94 77 678 9012', 4, 6, 1, 'company_user', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', 6, [3, 5], [1, 2, 3, 4, 5]),
        (7, 'EMP-007', 'Dr. Sanduni Fernando', 'qc.officer@ceylonmed.lk', '+94 77 789 0123', 4, 7, 4, 'company_user', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face', 7, [3, 5], [1, 4]),
        (8, 'EMP-008', 'Priyantha De Silva', 'sales.director@ceylonmed.lk', '+94 77 890 1234', 5, 8, 1, 'company_user', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', 8, [1, 4], [1, 2, 3, 4, 5]),
        (9, 'EMP-009', 'Anura Gunaratne', 'billing.officer@ceylonmed.lk', '+94 77 901 2345', 5, 9, 1, 'company_user', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', 9, [4], [1]),
        (10, 'EMP-010', 'Malik Senanayake', 'auditor@ceylonmed.lk', '+94 77 012 3456', 6, 10, 1, 'company_user', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=face', 10, [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),
        (11, 'EMP-011', 'Fathima Rizna', 'cashier@ceylonmed.lk', '+94 77 123 7890', 2, 11, 1, 'company_user', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&h=200&fit=crop&crop=face', 11, [2, 4], [1]),
        (12, 'EMP-012', 'Kasun Jayasuriya', 'medical.rep@ceylonmed.lk', '+94 77 234 8901', 5, 12, 2, 'company_user', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face', 12, [4], [2])
    ]

    user_sqls = []
    for u in users_data:
        uid, emp_code, name, email, phone, dept_id, des_id, def_branch, utype, avatar, role_id, sw_ids, br_ids = u
        
        # Insert or update user
        user_sqls.append(f"""
        INSERT INTO users (id, company_id, employee_code, name, email, password_hash, phone, department_id, designation_id, default_branch_id, user_type, profile_image_url, status, login_enabled, created_at, updated_at)
        VALUES ({uid}, 1, '{emp_code}', '{name}', '{email}', '{pwd_hash}', '{phone}', {dept_id}, {des_id}, {def_branch}, '{utype}', '{avatar}', 'active', 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name), 
          employee_code = VALUES(employee_code),
          department_id = VALUES(department_id),
          designation_id = VALUES(designation_id),
          default_branch_id = VALUES(default_branch_id),
          user_type = VALUES(user_type),
          profile_image_url = VALUES(profile_image_url),
          password_hash = VALUES(password_hash),
          status = 'active',
          login_enabled = 1;
        """)

        # Clear and insert user_branch_access
        user_sqls.append(f"DELETE FROM user_branch_access WHERE user_id = {uid};")
        for bid in br_ids:
            is_def = 1 if bid == def_branch else 0
            user_sqls.append(f"""
            INSERT INTO user_branch_access (user_id, branch_id, is_default, status, created_at, updated_at)
            VALUES ({uid}, {bid}, {is_def}, 'active', NOW(), NOW());
            """)

        # Clear and insert user_software_access
        user_sqls.append(f"DELETE FROM user_software_access WHERE user_id = {uid};")
        for sid in sw_ids:
            user_sqls.append(f"""
            INSERT INTO user_software_access (user_id, software_id, can_access, status, created_at, updated_at)
            VALUES ({uid}, {sid}, 1, 'active', NOW(), NOW());
            """)

        # Clear and insert user_branch_roles
        user_sqls.append(f"DELETE FROM user_branch_roles WHERE user_id = {uid};")
        for bid in br_ids:
            user_sqls.append(f"""
            INSERT INTO user_branch_roles (user_id, branch_id, role_id, status, created_at, updated_at)
            VALUES ({uid}, {bid}, {role_id}, 'active', NOW(), NOW());
            """)

    print(f"[*] Executing batched SQL statements for {len(users_data)} users...")
    run_sql("\n".join(user_sqls))

    print("[6/6] Validating database counts...")
    check_sql = """
    SELECT 'Total Users' as metric, COUNT(*) as count FROM users
    UNION ALL
    SELECT 'Total Roles', COUNT(*) FROM roles
    UNION ALL
    SELECT 'Total Role-Permission Mappings', COUNT(*) FROM role_permissions
    UNION ALL
    SELECT 'Total User-Branch-Role Mappings', COUNT(*) FROM user_branch_roles
    UNION ALL
    SELECT 'Total User-Software-Access Mappings', COUNT(*) FROM user_software_access;
    """
    out = run_sql(check_sql)
    print(out)
    print("[+] Successfully seeded 12 enterprise users and permissions!")

if __name__ == "__main__":
    seed_enterprise()
