#!/bin/bash

# Test Finance Bank APIs
# Ensure backend is running and you have a valid auth token set in token.txt

URL="http://localhost:8080/api/v1/finance"
TOKEN=$(cat ../token.txt 2>/dev/null || echo "MISSING_TOKEN")

if [ "$TOKEN" == "MISSING_TOKEN" ]; then
    echo "Please put a valid auth token in backend/token.txt"
    exit 1
fi

HEADERS="-H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json'"

echo "--- Create Bank Account ---"
curl -s -X POST "$URL/bank-accounts" $HEADERS -d '{
  "branch_id": 1,
  "chart_account_id": 1,
  "bank_name": "Test Bank",
  "bank_branch_name": "Main Branch",
  "account_name": "Current Account",
  "account_number": "1234567890",
  "opening_balance": 10000.0,
  "is_default": true,
  "status": "active"
}' | jq

echo -e "\n--- List Bank Accounts ---"
curl -s -X GET "$URL/bank-accounts" $HEADERS | jq

echo -e "\n--- Create Cheque Book ---"
curl -s -X POST "$URL/cheque-books" $HEADERS -d '{
  "branch_id": 1,
  "bank_account_id": 1,
  "cheque_book_number": "CB-001",
  "start_leaf_number": "000001",
  "end_leaf_number": "000050",
  "issued_date": "2023-10-01",
  "status": "active"
}' | jq

echo -e "\n--- List Cheque Books ---"
curl -s -X GET "$URL/cheque-books" $HEADERS | jq

echo -e "\n--- Create Manual Bank Transaction ---"
curl -s -X POST "$URL/bank-transactions" $HEADERS -d '{
  "branch_id": 1,
  "bank_account_id": 1,
  "transaction_date": "2023-10-05",
  "transaction_type": "deposit",
  "reference_number": "DEP-001",
  "description": "Initial Deposit",
  "debit_amount": 5000.0,
  "credit_amount": 0
}' | jq

echo -e "\n--- List Bank Transactions ---"
curl -s -X GET "$URL/bank-transactions" $HEADERS | jq

echo -e "\n--- Create Bank Reconciliation ---"
curl -s -X POST "$URL/bank-reconciliations" $HEADERS -d '{
  "branch_id": 1,
  "bank_account_id": 1,
  "statement_start_date": "2023-10-01",
  "statement_end_date": "2023-10-31",
  "statement_opening_balance": 10000.0,
  "statement_closing_balance": 15000.0,
  "transaction_ids": [1]
}' | jq

echo -e "\n--- List Bank Reconciliations ---"
curl -s -X GET "$URL/bank-reconciliations" $HEADERS | jq
