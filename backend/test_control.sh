#!/bin/bash
sleep 2
LOGIN_RES=$(curl -s -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"company_code": "OMACX", "email": "admin@omacx.com", "password": "Admin@12345"}')
TOKEN=$(echo $LOGIN_RES | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

echo "--- 1. Company Profile (GET) ---"
curl -s -X GET http://localhost:8080/api/v1/control/company -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "--- 2. Branches (POST) ---"
curl -s -X POST http://localhost:8080/api/v1/control/branches -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"branch_code":"TEST-1", "branch_name":"Test Branch", "status":"active"}' | python3 -m json.tool
echo ""

echo "--- 3. Departments (GET) ---"
curl -s -X GET http://localhost:8080/api/v1/control/departments -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "--- 4. Software Modules (GET) ---"
curl -s -X GET http://localhost:8080/api/v1/control/software-modules -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

