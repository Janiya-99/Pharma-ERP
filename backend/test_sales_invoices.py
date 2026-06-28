#!/usr/bin/env python3
import urllib.request
import urllib.error
import json
import sys
import subprocess
import time

BASE_URL = "http://127.0.0.1:8085/api/v1"

def req(method, endpoint, token=None, data=None):
    url = BASE_URL + endpoint
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(data).encode('utf-8') if data is not None else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

print("=== Starting Step 52 Sales Invoice Backend API Tests ===")

# 1. Login
status, res = req("POST", "/auth/login", data={"company_code": "OMACX", "email": "admin@omacx.com", "password": "Admin@12345"})
assert status == 200, f"Login failed: {res}"
base_token = res["token"]

# Switch to INVOICE_CENTER
status, res = req("POST", "/auth/switch-software", token=base_token, data={"software_code": "INVOICE_CENTER"})
assert status == 200, f"Switch software failed: {res}"
ic_token = res["token"]
print("1. Authenticated and switched to INVOICE_CENTER")

# Verify at least one active customer exists
status, res = req("GET", "/invoice-center/customers", token=ic_token)
assert status == 200 and len(res["data"]) > 0, "No customers found"
customer_id = res["data"][0]["id"]
print("2. Customer found:", customer_id)

# For testing, we will use branch_id=1, warehouse_id=1, product_id=4, product_batch_id=1
invoice_payload = {
    "branch_id": 1,
    "customer_id": customer_id,
    "warehouse_id": 1,
    "invoice_date": "2026-06-28",
    "remarks": "Test Invoice 1",
    "lines": [
        {
            "product_id": 4,
            "product_batch_id": 1,
            "quantity": 1.0,
            "unit_price": 50.0,
            "discount_amount": 0,
            "tax_amount": 0
        }
    ]
}

# Create Direct Invoice
status, res = req("POST", "/invoice-center/sales-invoices", token=ic_token, data=invoice_payload)
assert status == 201, f"Create Invoice failed: {res}"
inv1 = res["data"]
inv1_id = inv1["id"]
print(f"3. Created Direct Sales Invoice ID {inv1_id}, Invoice Number: {inv1['invoice_number']}")

assert inv1["invoice_number"].startswith("INV-"), f"Invalid invoice number format: {inv1['invoice_number']}"
assert inv1["total_amount"] == 50.0, f"Expected total 50.0, got {inv1['total_amount']}"
print("4. Line and header totals calculated correctly")

# 10. Try creating invoice for blocked customer
suffix = str(int(time.time()))
blk_code = f"CUST-BLK-INV-{suffix}"
status, res = req("POST", "/invoice-center/customers", token=ic_token, data={
    "customer_code": blk_code,
    "customer_name": "Blocked Customer Ltd",
    "customer_type": "retail",
    "status": "blocked",
    "credit_limit": 1000.0
})
blk_cust_id = res["data"]["id"]
inv_blocked = invoice_payload.copy()
inv_blocked["customer_id"] = blk_cust_id
status, res = req("POST", "/invoice-center/sales-invoices", token=ic_token, data=inv_blocked)
assert status == 400, "Should block invoice for blocked customer"
print("5. Successfully blocked invoice for blocked customer")

# 11. Zero quantity
inv_zero = invoice_payload.copy()
inv_zero["lines"] = [{"product_id": 4, "product_batch_id": 1, "quantity": 0.0, "unit_price": 50.0, "discount_amount": 0, "tax_amount": 0}]
status, res = req("POST", "/invoice-center/sales-invoices", token=ic_token, data=inv_zero)
assert status == 400, "Should block zero quantity"
print("6. Successfully blocked invoice with zero quantity")

# 12. Too much quantity
inv_high = invoice_payload.copy()
inv_high["lines"] = [{"product_id": 4, "product_batch_id": 1, "quantity": 9999999.0, "unit_price": 50.0, "discount_amount": 0, "tax_amount": 0}]
status, res = req("POST", "/invoice-center/sales-invoices", token=ic_token, data=inv_high)
assert status == 400, "Should block quantity > available stock"
print("7. Successfully blocked invoice with quantity exceeding stock")

# 13. Submit
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/submit", token=ic_token, data={"remarks": "Submitting"})
assert status == 200, f"Submit failed: {res}"
print("8. Submitted invoice")

# 14. Reject
status, res = req("POST", f"/invoice-center/sales-orders", token=ic_token, data={"branch_id":1, "customer_id":customer_id}) # Just to make it quick, test reject on invoice 2
# Wait, let's reject inv1 for test flow, then update and resubmit.
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/reject", token=ic_token, data={"remarks": "Rejecting"})
assert status == 200, f"Reject failed: {res}"
_, inv_check = req("GET", f"/invoice-center/sales-invoices/{inv1_id}", token=ic_token)
assert inv_check["data"]["approval_status"] == "rejected"
print("9. Rejected invoice and confirmed status = rejected")

# 15. Update rejected and resubmit
inv_update = invoice_payload.copy()
status, res = req("PUT", f"/invoice-center/sales-invoices/{inv1_id}", token=ic_token, data=inv_update)
assert status == 200, f"Update failed: {res}"
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/submit", token=ic_token, data={"remarks": "Resubmitting"})
assert status == 200, f"Resubmit failed: {res}"
print("10. Updated rejected invoice and resubmitted")

# 16. Approve
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/approve", token=ic_token, data={"remarks": "Approving"})
assert status == 200, f"Approve failed: {res}"
_, inv_check = req("GET", f"/invoice-center/sales-invoices/{inv1_id}", token=ic_token)
assert inv_check["data"]["approval_status"] == "approved"
print("11. Approved invoice and confirmed status = approved")

# 17. Post invoice
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/post", token=ic_token)
assert status == 200, f"Post failed: {res}"
_, inv_check = req("GET", f"/invoice-center/sales-invoices/{inv1_id}", token=ic_token)
assert inv_check["data"]["posted_status"] == "posted"
print("12. Posted invoice, confirmed posted_status = posted")
assert inv_check["data"]["payment_summary"]["payment_status"] == "unpaid", "Payment status should be unpaid"

# 24. Try posting again
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/post", token=ic_token)
assert status == 400, "Should block posting again"
print("13. Blocked posting same invoice again")

# 25. Try editing posted invoice
status, res = req("PUT", f"/invoice-center/sales-invoices/{inv1_id}", token=ic_token, data=invoice_payload)
assert status == 400, "Should block editing posted invoice"
print("14. Blocked editing posted invoice")

# 26. Try cancelling posted invoice
status, res = req("POST", f"/invoice-center/sales-invoices/{inv1_id}/cancel", token=ic_token, data={"remarks": "Trying to cancel"})
assert status == 400, "Should block cancelling posted invoice"
print("15. Blocked cancelling posted invoice")

print("\n=== ALL SALES INVOICE TESTS PASSED SUCCESSFULLY! ===")
