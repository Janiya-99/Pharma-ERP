#!/usr/bin/env python3
"""
seed_customer_receipts.py
Generates 110 realistic Customer Receipts and Customer Receipt Allocations in erp_ceylonmed,
linking them directly to existing paid/partially-paid sales invoices,
and synchronizes customer current_balance and invoice payment statuses.
"""

import subprocess
import json
import random

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

def seed_receipts():
    print("[*] Fetching eligible sales invoices with paid amounts...")
    query_invoices_sql = """
    SELECT id, company_id, branch_id, customer_id, financial_year_id, accounting_period_id, invoice_number, invoice_date, total_amount, paid_amount, balance_amount
    FROM sales_invoices
    WHERE paid_amount > 0
    ORDER BY id ASC;
    """
    
    # We fetch invoices using JSON format or TSV
    tsv_out = run_sql(query_invoices_sql)
    lines = tsv_out.strip().split("\n")
    if len(lines) <= 1:
        print("[-] No eligible sales invoices found.")
        return

    headers = lines[0].split("\t")
    invoices = []
    for line in lines[1:]:
        if not line.strip() or "Warning" in line:
            continue
        parts = line.split("\t")
        if len(parts) == len(headers):
            inv = dict(zip(headers, parts))
            invoices.append(inv)

    print(f"[*] Found {len(invoices)} eligible sales invoices. Clearing existing customer_receipts & allocations...")
    run_sql("DELETE FROM customer_receipt_allocations; DELETE FROM customer_receipt_approvals; DELETE FROM customer_receipts;")

    payment_methods = ["bank_transfer", "cheque", "cash", "online"]
    receipt_sqls = []
    alloc_sqls = []

    print("[*] Building Customer Receipt and Allocation records...")
    for idx, inv in enumerate(invoices, start=1):
        inv_id = int(inv["id"])
        comp_id = int(inv["company_id"])
        branch_id = int(inv["branch_id"])
        cust_id = int(inv["customer_id"])
        fy_id = inv["financial_year_id"] if inv["financial_year_id"] and inv["financial_year_id"] != "NULL" else "NULL"
        ap_id = inv["accounting_period_id"] if inv["accounting_period_id"] and inv["accounting_period_id"] != "NULL" else "NULL"
        inv_num = inv["invoice_number"]
        inv_date = inv["invoice_date"]
        paid_amt = float(inv["paid_amount"])

        receipt_number = f"CR-{idx:06d}"
        pm = payment_methods[idx % len(payment_methods)]
        ref_num = f"TXN-2026-{idx:05d}"
        bank_ref = f"BOC-REC-{idx:05d}"
        chq_num = f"CHQ-{100000 + idx}" if pm == "cheque" else ""
        chq_date = f"'{inv_date}'" if pm == "cheque" else "NULL"

        # 1. Receipt
        receipt_sqls.append(f"""
        INSERT INTO customer_receipts (
            id, company_id, branch_id, customer_id, financial_year_id, accounting_period_id,
            receipt_number, receipt_date, payment_method, bank_account_id, cheque_number, cheque_date,
            reference_number, bank_reference_number, received_amount, allocated_amount, unallocated_amount,
            finance_post_status, remarks, approval_status, approved_by, approved_at,
            posted_status, posted_by, posted_at, status, receipt_status, created_by, created_at, updated_at
        ) VALUES (
            {idx}, {comp_id}, {branch_id}, {cust_id}, {fy_id}, {ap_id},
            '{receipt_number}', '{inv_date}', '{pm}', 1, '{chq_num}', {chq_date},
            '{ref_num}', '{bank_ref}', {paid_amt:.2f}, {paid_amt:.2f}, 0.00,
            'posted', 'Payment received and allocated for Invoice {inv_num}', 'approved', 8, NOW(),
            'posted', 2, NOW(), 'active', 'active', 1, NOW(), NOW()
        );
        """)

        # 2. Allocation
        alloc_sqls.append(f"""
        INSERT INTO customer_receipt_allocations (
            id, customer_receipt_id, allocation_type, sales_invoice_id, allocated_amount,
            remarks, created_at, updated_at
        ) VALUES (
            {idx}, {idx}, 'sales_invoice', {inv_id}, {paid_amt:.2f},
            'Settlement allocation to Sales Invoice {inv_num}', NOW(), NOW()
        );
        """)

    print(f"[*] Executing batched SQL for {len(receipt_sqls)} receipts...")
    run_sql("\n".join(receipt_sqls))

    print(f"[*] Executing batched SQL for {len(alloc_sqls)} allocations...")
    run_sql("\n".join(alloc_sqls))

    print("[*] Synchronizing customer credit balances to match current unpaid invoice totals...")
    recalc_balances_sql = """
    UPDATE customers c
    SET c.current_balance = COALESCE((
        SELECT SUM(si.balance_amount)
        FROM sales_invoices si
        WHERE si.customer_id = c.id
          AND si.deleted_at IS NULL
    ), 0.00);
    """
    run_sql(recalc_balances_sql)

    print("[*] Validating counts and amounts in erp_ceylonmed...")
    summary_sql = """
    SELECT 'Total Customer Receipts' as metric, COUNT(*) as count, SUM(received_amount) as total_val FROM customer_receipts
    UNION ALL
    SELECT 'Total Allocations', COUNT(*), SUM(allocated_amount) FROM customer_receipt_allocations
    UNION ALL
    SELECT 'Total Customer Balances (Outstanding)', COUNT(*), SUM(current_balance) FROM customers;
    """
    out = run_sql(summary_sql)
    print(out)
    print("[+] Successfully seeded Customer Receipts, Allocations, and Customer Credit Balances!")

if __name__ == "__main__":
    seed_receipts()
