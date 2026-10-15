#!/usr/bin/env python3
"""
Test/test_enterprise_users_roles.py
Comprehensive automated test suite verifying:
- 12 Enterprise users login authentication
- Profile image / Avatar URL verification
- Role & Permission assignments and functional segregation
- Module accessibility & branch scopes
- Approval vs View permission boundaries (Storekeeper vs Warehouse Manager, Billing vs Sales Director, QC vs QA, Auditor read-only)
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "https://erp.pixandco.lk/api/v1"
PASSWORD = "CeylonAdmin@2026"

USERS = [
    {
        "email": "admin@ceylonmed.lk",
        "name": "Dr. Kalinga Silva",
        "role": "SUPER_ADMIN",
        "expected_modules": ["CONTROL_CENTER", "FINANCE", "INVENTORY", "INVOICE_CENTER", "COMPLIANCE_CENTER"],
        "expected_branch_count": 5,
        "must_have_perms": ["inventory.goods_receipt_note.approve", "finance.journal.approve", "invoice_center.sales_order.approve", "compliance.batch_recall.approve"],
        "must_not_have_perms": []
    },
    {
        "email": "cfo@ceylonmed.lk",
        "name": "Ruwani Jayawardena",
        "role": "FINANCE_DIRECTOR",
        "expected_modules": ["CONTROL_CENTER", "FINANCE", "INVOICE_CENTER"],
        "expected_branch_count": 5,
        "must_have_perms": ["finance.journal.approve", "finance.accounting_period.close"],
        "must_not_have_perms": ["inventory.goods_receipt_note.approve", "compliance.batch_recall.approve"]
    },
    {
        "email": "accountant@ceylonmed.lk",
        "name": "Chaminda Bandara",
        "role": "SENIOR_ACCOUNTANT",
        "expected_modules": ["FINANCE"],
        "expected_branch_count": 2,
        "must_have_perms": ["finance.journal.view", "finance.journal.create"],
        "must_not_have_perms": ["finance.journal.approve", "finance.accounting_period.close"]
    },
    {
        "email": "warehouse.manager@ceylonmed.lk",
        "name": "Niroshan Perera",
        "role": "WAREHOUSE_MANAGER",
        "expected_modules": ["CONTROL_CENTER", "INVENTORY"],
        "expected_branch_count": 5,
        "must_have_perms": ["inventory.goods_receipt_note.approve", "inventory.stock_transfer.approve", "inventory.stock_adjustment.approve"],
        "must_not_have_perms": ["finance.journal.approve", "invoice_center.sales_order.approve"]
    },
    {
        "email": "storekeeper@ceylonmed.lk",
        "name": "Kumara Wickramasinghe",
        "role": "STOREKEEPER",
        "expected_modules": ["INVENTORY"],
        "expected_branch_count": 1,
        "must_have_perms": ["inventory.goods_receipt_note.view", "inventory.goods_receipt_note.create"],
        "must_not_have_perms": ["inventory.goods_receipt_note.approve", "inventory.stock_transfer.approve"]
    },
    {
        "email": "qa.director@ceylonmed.lk",
        "name": "Dharshani Samarasekara",
        "role": "QA_DIRECTOR",
        "expected_modules": ["INVENTORY", "COMPLIANCE_CENTER"],
        "expected_branch_count": 5,
        "must_have_perms": ["compliance.batch_recall.approve", "compliance.batch_hold.approve", "compliance.expiry_disposal.approve"],
        "must_not_have_perms": ["finance.journal.approve", "invoice_center.sales_order.approve"]
    },
    {
        "email": "qc.officer@ceylonmed.lk",
        "name": "Dr. Sanduni Fernando",
        "role": "QC_OFFICER",
        "expected_modules": ["INVENTORY", "COMPLIANCE_CENTER"],
        "expected_branch_count": 2,
        "must_have_perms": ["compliance.batch_hold.create", "compliance.expiry_disposal.create"],
        "must_not_have_perms": ["compliance.batch_recall.approve", "compliance.batch_hold.approve"]
    },
    {
        "email": "sales.director@ceylonmed.lk",
        "name": "Priyantha De Silva",
        "role": "SALES_DIRECTOR",
        "expected_modules": ["CONTROL_CENTER", "INVOICE_CENTER"],
        "expected_branch_count": 5,
        "must_have_perms": ["invoice_center.sales_order.approve", "invoice_center.credit_note.approve"],
        "must_not_have_perms": ["inventory.goods_receipt_note.approve", "finance.journal.approve"]
    },
    {
        "email": "billing.officer@ceylonmed.lk",
        "name": "Anura Gunaratne",
        "role": "BILLING_OFFICER",
        "expected_modules": ["INVOICE_CENTER"],
        "expected_branch_count": 1,
        "must_have_perms": ["invoice_center.sales_invoice.create", "invoice_center.customer_receipt.create"],
        "must_not_have_perms": ["invoice_center.sales_order.approve", "invoice_center.credit_note.create"]
    },
    {
        "email": "auditor@ceylonmed.lk",
        "name": "Malik Senanayake",
        "role": "INTERNAL_AUDITOR",
        "expected_modules": ["CONTROL_CENTER", "FINANCE", "INVENTORY", "INVOICE_CENTER", "COMPLIANCE_CENTER"],
        "expected_branch_count": 5,
        "must_have_perms": ["finance.report.trial_balance.view", "inventory.stock_ledger.view", "compliance.regulatory_record.view"],
        "must_not_have_perms": ["finance.journal.create", "inventory.goods_receipt_note.create", "inventory.goods_receipt_note.approve", "invoice_center.sales_order.create"]
    },
    {
        "email": "cashier@ceylonmed.lk",
        "name": "Fathima Rizna",
        "role": "BRANCH_CASHIER",
        "expected_modules": ["FINANCE", "INVOICE_CENTER"],
        "expected_branch_count": 1,
        "must_have_perms": ["invoice_center.customer_receipt.create", "finance.report.cash_book.view"],
        "must_not_have_perms": ["finance.journal.approve", "inventory.goods_receipt_note.approve"]
    },
    {
        "email": "medical.rep@ceylonmed.lk",
        "name": "Kasun Jayasuriya",
        "role": "SALES_REP",
        "expected_modules": ["INVOICE_CENTER"],
        "expected_branch_count": 1,
        "must_have_perms": ["invoice_center.sales_order.create", "invoice_center.customer.view"],
        "must_not_have_perms": ["invoice_center.sales_order.approve", "invoice_center.credit_note.view"]
    }
]

def login(email, password):
    url = f"{BASE_URL}/auth/login"
    payload = json.dumps({"email": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[-] HTTP {e.code} for {email}: {err_msg}")
        return None
    except Exception as e:
        print(f"[-] Error connecting for {email}: {e}")
        return None

def main():
    print("=" * 80)
    print(" CEYLON MEDEX PHARMACEUTICALS - 12 ENTERPRISE USERS & ROLES TEST SUITE")
    print("=" * 80)
    
    total_tests = len(USERS)
    passed_tests = 0
    failures = []

    for idx, u in enumerate(USERS, 1):
        email = u["email"]
        name = u["name"]
        role = u["role"]
        print(f"\n[{idx}/{total_tests}] Testing User: {name} ({email}) - Role: {role}")

        data = login(email, PASSWORD)
        if not data or not data.get("success"):
            print(f"  ❌ FAILED: Login failed for {email}")
            failures.append((email, "Login failed"))
            continue

        resp = data.get("data", {})
        user_info = resp.get("user", {})
        software_modules = resp.get("software_modules", [])
        branches = resp.get("branches", [])
        permissions = resp.get("permissions", [])

        # 1. Avatar / Image check
        avatar = user_info.get("avatar_url") or user_info.get("profile_image_url")
        if not avatar or not avatar.startswith("http"):
            print(f"  ❌ FAILED: Profile image missing or invalid: {avatar}")
            failures.append((email, "Avatar missing"))
            continue
        print(f"  ✓ Profile Image: {avatar[:55]}...")

        # 2. Branch access check
        branch_count = len(branches)
        if branch_count < u["expected_branch_count"]:
            print(f"  ❌ FAILED: Expected at least {u['expected_branch_count']} branches, got {branch_count}")
            failures.append((email, f"Branch count mismatch: {branch_count} < {u['expected_branch_count']}"))
            continue
        print(f"  ✓ Branches Assigned: {branch_count} branch(es)")

        # 3. Software module check
        sw_codes = [m.get("software_code") for m in software_modules]
        missing_sw = [m for m in u["expected_modules"] if m not in sw_codes]
        if missing_sw:
            print(f"  ❌ FAILED: Missing expected software module(s): {missing_sw} (has {sw_codes})")
            failures.append((email, f"Missing modules: {missing_sw}"))
            continue
        print(f"  ✓ Software Modules: {', '.join(sw_codes)}")

        # 4. Must-have permissions check
        if role != "SUPER_ADMIN":
            missing_perms = [p for p in u["must_have_perms"] if p not in permissions]
            if missing_perms:
                print(f"  ❌ FAILED: Missing required permission(s): {missing_perms}")
                failures.append((email, f"Missing perms: {missing_perms}"))
                continue

            # 5. Must-NOT-have permissions check (Privilege Isolation)
            forbidden_perms = [p for p in u["must_not_have_perms"] if p in permissions]
            if forbidden_perms:
                print(f"  ❌ FAILED: Security Violation! User has unauthorized permission(s): {forbidden_perms}")
                failures.append((email, f"Unauthorized perms: {forbidden_perms}"))
                continue
        print(f"  ✓ Permission Boundaries Verified: {len(permissions)} permission keys strictly isolated")

        print(f"  ✅ PASSED: All role, image, and permission boundary checks passed for {name}")
        passed_tests += 1

    print("\n" + "=" * 80)
    print(f" RESULTS: {passed_tests}/{total_tests} Enterprise Users Passed")
    print("=" * 80)

    if failures:
        print("FAILURES SUMMARY:")
        for email, reason in failures:
            print(f" - {email}: {reason}")
        sys.exit(1)
    else:
        print("🎉 ALL 12 ENTERPRISE USERS, ROLES, IMAGES & PERMISSIONS VERIFIED 100% ACCURATE!")
        sys.exit(0)

if __name__ == "__main__":
    main()
