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

print("=== Starting 23-Point Sales Order Integration Test ===")

# 1. Login
status, res = req("POST", "/auth/login", data={"company_code": "OMACX", "email": "admin@omacx.com", "password": "Admin@12345"})
assert status == 200, f"Login failed: {res}"
base_token = res["token"]
print("[PASS] 1. Authenticated as admin@omacx.com")

# Switch to INVOICE_CENTER
status, res = req("POST", "/auth/switch-software", token=base_token, data={"software_code": "INVOICE_CENTER"})
assert status == 200, f"Switch software failed: {res}"
ic_token = res["token"]
print("[PASS] 2. Switched software to INVOICE_CENTER")

# Switch to FINANCE (for negative software access check)
status, res = req("POST", "/auth/switch-software", token=base_token, data={"software_code": "FINANCE"})
fin_token = res["token"]

# 3. Unauthorized software access check
status, res = req("GET", "/invoice-center/sales-orders", token=fin_token)
assert status in [401, 403], f"Expected 401/403 for cross-software access, got {status}"
print("[PASS] 3. Software access isolation verified (Finance token rejected on Invoice Center API)")

# 4. Create Sales Order (Draft)
so_payload = {
    "branch_id": 1,
    "customer_id": 1,
    "sales_order_date": "2026-06-28",
    "expected_delivery_date": "2026-07-05",
    "remarks": "Test Order 1",
    "lines": [
        {
            "product_id": 4,
            "product_batch_id": 1,
            "quantity": 10.0,
            "unit_price": 80.0,
            "discount_amount": 80.0,
            "tax_amount": 36.0
        }
    ]
}
status, res = req("POST", "/invoice-center/sales-orders", token=ic_token, data=so_payload)
assert status == 201, f"Create SO failed: {res}"
so1 = res["data"]
so1_id = so1["id"]
print(f"[PASS] 4. Created Sales Order ID {so1_id}, Order Number: {so1['sales_order_number']}")

# 5. Verify order number generation
assert so1["sales_order_number"].startswith("SO-"), f"Invalid order number format: {so1['sales_order_number']}"
print("[PASS] 5. Order number format verified")

# 6. Verify calculation totals
print(f"   Totals -> Subtotal: {so1['subtotal_amount']}, Discount: {so1['discount_amount']}, Tax: {so1['tax_amount']}, Total: {so1['total_amount']}")
assert so1["total_amount"] == 756.0, f"Expected total 756.0, got {so1['total_amount']}"
print("[PASS] 6. Order totals calculation verified")

# 7. Negative test: Create order with empty lines
status, res = req("POST", "/invoice-center/sales-orders", token=ic_token, data={"branch_id": 1, "customer_id": 1, "sales_order_date": "2026-06-28", "lines": []})
assert status == 400, f"Expected 400 for empty lines, got {status}"
print("[PASS] 7. Validation verified: Cannot create order with empty lines")

# 8. Submit Sales Order 1
status, res = req("POST", f"/invoice-center/sales-orders/{so1_id}/submit", token=ic_token, data={"remarks": "Ready for approval"})
assert status == 200 and res["success"] == True, f"Submit SO failed: {res}"
_, so1_updated = req("GET", f"/invoice-center/sales-orders/{so1_id}", token=ic_token)
assert so1_updated["data"]["approval_status"] == "pending", f"Expected pending status, got {so1_updated['data']['approval_status']}"
print("[PASS] 8. Sales Order submitted successfully")

# 9. Verify approval history after submit
assert len(so1_updated["data"]["approvals"]) >= 1, "Expected at least 1 approval record"
print(f"[PASS] 9. Approval history recorded submit action ({len(so1_updated['data']['approvals'])} records)")

# 10. Try to update submitted order -> should fail
status, res = req("PUT", f"/invoice-center/sales-orders/{so1_id}", token=ic_token, data=so_payload)
assert status == 400, f"Expected 400 modifying submitted order, got {status}"
print("[PASS] 10. Validation verified: Cannot modify submitted order")

# 11. Approve Sales Order 1
status, res = req("POST", f"/invoice-center/sales-orders/{so1_id}/approve", token=ic_token, data={"remarks": "Approved by manager"})
assert status == 200 and res["success"] == True, f"Approve SO failed: {res}"
_, so1_updated = req("GET", f"/invoice-center/sales-orders/{so1_id}", token=ic_token)
assert so1_updated["data"]["approval_status"] == "approved", f"Expected approved status, got {so1_updated['data']['approval_status']}"
print("[PASS] 11. Sales Order approved successfully")

# 12. Verify approval history after approve
assert len(so1_updated["data"]["approvals"]) >= 2, "Expected at least 2 approval records"
print("[PASS] 12. Approval history recorded approve action")

# 13. Try to approve already approved order -> should fail
status, res = req("POST", f"/invoice-center/sales-orders/{so1_id}/approve", token=ic_token, data={"remarks": "Again"})
assert status == 400, f"Expected 400 approving already approved order, got {status}"
print("[PASS] 13. Validation verified: Cannot re-approve approved order")

# 14. Try to reject approved order -> should fail
status, res = req("POST", f"/invoice-center/sales-orders/{so1_id}/reject", token=ic_token, data={"remarks": "Rejecting"})
assert status == 400, f"Expected 400 rejecting approved order, got {status}"
print("[PASS] 14. Validation verified: Cannot reject approved order")

