#!/usr/bin/env python3
"""
seed_all_system_views.py
Comprehensive seeder to populate realistic, high-fidelity test data across all system views:
1. Customer Categories, Contacts, and Addresses
2. Product Barcodes
3. Opening Balances for Chart of Accounts
4. Inventory Stock Adjustments & Lines
5. Inventory Opening Stock Entries & Lines
6. Inventory Stock Transfers & Lines
7. Inventory Purchase Returns & Lines
8. Inventory Sales Returns & Lines
9. Invoice Center Credit Notes & Lines
10. Invoice Center Debit Notes & Lines
11. Finance Cash Accounts & Bank Accounts
12. Finance Payment Vouchers & Lines
13. Finance Receipt Vouchers & Lines
14. Finance Petty Cash Funds & Vouchers
15. Finance Fixed Asset Categories & Assets
"""

import subprocess
import json
import random
from datetime import datetime, timedelta

SSH_HOST = "deploy@50.6.230.198"
MYSQL_CMD = "docker exec -i shared-mysql mysql -u root -p'V1KeGRCVjjEM2p3yJ4EHM7mVpVx3BsFi6WGMCcVGKis=' erp_ceylonmed"

def run_sql(sql):
    cmd = f'ssh -o StrictHostKeyChecking=no {SSH_HOST} "{MYSQL_CMD}"'
    proc = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = proc.communicate(input=sql)
    if proc.returncode != 0:
        raise Exception(f"SQL execution failed: {stderr}")
    return stdout

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    val_str = str(val).replace("\\", "\\\\").replace("'", "''")
    return f"'{val_str}'"

