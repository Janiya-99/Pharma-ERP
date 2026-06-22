#!/bin/bash
sleep 2

PORT=8085
BASE_URL="http://localhost:$PORT/api/v1"

echo "Logging in..."
LOGIN_RES=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"company_code": "OMACX", "email": "admin@omacx.com", "password": "Admin@12345"}')
TOKEN=$(echo $LOGIN_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ] || [ "$TOKEN" == "" ]; then
    echo "Failed to get token"
    echo $LOGIN_RES
    exit 1
fi

echo "Token received."

echo "--- 1. Set Active Software to FINANCE ---"
SWITCH_RES=$(curl -s -X POST $BASE_URL/auth/switch-software -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"software_code": "FINANCE"}')
TOKEN=$(echo $SWITCH_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")
echo "Switched software. New token received."

echo "--- 2. Create Payment Voucher (Draft) ---"
CREATE_RES=$(curl -s -X POST $BASE_URL/finance/payment-vouchers -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
    "branch_id": 1,
    "financial_year_id": 1,
    "accounting_period_id": 1,
    "payment_date": "2024-01-15",
    "payment_type": "other_payment",
    "payment_method": "cash",
    "paid_from_account_id": 1,
    "description": "Test Payment Voucher",
    "lines": [
        {
            "account_id": 2,
            "line_description": "Office Supplies",
            "amount": 100.00
        }
    ]
}')
echo $CREATE_RES | python3 -m json.tool
PV_ID=$(echo $CREATE_RES | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))")

if [ -n "$PV_ID" ]; then
    echo "Created Payment Voucher ID: $PV_ID"

    echo "--- 3. Submit Payment Voucher ---"
    curl -s -X POST $BASE_URL/finance/payment-vouchers/$PV_ID/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"remarks":"Submitting for approval"}' | python3 -m json.tool

    echo "--- 4. Approve Payment Voucher ---"
    curl -s -X POST $BASE_URL/finance/payment-vouchers/$PV_ID/approve -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"remarks":"Approved"}' | python3 -m json.tool

    echo "--- 5. Post Payment Voucher ---"
    curl -s -X POST $BASE_URL/finance/payment-vouchers/$PV_ID/post -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' | python3 -m json.tool
fi

echo "--- 6. List Payment Vouchers ---"
curl -s -X GET "$BASE_URL/finance/payment-vouchers?limit=5" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
