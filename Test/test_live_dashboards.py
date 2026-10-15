import requests
import json

BASE_URL = "https://erp.pixandco.lk/api/v1"

def test_dashboards():
    print("[*] Testing live dashboards on https://erp.pixandco.lk...")
    s = requests.Session()
    
    # 1. Login
    login_res = s.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@ceylonmed.lk",
        "password": "CeylonAdmin@2026"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    print("[+] Logged in as admin@ceylonmed.lk")

    def switch_sw(code):
        res = s.post(f"{BASE_URL}/auth/switch-software", json={"software_code": code})
        if res.status_code == 200:
            new_tok = res.json().get("token")
            if new_tok:
                s.headers.update({"Authorization": f"Bearer {new_tok}"})

    # 2. Test Control Center Dashboard
    print("\n--- 1. CONTROL CENTER DASHBOARD ---")
    switch_sw("CONTROL_CENTER")
    cc_res = s.get(f"{BASE_URL}/control/dashboard/summary")
    print(f"Status: {cc_res.status_code}")
    if cc_res.status_code == 200:
        cc_data = cc_res.json()["data"]
        print(f"Total Branches: {cc_data.get('total_branches')}")
        print(f"Total Users: {cc_data.get('total_users')}")
        print(f"Activated Modules: {cc_data.get('activated_modules')}")
        print(f"Security Alerts: {cc_data.get('security_alerts')}")
        print(f"Role Distribution ({len(cc_data.get('role_distribution', []))} roles):")
        for rd in cc_data.get('role_distribution', []):
            print(f"  - {rd.get('name')}: {rd.get('count')} users ({rd.get('percentage')}%)")
        print(f"Telemetry Days: {len(cc_data.get('telemetry', []))}")
        print(f"Recent Security Events ({len(cc_data.get('security_events', []))} events):")
        for ev in cc_data.get('security_events', [])[:3]:
            print(f"  - [{ev.get('severity')}] {ev.get('description')} by {ev.get('user')} at {ev.get('time')}")
    else:
        print(f"Error: {cc_res.text}")

    # 3. Test Inventory Dashboard
    print("\n--- 2. INVENTORY DASHBOARD ---")
    switch_sw("INVENTORY")
    inv_res = s.get(f"{BASE_URL}/inventory/dashboard")
    print(f"Status: {inv_res.status_code}")
    if inv_res.status_code == 200:
        inv_data = inv_res.json()["data"]
        print(f"Total Products: {inv_data.get('total_products')}")
        print(f"Active Products: {inv_data.get('active_products')}")
        print(f"Total Stock Value: LKR {inv_data.get('total_stock_value'):,.2f}")
        print(f"Total Warehouses: {inv_data.get('total_warehouses')}")
        print(f"Low Stock Products: {inv_data.get('low_stock_products')}")
        print(f"Out of Stock Items: {inv_data.get('out_of_stock_items')}")
        print(f"Near Expiry Batches: {inv_data.get('near_expiry_batches')}")
        print(f"Expired Batches: {inv_data.get('expired_batches')}")
        print(f"Warehouse Distribution ({len(inv_data.get('warehouse_distribution', []))} facilities):")
        for wh in inv_data.get('warehouse_distribution', []):
            print(f"  - {wh.get('name')}: LKR {wh.get('value'):,.2f}")
        print(f"Batch Expiry Alerts ({len(inv_data.get('batch_alerts', []))} alerts):")
        for ba in inv_data.get('batch_alerts', [])[:3]:
            print(f"  - {ba.get('batch')} | {ba.get('product')} | Expiry: {ba.get('expiry')} | Status: {ba.get('status')}")
        print(f"Top Moving Products ({len(inv_data.get('top_moving_products', []))} products):")
        for tp in inv_data.get('top_moving_products', []):
            print(f"  - {tp.get('name')}: {tp.get('unitsSold')} units sold, turnover: LKR {tp.get('turnover'):,.2f}")
    else:
        print(f"Error: {inv_res.text}")

    # 4. Test Invoice Center Dashboard
    print("\n--- 3. INVOICE CENTER DASHBOARD ---")
    switch_sw("INVOICE_CENTER")
    ic_res = s.get(f"{BASE_URL}/invoice-center/dashboard/summary")
    print(f"Status: {ic_res.status_code}")
    if ic_res.status_code == 200:
        ic_data = ic_res.json()["data"]
        print(f"Total Customers: {ic_data.get('total_customers')}")
        print(f"Active Customers: {ic_data.get('active_customers')}")
        print(f"Total Customer Balance: LKR {ic_data.get('total_customer_balance'):,.2f}")
        print(f"Total Credit Limit: LKR {ic_data.get('total_credit_limit'):,.2f}")
        print(f"Unpaid Sales Invoices: {ic_data.get('unpaid_sales_invoices')}")
        print(f"Draft Sales Orders: {ic_data.get('draft_sales_orders')}")
        print(f"Aging Distribution:")
        for ag in ic_data.get('aging_distribution', []):
            print(f"  - {ag.get('bucket')}: LKR {ag.get('value'):,.2f}")
        print(f"Invoice Trends ({len(ic_data.get('invoice_trends', []))} months):")
        for tr in ic_data.get('invoice_trends', []):
            print(f"  - {tr.get('month')}: Invoiced LKR {tr.get('Invoiced Amount'):,.2f}, Collected LKR {tr.get('Collected Receipts'):,.2f}")
        print(f"Top Critical Accounts ({len(ic_data.get('critical_customers', []))} customers):")
        for cu in ic_data.get('critical_customers', []):
            print(f"  - {cu.get('customer_name')} ({cu.get('customer_code')}): Balance LKR {cu.get('current_balance'):,.2f} / Limit LKR {cu.get('credit_limit'):,.2f}")
    else:
        print(f"Error: {ic_res.text}")

    # 5. Test Finance Dashboard
    print("\n--- 4. FINANCE DASHBOARD ---")
    switch_sw("FINANCE")
    fin_res = s.get(f"{BASE_URL}/finance/dashboard")
    print(f"Status: {fin_res.status_code}")
    if fin_res.status_code == 200:
        fin_data = fin_res.json()["data"]
        summary = fin_data.get('summary', {})
        print(f"Monthly Revenue: LKR {summary.get('monthly_revenue', {}).get('value', 0):,.2f}")
        print(f"Monthly Expenses: LKR {summary.get('monthly_expenses', {}).get('value', 0):,.2f}")
        print(f"Gross Profit: LKR {summary.get('gross_profit', {}).get('value', 0):,.2f} ({summary.get('gross_profit', {}).get('secondary')})")
        print(f"Net Profit: LKR {summary.get('net_profit', {}).get('value', 0):,.2f} ({summary.get('net_profit', {}).get('secondary')})")
        print(f"Cash Balance: LKR {summary.get('cash_balance', {}).get('value', 0):,.2f}")
        print(f"Bank Balance: LKR {summary.get('bank_balance', {}).get('value', 0):,.2f}")
        print(f"Receivables: LKR {summary.get('accounts_receivable', {}).get('value', 0):,.2f}")
        print(f"Payables: LKR {summary.get('accounts_payable', {}).get('value', 0):,.2f}")
        print(f"Expense Distribution ({len(fin_data.get('expense_distribution', []))} categories):")
        for ed in fin_data.get('expense_distribution', []):
            print(f"  - {ed.get('category')}: LKR {ed.get('amount'):,.2f} ({ed.get('share')}%)")
        lq = fin_data.get('liquidity', {})
        print(f"Liquidity Status: {lq.get('liquidity_status')} (Cash In: LKR {lq.get('cash_in'):,.2f}, Cash Out: LKR {lq.get('cash_out'):,.2f}, Surplus: LKR {lq.get('net_surplus'):,.2f})")
        ps = fin_data.get('period_status', {})
        print(f"Accounting Period: {ps.get('financial_year')} - {ps.get('accounting_period')} (Status: {ps.get('status')})")
        print(f"Recent Transactions ({len(fin_data.get('recent_transactions', []))} entries):")
        for rt in fin_data.get('recent_transactions', [])[:3]:
            print(f"  - {rt.get('date')} | {rt.get('voucher')} | {rt.get('account')} | Dr LKR {rt.get('debit'):,.2f} / Cr LKR {rt.get('credit'):,.2f}")
    else:
        print(f"Error: {fin_res.text}")

    # 6. Test Compliance Center Dashboard
    print("\n--- 5. COMPLIANCE CENTER DASHBOARD ---")
    switch_sw("COMPLIANCE_CENTER")
    comp_res = s.get(f"{BASE_URL}/compliance/dashboard/summary")
    print(f"Status: {comp_res.status_code}")
    if comp_res.status_code == 200:
        comp_data = comp_res.json()["data"]
        print(f"Active Registered Formulations: {comp_data.get('active_licenses')}")
        print(f"Batches Under Quarantine: {comp_data.get('quarantine_batches_count')} (LKR {comp_data.get('quarantine_stock_value'):,.2f})")
        print(f"Active Recalls / Blocked: {comp_data.get('active_recalls_count')}")
        print(f"Pending Disposals: {comp_data.get('pending_disposals_count')} batches (Exposure LKR {comp_data.get('pending_disposals_value'):,.2f})")
        print(f"Total Category Exposure Value: LKR {comp_data.get('total_write_off_value'):,.2f}")
        print(f"Pass Rate Trajectory: {len(comp_data.get('pass_rate_data', []))} months")
        print(f"Quarantine Reasons: {len(comp_data.get('quarantine_reasons_data', []))} root causes")
        print(f"Recent Regulatory Actions: {len(comp_data.get('recent_regulatory_actions', []))} events")
        for ra in comp_data.get('recent_regulatory_actions', [])[:2]:
            print(f"  - [{ra.get('type')}] {ra.get('id')}: {ra.get('action')} on {ra.get('target')} ({ra.get('status')})")
    else:
        print(f"Error: {comp_res.text}")

if __name__ == "__main__":
    test_dashboards()