def main():
    print("[*] Starting comprehensive test data seeding for Ceylon Med Pharma ERP...")

    # 1. Seed Customer Categories
    print("[*] 1. Seeding Customer Categories and mapping customers...")
    categories_sql = """
    DELETE FROM customer_categories;
    INSERT INTO customer_categories (id, company_id, category_code, category_name, description, credit_limit, credit_days, status, created_at, updated_at) VALUES
    (1, 1, 'HOSP_PVT', 'Private Hospitals & Medical Centres', 'Tier-1 Private Healthcare Institutions & Surgical Hospitals', 25000000.00, 60, 'active', NOW(), NOW()),
    (2, 1, 'HOSP_GOVT', 'Government & Teaching Hospitals', 'State Healthcare Establishments & Ministry Teaching Facilities', 50000000.00, 90, 'active', NOW(), NOW()),
    (3, 1, 'PHARM_CHAIN', 'Retail Pharmacy Chains', 'Large Multi-Outlet Pharmacy Chains & Supermarket Pharmacies', 15000000.00, 45, 'active', NOW(), NOW()),
    (4, 1, 'PHARM_COMM', 'Community & Independent Pharmacies', 'Independent Community Pharmacies & Dispensaries', 3000000.00, 30, 'active', NOW(), NOW()),
    (5, 1, 'DIST_REG', 'Regional Pharmaceutical Distributors', 'Authorized Regional Stockists and Cold-Chain Distributors', 35000000.00, 60, 'active', NOW(), NOW()),
    (6, 1, 'CLINIC_INST', 'Specialist Clinics & Nursing Homes', 'Private Specialist Clinics, Eye Care & Dental Care Facilities', 5000000.00, 30, 'active', NOW(), NOW());

    -- Assign categories to existing customers based on their name/code
    UPDATE customers SET customer_category_id = 1 WHERE customer_name LIKE '%Hospital%' OR customer_name LIKE '%Asiri%' OR customer_name LIKE '%Nawaloka%' OR customer_name LIKE '%Durdans%' OR customer_name LIKE '%Lanka Hospital%';
    UPDATE customers SET customer_category_id = 3 WHERE customer_name LIKE '%Chain%' OR customer_name LIKE '%Healthguard%' OR customer_name LIKE '%Keells%' OR customer_name LIKE '%Cargills%';
    UPDATE customers SET customer_category_id = 4 WHERE customer_category_id IS NULL AND (customer_name LIKE '%Pharmacy%' OR customer_name LIKE '%Chemist%' OR customer_name LIKE '%Drug%');
    UPDATE customers SET customer_category_id = 5 WHERE customer_category_id IS NULL AND (customer_name LIKE '%Distributor%' OR customer_name LIKE '%Agency%' OR customer_name LIKE '%Logistics%');
    UPDATE customers SET customer_category_id = 6 WHERE customer_category_id IS NULL;
    """
    run_sql(categories_sql)

    # 2. Seed Customer Contacts & Addresses
    print("[*] 2. Seeding Customer Contacts & Addresses...")
    aux_sql = """
    DELETE FROM customer_contacts;
    DELETE FROM customer_addresses;

    INSERT INTO customer_contacts (customer_id, contact_name, designation, contact_number, email, is_primary, status, created_at, updated_at)
    SELECT id, 
           CONCAT('Dr. ', SUBSTRING_INDEX(customer_name, ' ', 1), ' Senarathne'), 
           'Head of Pharmacy & Procurement', 
           CONCAT('+94 11 2', LPAD(id, 6, '0')), 
           CONCAT('procurement@', LOWER(REPLACE(REPLACE(SUBSTRING_INDEX(customer_name, ' ', 2), ' ', ''), '.', '')), '.lk'), 
           1, 
           'active', 
           NOW(), 
           NOW()
    FROM customers;

    INSERT INTO customer_contacts (customer_id, contact_name, designation, contact_number, email, is_primary, status, created_at, updated_at)
    SELECT id, 
           CONCAT('Mr. Jagath ', SUBSTRING_INDEX(customer_name, ' ', -1)), 
           'Finance & Accounts Officer', 
           CONCAT('+94 77 3', LPAD(id, 6, '5')), 
           CONCAT('finance@', LOWER(REPLACE(REPLACE(SUBSTRING_INDEX(customer_name, ' ', 2), ' ', ''), '.', '')), '.lk'), 
           0, 
           'active', 
           NOW(), 
           NOW()
    FROM customers;

    INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, district, province, postal_code, country, is_default, status, created_at, updated_at)
    SELECT id, 
           'billing', 
           CONCAT('No. ', (id * 12 + 5), ', Main Hospital Road'), 
           'Healthcare District Zone', 
           CASE (id % 5)
             WHEN 0 THEN 'Colombo 07'
             WHEN 1 THEN 'Colombo 03'
             WHEN 2 THEN 'Kandy Central'
             WHEN 3 THEN 'Galle Fort'
             ELSE 'Kurunegala'
           END,
           CASE (id % 5)
             WHEN 0 THEN 'Colombo'
             WHEN 1 THEN 'Colombo'
             WHEN 2 THEN 'Kandy'
             WHEN 3 THEN 'Galle'
             ELSE 'Kurunegala'
           END,
           CASE (id % 5)
             WHEN 2 THEN 'Central Province'
             WHEN 3 THEN 'Southern Province'
             WHEN 4 THEN 'North Western Province'
             ELSE 'Western Province'
           END,
           CONCAT('00', (id * 10 + 100)), 
           'Sri Lanka', 
           1, 
           'active', 
           NOW(), 
           NOW()
    FROM customers;
    """
    run_sql(aux_sql)

    # 3. Seed Product Barcodes
    print("[*] 3. Seeding Product Barcodes...")
    barcode_sql = """
    DELETE FROM product_barcodes;
    INSERT INTO product_barcodes (company_id, product_id, barcode, barcode_type, status, created_by, created_at, updated_at)
    SELECT company_id, id, CONCAT('4790001', LPAD(id, 6, '0')), 'primary', 'active', 1, NOW(), NOW()
    FROM products;
    """
    run_sql(barcode_sql)

    # 4. Seed Opening Balances (FY 2026/2027)
    print("[*] 4. Seeding Opening Balances for active Fiscal Year...")
    op_bal_sql = """
    DELETE FROM opening_balances WHERE financial_year_id = 4;
    INSERT INTO opening_balances (company_id, branch_id, financial_year_id, account_id, debit_amount, credit_amount, remarks, status, created_by, created_at, updated_at) VALUES
    (1, 1, 4, 1, 1500000.00, 0.00, 'Opening Cash in Hand - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 2, 350000.00, 0.00, 'Opening Petty Cash Floats - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 3, 45000000.00, 0.00, 'Opening Operating Bank Balances - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 4, 38500000.00, 0.00, 'Opening Trade Debtors Ledger - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 5, 84200000.00, 0.00, 'Opening Pharmaceutical Stock Valuation - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 7, 52000000.00, 0.00, 'Opening Fixed Assets Cost - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 8, 0.00, 14500000.00, 'Opening Accumulated Depreciation - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 9, 0.00, 29000000.00, 'Opening Trade Creditors - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 12, 0.00, 100000000.00, 'Stated Share Capital - FY 2026/2027', 'active', 2, NOW(), NOW()),
    (1, 1, 4, 13, 0.00, 78050000.00, 'Retained Earnings Balance B/F - FY 2026/2027', 'active', 2, NOW(), NOW());
    """
    run_sql(op_bal_sql)

    # 5. Seed Cash Accounts & Bank Accounts
    print("[*] 5. Seeding Cash & Bank Accounts...")
    cash_bank_sql = """
    DELETE FROM cash_accounts;
    DELETE FROM bank_accounts;

    INSERT INTO cash_accounts (id, company_id, branch_id, cash_account_name, responsible_user_id, linked_ledger_account_id, auto_create_ledger, opening_balance, current_balance, opening_balance_date, status, description, created_by, created_at, updated_at) VALUES
    (1, 1, 1, 'Colombo Central Vault & Main Cash Desk', 11, 1, 0, 500000.00, 785400.00, '2026-04-01', 'active', 'Main Treasury & Counter Collections Cash Till - Colombo', 2, NOW(), NOW()),
    (2, 1, 2, 'Kandy Regional Branch Cash Office', 5, 1, 0, 250000.00, 420150.00, '2026-04-01', 'active', 'Hill Country Regional Cash & Emergency Operating Till', 2, NOW(), NOW()),
    (3, 1, 3, 'Galle Southern Depot Cash Till', 5, 1, 0, 200000.00, 315800.00, '2026-04-01', 'active', 'Maritime Province Cash Desk & Counter Sales', 2, NOW(), NOW()),
    (4, 1, 4, 'Biyagama Logistics Cold Chain Cash Vault', 4, 1, 0, 150000.00, 210000.00, '2026-04-01', 'active', 'Distribution Hub Fuel & Immediate Logistics Fund', 2, NOW(), NOW()),
    (5, 1, 5, 'Jaffna Northern Branch Cash Till', 5, 1, 0, 200000.00, 285600.00, '2026-04-01', 'active', 'Northern Depot Cash Desk for Urgent Hospital Supplies', 2, NOW(), NOW());

    INSERT INTO bank_accounts (id, company_id, branch_id, chart_account_id, bank_name, bank_branch_name, account_name, account_number, swift_code, bank_code, branch_code, opening_balance, current_balance, is_default, status, created_by, created_at, updated_at) VALUES
    (1, 1, 1, 3, 'Commercial Bank of Ceylon PLC', 'Colombo Fort Corporate Branch', 'Ceylon MedEx Pharmaceuticals (Pvt) Ltd - Corporate', '001004829104', 'COMBCEYAX', '7010', '001', 25000000.00, 34520800.00, 1, 'active', 2, NOW(), NOW()),
    (2, 1, 1, 3, 'Hatton National Bank PLC (HNB)', 'HNB Towers Head Office', 'Ceylon MedEx Pharmaceuticals - Collections Acc', '108003920194', 'HBLKLKLX', '7083', '010', 12000000.00, 18450200.00, 0, 'active', 2, NOW(), NOW()),
    (3, 1, 1, 3, 'Bank of Ceylon (BOC)', 'Corporate Branch Colombo 01', 'Ceylon MedEx Pharmaceuticals - Treasury & Forex', '782019482019', 'BCEYLKLX', '7038', '002', 8000000.00, 11200450.00, 0, 'active', 2, NOW(), NOW()),
    (4, 1, 2, 3, 'Sampath Bank PLC', 'Kandy City Centre Branch', 'Ceylon MedEx Pharmaceuticals - Regional Operations', '019283746501', 'SMPLKLX', '7278', '025', 4500000.00, 6840900.00, 0, 'active', 2, NOW(), NOW()),
    (5, 1, 3, 3, 'Seylan Bank PLC', 'Galle Main Street Branch', 'Ceylon MedEx Pharmaceuticals - Southern Hub', '084729104829', 'SEYLKLX', '7287', '034', 3500000.00, 5120300.00, 0, 'active', 2, NOW(), NOW());
    """
    run_sql(cash_bank_sql)

    # 6. Seed Petty Cash Funds & Vouchers
    print("[*] 6. Seeding Petty Cash Funds & Vouchers...")
    petty_sql = """
    DELETE FROM petty_cash_voucher_lines;
    DELETE FROM petty_cash_vouchers;
    DELETE FROM petty_cash_funds;

    INSERT INTO petty_cash_funds (id, company_id, branch_id, fund_name, fund_code, chart_account_id, custodian_user_id, opening_balance, current_balance, fund_limit, status, created_by, created_at, updated_at) VALUES
    (1, 1, 1, 'Central Office Petty Cash Fund', 'PCF-COL-01', 2, 11, 150000.00, 118450.00, 200000.00, 'active', 2, NOW(), NOW()),
    (2, 1, 2, 'Kandy Branch Daily Operations Fund', 'PCF-KDY-01', 2, 5, 100000.00, 76200.00, 150000.00, 'active', 2, NOW(), NOW()),
    (3, 1, 4, 'Biyagama Logistics Emergency Till', 'PCF-LOG-01', 2, 4, 75000.00, 52800.00, 100000.00, 'active', 2, NOW(), NOW());

    INSERT INTO petty_cash_vouchers (id, company_id, branch_id, petty_cash_fund_id, financial_year_id, accounting_period_id, voucher_number, voucher_date, voucher_type, payee_name, reference_number, description, total_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at) VALUES
    (1, 1, 1, 1, 4, 43, 'PCV-2026-0001', '2026-10-02', 'expense', 'Speedy Courier & Dispatch Express', 'BILL-6789', 'Urgent pharmaceutical sample delivery to NMRA laboratory', 4850.00, 'approved', 2, NOW(), 'posted', 2, NOW(), 'active', 11, NOW(), NOW()),
    (2, 1, 1, 1, 4, 43, 'PCV-2026-0002', '2026-10-04', 'expense', 'Ceylon Electricity Board (Quick Pay)', 'CEB-8831', 'Emergency backup generator fuel reimbursement', 16500.00, 'approved', 2, NOW(), 'posted', 2, NOW(), 'active', 11, NOW(), NOW()),
    (3, 1, 1, 1, 4, 43, 'PCV-2026-0003', '2026-10-07', 'expense', 'Metropolitan Stationers PLC', 'INV-5510', 'Tamper-evident batch release security labels and printer ribbons', 10200.00, 'approved', 2, NOW(), 'posted', 2, NOW(), 'active', 11, NOW(), NOW()),
    (4, 1, 2, 2, 4, 43, 'PCV-2026-0004', '2026-10-09', 'expense', 'Kandy Cold Courier Transport', 'KCC-4412', 'Dry ice replenishment for cold-chain vaccine delivery transit', 13800.00, 'approved', 2, NOW(), 'posted', 2, NOW(), 'active', 5, NOW(), NOW()),
    (5, 1, 4, 3, 4, 43, 'PCV-2026-0005', '2026-10-12', 'expense', 'Kelaniya Packaging Solutions', 'KPS-901', 'Corrugated insulated shipping boxes for biologics', 22200.00, 'approved', 2, NOW(), 'posted', 2, NOW(), 'active', 4, NOW(), NOW());

    INSERT INTO petty_cash_voucher_lines (petty_cash_voucher_id, account_id, line_description, amount, line_order, created_at, updated_at) VALUES
    (1, 23, 'NMRA Lab express courier fees', 4850.00, 1, NOW(), NOW()),
    (2, 21, 'Generator diesel fuel for warehouse uninterrupted power', 16500.00, 1, NOW(), NOW()),
    (3, 22, 'Security seal stickers & QC documentation files', 10200.00, 1, NOW(), NOW()),
    (4, 23, 'Dry ice pellets for temperature-sensitive shipments', 13800.00, 1, NOW(), NOW()),
    (5, 17, 'Specialized insulated container boxes', 22200.00, 1, NOW(), NOW());
    """
    run_sql(petty_sql)

    # 7. Seed Fixed Asset Categories & Assets
    print("[*] 7. Seeding Fixed Asset Categories & Assets...")
    asset_sql = """
    DELETE FROM fixed_assets;
    DELETE FROM fixed_asset_categories;

    INSERT INTO fixed_asset_categories (id, company_id, category_code, category_name, description, default_asset_account_id, default_accumulated_depreciation_account_id, default_depreciation_expense_account_id, default_useful_life_months, default_depreciation_method, status, created_by, created_at, updated_at) VALUES
    (1, 1, 'PHARM_QC', 'Pharmaceutical Analytical & QC Equipment', 'HPLC, Spectrophotometers, Dissolution Testers, Bio-Safety Cabinets', 7, 8, 21, 60, 'straight_line', 'active', 2, NOW(), NOW()),
    (2, 1, 'COLD_CHAIN', 'Cold Storage & Ultra-Low Refrigeration', 'Walk-in Cold Rooms, -86C Freezers, Continuous Temperature Monitoring', 7, 8, 21, 84, 'straight_line', 'active', 2, NOW(), NOW()),
    (3, 1, 'VEHICLES', 'Pharma Logistics & Refrigerated Delivery Fleet', 'Refrigerated 4.5T Trucks, Temperature-Controlled Delivery Vans', 7, 8, 23, 60, 'straight_line', 'active', 2, NOW(), NOW()),
    (4, 1, 'IT_INFRA', 'Enterprise Datacenter & Warehouse Tech', 'High-Availability Database Servers, Barcode Scanners, UPS Systems', 7, 8, 21, 36, 'straight_line', 'active', 2, NOW(), NOW());

    INSERT INTO fixed_assets (id, company_id, branch_id, fixed_asset_category_id, asset_code, asset_name, description, serial_number, model_number, manufacturer, purchase_date, acquisition_date, supplier_name, invoice_number, acquisition_cost, residual_value, depreciable_amount, useful_life_months, depreciation_method, depreciation_start_date, asset_account_id, accumulated_depreciation_account_id, depreciation_expense_account_id, accumulated_depreciation, net_book_value, last_depreciation_date, asset_status, status, created_by, created_at, updated_at) VALUES
    (1, 1, 1, 1, 'AST-QC-001', 'Agilent 1260 Infinity II HPLC System', 'High Performance Liquid Chromatograph for finished drug assay verification', 'DE63019842', 'G7111B', 'Agilent Technologies', '2024-05-15', '2024-05-20', 'Analytical Instruments (Pvt) Ltd', 'INV-AG-9921', 12500000.00, 1000000.00, 11500000.00, 60, 'straight_line', '2024-06-01', 7, 8, 21, 4600000.00, 7900000.00, '2026-09-30', 'in_use', 'active', 2, NOW(), NOW()),
    (2, 1, 4, 2, 'AST-CLD-002', 'B Medical Systems Walk-in Cold Room Facility (2-8°C)', 'Modular Cold Room 45m3 for Bulk Vaccine & Insulin Storage with Dual Compressors', 'BMS-LK-88310', 'WICR-45M', 'B Medical Systems Luxembourg', '2024-08-10', '2024-09-01', 'Mediquipment Limited', 'INV-MQ-4421', 18500000.00, 1500000.00, 17000000.00, 84, 'straight_line', '2024-09-01', 7, 8, 21, 5059520.00, 13440480.00, '2026-09-30', 'in_use', 'active', 2, NOW(), NOW()),
    (3, 1, 1, 3, 'AST-VEH-003', 'Isuzu NPR 4.5T Refrigerated Pharmaceutical Truck', 'Dual-zone refrigerated truck WP LG-8841 with Euro 4 Thermo King refrigeration unit', 'ISZ-NPR-99201', 'NPR75UK-5', 'Isuzu Motors Ltd', '2025-02-14', '2025-03-01', 'Sathosa Motors PLC', 'INV-SM-2025-11', 22000000.00, 2500000.00, 19500000.00, 60, 'straight_line', '2025-03-01', 7, 8, 23, 6175000.00, 15825000.00, '2026-09-30', 'in_use', 'active', 2, NOW(), NOW()),
    (4, 1, 1, 4, 'AST-SRV-004', 'Dell PowerEdge R750xs ERP & Database Server Cluster', '2x Intel Xeon Silver 4314, 256GB RAM, NVMe RAID-10 for Real-time Pharma ERP', 'DLL-PE-884291', 'PowerEdge R750xs', 'Dell Technologies', '2025-04-10', '2025-04-15', 'Singer Computer Systems', 'INV-SC-8812', 4800000.00, 300000.00, 4500000.00, 36, 'straight_line', '2025-05-01', 7, 8, 21, 2125000.00, 2675000.00, '2026-09-30', 'in_use', 'active', 2, NOW(), NOW()),
    (5, 1, 1, 1, 'AST-QC-005', 'Shimadzu UV-1900i Double Beam UV-Vis Spectrophotometer', 'Photometric testing for raw material and active pharmaceutical ingredient testing', 'A1249580019', 'UV-1900i', 'Shimadzu Corporation', '2025-06-20', '2025-07-01', 'Analytical Instruments (Pvt) Ltd', 'INV-AG-10492', 3900000.00, 300000.00, 3600000.00, 60, 'straight_line', '2025-07-01', 7, 8, 21, 900000.00, 3000000.00, '2026-09-30', 'in_use', 'active', 2, NOW(), NOW());
    """
    run_sql(asset_sql)

    # 8. Seed Stock Adjustments & Lines (25 realistic adjustments)
    print("[*] 8. Seeding Stock Adjustments & Lines...")
    run_sql("DELETE FROM stock_adjustment_lines; DELETE FROM stock_adjustment_approvals; DELETE FROM stock_adjustments;")
    
    adjustment_types = ["variance", "damage", "expiry", "sampling", "reclassification"]
    adj_reasons = {
        "variance": ("Annual physical stock audit cycle-count variance", "Physical count adjustment approved by inventory controller"),
        "damage": ("Ampoule breakage reported during warehouse pallet shifting", "Damaged goods segregated and written off"),
        "expiry": ("Quarantine batch exceeded shelf-life prior to distribution", "Expired medication written off following NMRA protocol"),
        "sampling": ("Sample units withdrawn by Quality Control for analytical re-assay", "QC laboratory test samples drawn"),
        "reclassification": ("Reclassification of pack units to hospital dispensing units", "Packaging unit reconciliation")
    }
    
    adj_sqls = []
    line_sqls = []
    
    wh_locations = {1: 1, 2: 6, 3: 11, 4: 16, 5: 21}
    wh_branches = {1: 1, 2: 2, 3: 3, 4: 4, 5: 1}
    
    for idx in range(1, 26):
        adj_num = f"ADJ-2026-{idx:04d}"
        wh_id = ((idx - 1) % 5) + 1
        branch_id = wh_branches[wh_id]
        loc_id = wh_locations[wh_id]
        adj_type = adjustment_types[(idx - 1) % len(adjustment_types)]
        reason, remarks = adj_reasons[adj_type]
        
        # Date between April 2026 and October 2026
        day_offset = (idx * 7) % 180
        adj_date = (datetime(2026, 4, 10) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        prod_id = ((idx * 3) % 65) + 1
        batch_id = ((idx * 7) % 270) + 1
        
        is_in = adj_type in ["reclassification", "variance"] and (idx % 2 == 0)
        direction = "in" if is_in else "out"
        qty = round(random.uniform(10.0, 150.0), 1)
        unit_cost = round(random.uniform(120.0, 950.0), 2)
        total_val = round(qty * unit_cost, 2)
        
        qty_in = qty if direction == "in" else 0.0
        qty_out = qty if direction == "out" else 0.0
        
        approval_status = "approved" if idx <= 20 else ("submitted" if idx <= 23 else "draft")
        posted_status = "posted" if approval_status == "approved" and idx <= 18 else "unposted"
        approved_by = 4 if approval_status == "approved" else "NULL"
        approved_at = f"'{adj_date} 14:30:00'" if approval_status == "approved" else "NULL"
        posted_by = 4 if posted_status == "posted" else "NULL"
        posted_at = f"'{adj_date} 16:00:00'" if posted_status == "posted" else "NULL"
        
        adj_sqls.append(f"""
        INSERT INTO stock_adjustments (id, company_id, branch_id, warehouse_id, financial_year_id, accounting_period_id, adjustment_number, adjustment_date, adjustment_type, reference_number, reason, remarks, total_quantity_in, total_quantity_out, total_stock_value, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, {wh_id}, 4, {period_id}, '{adj_num}', '{adj_date}', '{adj_type}', 'REF-ADJ-{idx:03d}', {escape_sql(reason)}, {escape_sql(remarks)}, {qty_in}, {qty_out}, {total_val}, '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 4, NOW(), NOW());
        """)
        
        line_sqls.append(f"""
        INSERT INTO stock_adjustment_lines (stock_adjustment_id, warehouse_location_id, product_id, product_batch_id, adjustment_direction, quantity, unit_cost, total_cost, system_quantity, physical_quantity, variance_quantity, line_reason, line_remarks, line_order, created_at, updated_at)
        VALUES ({idx}, {loc_id}, {prod_id}, {batch_id}, '{direction}', {qty}, {unit_cost}, {total_val}, {qty + 5.0}, {qty}, 5.0, {escape_sql(reason)}, {escape_sql(remarks)}, 1, NOW(), NOW());
        """)
    
    run_sql(";\n".join(adj_sqls))
    run_sql(";\n".join(line_sqls))

    # 9. Seed Opening Stock Entries & Lines
    print("[*] 9. Seeding Opening Stock Entries & Lines...")
    run_sql("DELETE FROM opening_stock_entry_lines; DELETE FROM opening_stock_entry_approvals; DELETE FROM opening_stock_entries;")
    
    op_sqls = []
    op_line_sqls = []
    
    for idx in range(1, 16):
        op_num = f"OS-2026-{idx:04d}"
        wh_id = ((idx - 1) % 5) + 1
        branch_id = wh_branches[wh_id]
        loc_id = wh_locations[wh_id]
        op_date = "2026-04-01"
        
        prod_id = ((idx * 4) % 65) + 1
        batch_id = ((idx * 8) % 270) + 1
        qty = round(random.uniform(500.0, 2500.0), 1)
        unit_cost = round(random.uniform(150.0, 750.0), 2)
        total_val = round(qty * unit_cost, 2)
        
        op_sqls.append(f"""
        INSERT INTO opening_stock_entries (id, company_id, branch_id, financial_year_id, accounting_period_id, opening_stock_number, opening_stock_date, warehouse_id, reference_number, remarks, total_quantity, total_stock_value, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, 4, 37, '{op_num}', '{op_date}', {wh_id}, 'AUDIT-OS-2026', 'Opening pharmaceutical inventory migration from legacy ERP', {qty}, {total_val}, 'approved', 1, '{op_date} 10:00:00', 'posted', 1, '{op_date} 11:00:00', 'active', 4, NOW(), NOW());
        """)
        
        op_line_sqls.append(f"""
        INSERT INTO opening_stock_entry_lines (opening_stock_entry_id, warehouse_location_id, product_id, product_batch_id, quantity, unit_cost, total_cost, expiry_date, line_remarks, line_order, created_at, updated_at)
        VALUES ({idx}, {loc_id}, {prod_id}, {batch_id}, {qty}, {unit_cost}, {total_val}, '2027-12-31', 'Verified opening physical inventory balance', 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(op_sqls))
    run_sql(";\n".join(op_line_sqls))

    # 10. Seed Stock Transfers & Lines
    print("[*] 10. Seeding Stock Transfers & Lines...")
    run_sql("DELETE FROM stock_transfer_lines; DELETE FROM stock_transfer_approvals; DELETE FROM stock_transfers;")
    
    trf_sqls = []
    trf_line_sqls = []
    
    transfer_routes = [
        (1, 2, "Colombo Central to Kandy Distribution Hub"),
        (1, 3, "Colombo Central to Galle Southern Warehouse"),
        (4, 1, "Biyagama Cold Chain Vaccines to Colombo Central"),
        (1, 5, "Colombo Central to Quarantine Inspection Holding"),
        (4, 2, "Biyagama Cold Chain to Kandy Cold Storage"),
        (2, 1, "Kandy Stock Return to Colombo Central"),
        (3, 1, "Galle Regional Redistribution to Colombo Central")
    ]
    
    for idx in range(1, 21):
        trf_num = f"TRF-2026-{idx:04d}"
        from_wh, to_wh, route_name = transfer_routes[(idx - 1) % len(transfer_routes)]
        branch_id = wh_branches[from_wh]
        from_loc = wh_locations[from_wh]
        to_loc = wh_locations[to_wh]
        
        day_offset = (idx * 8) % 180
        trf_date = (datetime(2026, 4, 15) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        prod_id = ((idx * 2) % 65) + 1
        batch_id = ((idx * 5) % 270) + 1
        qty = round(random.uniform(100.0, 800.0), 1)
        unit_cost = round(random.uniform(220.0, 1100.0), 2)
        total_val = round(qty * unit_cost, 2)
        
        approval_status = "approved" if idx <= 16 else ("submitted" if idx <= 18 else "draft")
        posted_status = "posted" if approval_status == "approved" and idx <= 14 else "unposted"
        approved_by = 4 if approval_status == "approved" else "NULL"
        approved_at = f"'{trf_date} 11:30:00'" if approval_status == "approved" else "NULL"
        posted_by = 4 if posted_status == "posted" else "NULL"
        posted_at = f"'{trf_date} 15:00:00'" if posted_status == "posted" else "NULL"
        
        trf_sqls.append(f"""
        INSERT INTO stock_transfers (id, company_id, branch_id, from_warehouse_id, to_warehouse_id, financial_year_id, accounting_period_id, transfer_number, transfer_date, reference_number, remarks, total_quantity, total_stock_value, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, {from_wh}, {to_wh}, 4, {period_id}, '{trf_num}', '{trf_date}', 'TR-REQ-{idx:03d}', {escape_sql(route_name)}, {qty}, {total_val}, '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 4, NOW(), NOW());
        """)
        
        trf_line_sqls.append(f"""
        INSERT INTO stock_transfer_lines (stock_transfer_id, from_warehouse_location_id, to_warehouse_location_id, product_id, product_batch_id, quantity, unit_cost, total_cost, line_remarks, line_order, created_at, updated_at)
        VALUES ({idx}, {from_loc}, {to_loc}, {prod_id}, {batch_id}, {qty}, {unit_cost}, {total_val}, {escape_sql(route_name)}, 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(trf_sqls))
    run_sql(";\n".join(trf_line_sqls))

    # 11. Seed Purchase Returns & Lines
    print("[*] 11. Seeding Purchase Returns & Lines...")
    run_sql("DELETE FROM purchase_return_lines; DELETE FROM purchase_return_approvals; DELETE FROM purchase_returns;")
    
    pr_sqls = []
    pr_line_sqls = []
    
    pr_reasons = [
        "Defective packaging seal noticed upon delivery unloading",
        "Short expiry delivered (< 6 months shelf-life remaining)",
        "Temperature logger excursion registered on cold-chain shipment",
        "Assay certificate mismatch with NMRA approved dossier",
        "Broken ampoules and leaking vials during maritime transport"
    ]
    
    for idx in range(1, 16):
        pr_num = f"PR-2026-{idx:04d}"
        supp_id = ((idx - 1) % 12) + 1
        wh_id = ((idx - 1) % 4) + 1
        branch_id = wh_branches[wh_id]
        loc_id = wh_locations[wh_id]
        reason = pr_reasons[(idx - 1) % len(pr_reasons)]
        
        day_offset = (idx * 11) % 180
        pr_date = (datetime(2026, 4, 20) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        prod_id = ((idx * 3) % 65) + 1
        batch_id = ((idx * 6) % 270) + 1
        qty = round(random.uniform(20.0, 200.0), 1)
        unit_cost = round(random.uniform(250.0, 1400.0), 2)
        subtotal = round(qty * unit_cost, 2)
        tax = round(subtotal * 0.08, 2)
        total_val = round(subtotal + tax, 2)
        
        approval_status = "approved" if idx <= 12 else ("submitted" if idx <= 14 else "draft")
        posted_status = "posted" if approval_status == "approved" and idx <= 10 else "unposted"
        approved_by = 1 if approval_status == "approved" else "NULL"
        approved_at = f"'{pr_date} 10:00:00'" if approval_status == "approved" else "NULL"
        posted_by = 1 if posted_status == "posted" else "NULL"
        posted_at = f"'{pr_date} 12:00:00'" if posted_status == "posted" else "NULL"
        
        pr_sqls.append(f"""
        INSERT INTO purchase_returns (id, company_id, branch_id, supplier_id, warehouse_id, goods_receipt_note_id, financial_year_id, accounting_period_id, return_number, return_date, reference_number, remarks, total_quantity, subtotal_amount, tax_amount, total_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, {supp_id}, {wh_id}, {idx}, 4, {period_id}, '{pr_num}', '{pr_date}', 'PR-REF-{idx:03d}', {escape_sql(reason)}, {qty}, {subtotal}, {tax}, {total_val}, '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 5, NOW(), NOW());
        """)
        
        pr_line_sqls.append(f"""
        INSERT INTO purchase_return_lines (purchase_return_id, goods_receipt_note_line_id, warehouse_location_id, product_id, product_batch_id, return_quantity, unit_cost, tax_amount, line_total, return_reason, line_remarks, line_order, created_at, updated_at)
        VALUES ({idx}, {idx}, {loc_id}, {prod_id}, {batch_id}, {qty}, {unit_cost}, {tax}, {total_val}, {escape_sql(reason)}, {escape_sql(reason)}, 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(pr_sqls))
    run_sql(";\n".join(pr_line_sqls))

    # 12. Seed Sales Returns & Lines
    print("[*] 12. Seeding Sales Returns & Lines...")
    run_sql("DELETE FROM sales_return_lines; DELETE FROM sales_return_approvals; DELETE FROM sales_returns;")
    
    sr_sqls = []
    sr_line_sqls = []
    
    sr_reasons = [
        ("Customer over-ordered for ward stock", "resellable"),
        ("Minor outer carton crush during last-mile transit", "damaged"),
        ("Customer returned near-expiry stock per distribution agreement", "quarantine"),
        ("Hospital surgical schedule cancelled, returned unopened packs", "resellable"),
        ("Incorrect formulation strength delivered against order", "resellable")
    ]
    
    for idx in range(1, 16):
        sr_num = f"SR-2026-{idx:04d}"
        cust_id = ((idx * 2) % 35) + 1
        wh_id = ((idx - 1) % 4) + 1
        branch_id = wh_branches[wh_id]
        loc_id = wh_locations[wh_id]
        reason, cond = sr_reasons[(idx - 1) % len(sr_reasons)]
        
        day_offset = (idx * 12) % 180
        sr_date = (datetime(2026, 4, 25) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        prod_id = ((idx * 3) % 65) + 1
        batch_id = ((idx * 5) % 270) + 1
        qty = round(random.uniform(15.0, 180.0), 1)
        unit_price = round(random.uniform(400.0, 1800.0), 2)
        unit_cost = round(unit_price * 0.7, 2)
        
        subtotal = round(qty * unit_price, 2)
        tax = round(subtotal * 0.08, 2)
        total_val = round(subtotal + tax, 2)
        total_cost = round(qty * unit_cost, 2)
        
        approval_status = "approved" if idx <= 12 else ("submitted" if idx <= 14 else "draft")
        posted_status = "posted" if approval_status == "approved" and idx <= 10 else "unposted"
        approved_by = 8 if approval_status == "approved" else "NULL"
        approved_at = f"'{sr_date} 14:00:00'" if approval_status == "approved" else "NULL"
        posted_by = 8 if posted_status == "posted" else "NULL"
        posted_at = f"'{sr_date} 16:30:00'" if posted_status == "posted" else "NULL"
        
        sr_sqls.append(f"""
        INSERT INTO sales_returns (id, company_id, branch_id, warehouse_id, customer_id, sales_invoice_id, financial_year_id, accounting_period_id, sales_return_number, sales_return_date, customer_name, customer_contact_number, sales_invoice_number, reference_number, return_reason, return_condition, remarks, total_quantity, subtotal_amount, discount_amount, tax_amount, total_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, {wh_id}, {cust_id}, {idx}, 4, {period_id}, '{sr_num}', '{sr_date}', 'Customer Account #{cust_id}', '+94 11 2000000', 'INV-2026-{idx:04d}', 'SR-REF-{idx:03d}', {escape_sql(reason)}, '{cond}', {escape_sql(reason)}, {qty}, {subtotal}, 0.00, {tax}, {total_val}, '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 9, NOW(), NOW());
        """)
        
        sr_line_sqls.append(f"""
        INSERT INTO sales_return_lines (sales_return_id, warehouse_location_id, product_id, product_batch_id, return_quantity, unit_price, discount_amount, tax_amount, line_total, stock_unit_cost, stock_total_cost, return_reason, return_condition, line_remarks, line_order, created_at, updated_at)
        VALUES ({idx}, {loc_id}, {prod_id}, {batch_id}, {qty}, {unit_price}, 0.00, {tax}, {total_val}, {unit_cost}, {total_cost}, {escape_sql(reason)}, '{cond}', {escape_sql(reason)}, 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(sr_sqls))
    run_sql(";\n".join(sr_line_sqls))

    # 13. Seed Credit Notes & Debit Notes
    print("[*] 13. Seeding Credit Notes & Debit Notes in Invoice Center...")
    run_sql("DELETE FROM credit_note_lines; DELETE FROM credit_note_approvals; DELETE FROM credit_notes;")
    run_sql("DELETE FROM debit_note_lines; DELETE FROM debit_note_approvals; DELETE FROM debit_notes;")
    
    cn_sqls = []
    cn_line_sqls = []
    dn_sqls = []
    dn_line_sqls = []
    
    for idx in range(1, 16):
        cn_num = f"CN-2026-{idx:04d}"
        dn_num = f"DN-2026-{idx:04d}"
        cust_id = ((idx * 2) % 35) + 1
        branch_id = ((idx - 1) % 5) + 1
        
        day_offset = (idx * 10) % 180
        doc_date = (datetime(2026, 4, 22) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        prod_id = ((idx * 3) % 65) + 1
        qty = round(random.uniform(10.0, 100.0), 1)
        rate = round(random.uniform(500.0, 2000.0), 2)
        subtotal = round(qty * rate, 2)
        tax = round(subtotal * 0.08, 2)
        total = round(subtotal + tax, 2)
        
        approval_status = "approved" if idx <= 12 else "submitted"
        posted_status = "posted" if approval_status == "approved" else "unposted"
        approved_by = 2 if approval_status == "approved" else "NULL"
        approved_at = f"'{doc_date} 11:00:00'" if approval_status == "approved" else "NULL"
        posted_by = 2 if posted_status == "posted" else "NULL"
        posted_at = f"'{doc_date} 14:00:00'" if posted_status == "posted" else "NULL"
        
        cn_sqls.append(f"""
        INSERT INTO credit_notes (id, company_id, branch_id, customer_id, sales_invoice_id, financial_year_id, accounting_period_id, credit_note_number, credit_note_date, credit_note_type, reference_number, reason, remarks, subtotal_amount, discount_amount, tax_amount, total_amount, allocated_value, finance_post_status, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, {cust_id}, {idx}, 4, {period_id}, '{cn_num}', '{doc_date}', 'sales_return', 'CN-REF-{idx:03d}', 'Credit memo issued for verified product return', 'Approved by finance & credit control', {subtotal}, 0.00, {tax}, {total}, {total}, 'posted', '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 9, NOW(), NOW());
        """)
        
        cn_line_sqls.append(f"""
        INSERT INTO credit_note_lines (credit_note_id, product_id, description, quantity, unit_price, discount_amount, tax_amount, line_total, line_order, created_at, updated_at)
        VALUES ({idx}, {prod_id}, 'Authorized credit adjustment line', {qty}, {rate}, 0.00, {tax}, {total}, 1, NOW(), NOW());
        """)
        
        dn_sqls.append(f"""
        INSERT INTO debit_notes (id, company_id, branch_id, customer_id, sales_invoice_id, financial_year_id, accounting_period_id, debit_note_number, debit_note_date, debit_note_type, reference_number, reason, remarks, subtotal_amount, discount_amount, tax_amount, total_amount, finance_post_status, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, {cust_id}, {idx}, 4, {period_id}, '{dn_num}', '{doc_date}', 'price_adjustment', 'DN-REF-{idx:03d}', 'Differential tariff adjustment & special handling charge', 'Authorized supplementary billing', {subtotal}, 0.00, {tax}, {total}, 'posted', '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 9, NOW(), NOW());
        """)
        
        dn_line_sqls.append(f"""
        INSERT INTO debit_note_lines (debit_note_id, product_id, description, quantity, unit_price, discount_amount, tax_amount, line_total, line_order, created_at, updated_at)
        VALUES ({idx}, {prod_id}, 'Differential handling charge debit line', {qty}, {rate}, 0.00, {tax}, {total}, 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(cn_sqls))
    run_sql(";\n".join(cn_line_sqls))
    run_sql(";\n".join(dn_sqls))
    run_sql(";\n".join(dn_line_sqls))

    # 14. Seed Payment Vouchers & Lines (25 realistic vouchers)
    print("[*] 14. Seeding Payment Vouchers & Lines in Finance...")
    run_sql("DELETE FROM payment_voucher_lines; DELETE FROM payment_voucher_approvals; DELETE FROM payment_vouchers;")
    
    pv_sqls = []
    pv_line_sqls = []
    
    pay_descriptions = [
        ("Settlement for bulk pharmaceuticals supply consignment", 9, "supplier_payment", "bank_transfer"),
        ("Monthly warehouse lease rental & cold-storage premises", 20, "expense", "bank_transfer"),
        ("Commercial electricity & refrigeration power billing", 21, "expense", "bank_transfer"),
        ("Refrigerated fleet fuel & logistics delivery charges", 23, "expense", "bank_transfer"),
        ("Laboratory QC testing & external assay certification", 21, "expense", "cheque"),
        ("Packaging & tamper-proof carton materials procurement", 17, "expense", "cheque")
    ]
    
    for idx in range(1, 26):
        pv_num = f"PV-2026-{idx:04d}"
        branch_id = ((idx - 1) % 5) + 1
        desc, acct_id, ptype, pmethod = pay_descriptions[(idx - 1) % len(pay_descriptions)]
        supp_id = ((idx - 1) % 12) + 1 if ptype == "supplier_payment" else "NULL"
        
        day_offset = (idx * 7) % 180
        pdate = (datetime(2026, 4, 18) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        amt = round(random.uniform(75000.0, 1850000.0), 2)
        cheque_no = f"'CHQ-990{idx:03d}'" if pmethod == "cheque" else "NULL"
        cheque_date = f"'{pdate}'" if pmethod == "cheque" else "NULL"
        
        approval_status = "approved" if idx <= 20 else ("submitted" if idx <= 23 else "draft")
        posted_status = "posted" if approval_status == "approved" and idx <= 18 else "unposted"
        approved_by = 2 if approval_status == "approved" else "NULL"
        approved_at = f"'{pdate} 10:30:00'" if approval_status == "approved" else "NULL"
        posted_by = 2 if posted_status == "posted" else "NULL"
        posted_at = f"'{pdate} 14:00:00'" if posted_status == "posted" else "NULL"
        
        pv_sqls.append(f"""
        INSERT INTO payment_vouchers (id, company_id, branch_id, financial_year_id, accounting_period_id, voucher_number, payment_date, payment_type, payment_method, supplier_id, paid_from_account_id, cheque_number, cheque_date, reference_number, description, total_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, 4, {period_id}, '{pv_num}', '{pdate}', '{ptype}', '{pmethod}', {supp_id}, 3, {cheque_no}, {cheque_date}, 'PV-REF-{idx:03d}', {escape_sql(desc)}, {amt}, '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 3, NOW(), NOW());
        """)
        
        pv_line_sqls.append(f"""
        INSERT INTO payment_voucher_lines (payment_voucher_id, account_id, line_description, amount, line_order, created_at, updated_at)
        VALUES ({idx}, {acct_id}, {escape_sql(desc)}, {amt}, 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(pv_sqls))
    run_sql(";\n".join(pv_line_sqls))

    # 15. Seed Receipt Vouchers & Lines (25 realistic vouchers)
    print("[*] 15. Seeding Receipt Vouchers & Lines in Finance...")
    run_sql("DELETE FROM receipt_voucher_lines; DELETE FROM receipt_voucher_approvals; DELETE FROM receipt_vouchers;")
    
    rv_sqls = []
    rv_line_sqls = []
    
    rcpt_descriptions = [
        ("Settlement received for inpatient pharmaceutical invoices", 4, "customer_receipt", "bank_transfer"),
        ("Wholesale hospital distribution payment credit transfer", 4, "customer_receipt", "bank_transfer"),
        ("Retail chain bulk order settlement via electronic fund transfer", 4, "customer_receipt", "bank_transfer"),
        ("Interest earned on short-term pharmaceutical treasury deposits", 15, "other_income", "bank_transfer"),
        ("Counter cash collection banking from regional retail sales", 4, "customer_receipt", "cash"),
        ("Cheque realization for surgical drugs supply tender", 4, "customer_receipt", "cheque")
    ]
    
    for idx in range(1, 26):
        rv_num = f"RV-2026-{idx:04d}"
        branch_id = ((idx - 1) % 5) + 1
        desc, acct_id, rtype, rmethod = rcpt_descriptions[(idx - 1) % len(rcpt_descriptions)]
        cust_id = ((idx * 2) % 35) + 1 if rtype == "customer_receipt" else "NULL"
        
        day_offset = (idx * 7) % 180
        rdate = (datetime(2026, 4, 19) + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        period_id = 37 + min(day_offset // 30, 6)
        
        amt = round(random.uniform(95000.0, 2400000.0), 2)
        cheque_no = f"'CHQ-RCV-{idx:03d}'" if rmethod == "cheque" else "NULL"
        cheque_date = f"'{rdate}'" if rmethod == "cheque" else "NULL"
        
        approval_status = "approved" if idx <= 20 else ("submitted" if idx <= 23 else "draft")
        posted_status = "posted" if approval_status == "approved" and idx <= 18 else "unposted"
        approved_by = 2 if approval_status == "approved" else "NULL"
        approved_at = f"'{rdate} 11:30:00'" if approval_status == "approved" else "NULL"
        posted_by = 2 if posted_status == "posted" else "NULL"
        posted_at = f"'{rdate} 15:00:00'" if posted_status == "posted" else "NULL"
        
        rv_sqls.append(f"""
        INSERT INTO receipt_vouchers (id, company_id, branch_id, financial_year_id, accounting_period_id, receipt_number, receipt_date, receipt_type, receipt_method, customer_id, received_to_account_id, cheque_number, cheque_date, reference_number, description, total_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, created_at, updated_at)
        VALUES ({idx}, 1, {branch_id}, 4, {period_id}, '{rv_num}', '{rdate}', '{rtype}', '{rmethod}', {cust_id}, 3, {cheque_no}, {cheque_date}, 'RV-REF-{idx:03d}', {escape_sql(desc)}, {amt}, '{approval_status}', {approved_by}, {approved_at}, '{posted_status}', {posted_by}, {posted_at}, 'active', 3, NOW(), NOW());
        """)
        
        rv_line_sqls.append(f"""
        INSERT INTO receipt_voucher_lines (receipt_voucher_id, account_id, line_description, amount, line_order, created_at, updated_at)
        VALUES ({idx}, {acct_id}, {escape_sql(desc)}, {amt}, 1, NOW(), NOW());
        """)
        
    run_sql(";\n".join(rv_sqls))
    run_sql(";\n".join(rv_line_sqls))

    print("[+] Successfully seeded all system views across Ceylon Med Pharma ERP!")

if __name__ == "__main__":
    main()