# 15. Create SO 2 and Reject it
status, res = req("POST", "/invoice-center/sales-orders", token=ic_token, data=so_payload)
so2_id = res["data"]["id"]
req("POST", f"/invoice-center/sales-orders/{so2_id}/submit", token=ic_token, data={"remarks": "Submitting SO 2"})
status, res = req("POST", f"/invoice-center/sales-orders/{so2_id}/reject", token=ic_token, data={"remarks": "Price too low"})
assert status == 200 and res["success"] == True, f"Reject failed: {res}"
_, so2_updated = req("GET", f"/invoice-center/sales-orders/{so2_id}", token=ic_token)
assert so2_updated["data"]["approval_status"] == "rejected", f"Expected rejected status, got {so2_updated['data']['approval_status']}"
print("[PASS] 15. Sales Order rejected successfully")

# 16. Verify approval history for rejected order
assert so2_updated["data"]["approvals"][-1]["action"] == "rejected", f"Expected rejected action in history, got {so2_updated['data']['approvals'][-1]['action']}"
print("[PASS] 16. Approval history recorded reject action")

# 17. Close approved order (SO 1)
status, res = req("POST", f"/invoice-center/sales-orders/{so1_id}/close", token=ic_token, data={"remarks": "Order completed"})
assert status == 200 and res["success"] == True, f"Close failed: {res}"
_, so1_updated = req("GET", f"/invoice-center/sales-orders/{so1_id}", token=ic_token)
assert so1_updated["data"]["order_status"] == "closed", f"Expected closed status, got {so1_updated['data']['order_status']}"
print("[PASS] 17. Sales Order closed successfully")

# 18. Try to cancel closed order -> should fail
status, res = req("POST", f"/invoice-center/sales-orders/{so1_id}/cancel", token=ic_token, data={"remarks": "Cancel"})
assert status == 400, f"Expected 400 cancelling closed order, got {status}"
print("[PASS] 18. Validation verified: Cannot cancel closed order")

# 19. Create SO 3, submit, approve, and Cancel it
status, res = req("POST", "/invoice-center/sales-orders", token=ic_token, data=so_payload)
so3_id = res["data"]["id"]
req("POST", f"/invoice-center/sales-orders/{so3_id}/submit", token=ic_token, data={"remarks": "Submitting SO 3"})
req("POST", f"/invoice-center/sales-orders/{so3_id}/approve", token=ic_token, data={"remarks": "Approving SO 3"})
status, res = req("POST", f"/invoice-center/sales-orders/{so3_id}/cancel", token=ic_token, data={"remarks": "Customer cancelled"})
assert status == 200 and res["success"] == True, f"Cancel failed: {res}"
_, so3_updated = req("GET", f"/invoice-center/sales-orders/{so3_id}", token=ic_token)
assert so3_updated["data"]["approval_status"] == "cancelled", f"Expected cancelled status, got {so3_updated['data']['approval_status']}"
print("[PASS] 19. Sales Order cancelled successfully")

suffix = str(int(time.time()))

# 20. Block customer and test creating order for blocked customer
blk_code = f"CUST-BLK-{suffix}"
status, res = req("POST", "/invoice-center/customers", token=ic_token, data={
    "customer_code": blk_code,
    "customer_name": "Blocked Customer Ltd",
    "customer_type": "retail",
    "status": "blocked",
    "credit_limit": 1000.0
})
assert status == 201, f"Create blocked customer failed: {res}"
blk_cust_id = res["data"]["id"]
status, res = req("POST", "/invoice-center/sales-orders", token=ic_token, data={"branch_id": 1, "customer_id": blk_cust_id, "sales_order_date": "2026-06-28", "lines": so_payload["lines"]})
assert status == 400, f"Expected 400 for blocked customer, got {status}"
print("[PASS] 20. Validation verified: Cannot create order for blocked customer")

# 21. Test credit limit validation
low_code = f"CUST-LOW-{suffix}"
status, res = req("POST", "/invoice-center/customers", token=ic_token, data={
    "customer_code": low_code,
    "customer_name": "Low Credit Customer",
    "customer_type": "retail",
    "status": "active",
    "credit_limit": 100.0
})
assert status == 201, f"Create low credit customer failed: {res}"
low_cust_id = res["data"]["id"]

# Update set_balance.go to target low_code
with open("set_balance.go", "w") as f:
    f.write(f'''package main

import (
	"fmt"
	"log"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {{
	dsn := "root:root@tcp(localhost:3306)/erp_omacx?parseTime=true"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{{}})
	if err != nil {{
		log.Fatal(err)
	}}
	res := db.Exec("UPDATE customers SET current_balance = 500.0 WHERE customer_code = '{low_code}'")
	if res.Error != nil {{
		log.Fatal(res.Error)
	}}
	fmt.Printf("Updated %d customer rows\\n", res.RowsAffected)
}}
''')

subprocess.run(["go", "run", "set_balance.go"], check=True)
status, res = req("POST", "/invoice-center/sales-orders", token=ic_token, data={"branch_id": 1, "customer_id": low_cust_id, "sales_order_date": "2026-06-28", "lines": so_payload["lines"]})
assert status == 400, f"Expected 400 exceeding credit limit, got {status}"
print("[PASS] 21. Validation verified: Credit limit enforced")

# 22. Get single order details with lines and approvals
status, res = req("GET", f"/invoice-center/sales-orders/{so1_id}", token=ic_token)
assert status == 200 and "lines" in res["data"], "Failed to retrieve order details"
print("[PASS] 22. Retrieved full order details with lines")

# 23. List orders with filters
status, res = req("GET", "/invoice-center/sales-orders?order_status=closed", token=ic_token)
assert status == 200 and len(res["data"]) >= 1, "Failed to filter orders"
print("[PASS] 23. List orders with filtering verified")

print("\n=== ALL 23 TESTS PASSED SUCCESSFULLY! ===")
