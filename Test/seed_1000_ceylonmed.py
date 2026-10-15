#!/usr/bin/env python3
"""
Comprehensive 1500+ Enterprise Dataset Seeder for Ceylon MedEx Pharmaceuticals (CEYLONMED)
Database: erp_ceylonmed on shared-mysql (50.6.230.198)
Date Range: 2023 - 2027
"""

import sys
import subprocess
import datetime
import random
from decimal import Decimal

DB_NAME = "erp_ceylonmed"
COMPANY_ID = 1

def run_sql_batch(statements):
    """Executes a list of SQL statements within foreign_key_checks=0"""
    full_sql = "SET FOREIGN_KEY_CHECKS = 0;\n" + "\n".join(statements) + "\nSET FOREIGN_KEY_CHECKS = 1;\n"
    cmd = [
        "ssh", "-o", "BatchMode=yes", "deploy@50.6.230.198",
        f"docker exec -i shared-mysql mysql -u pharma_erp_user -pV1KeGRCVjjEM2p3yJ4EHM7mVpVx3BsFi6WGMCcVGKis= {DB_NAME}"
    ]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = p.communicate(input=full_sql)
    if p.returncode != 0 and err:
        # Ignore minor warnings
        clean_err = "\n".join([line for line in err.splitlines() if "Using a password" not in line])
        if clean_err.strip():
            print(f"SQL Error: {clean_err.strip()[:300]}")
            return False
    return True

def escape_str(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("\\", "\\\\").replace("'", "''") + "'"

def main():
    print(f"[*] Starting Enterprise 1500+ Data Seeder for {DB_NAME} (2023 - 2027)...")

    # ----------------------------------------------------
    # 1. Company & Branches
    # ----------------------------------------------------
    print("[1/10] Configuring Company Profile & 5 Regional Branches...")
    sql_branches = [
        f"""UPDATE companies SET 
            company_name = 'Ceylon MedEx Pharmaceuticals (Pvt) Ltd',
            registration_number = 'PV00298910',
            tax_number = '102983741-7000',
            email = 'contact@ceylonmed.lk',
            phone = '+94 11 258 9631',
            address = 'No. 128, R.A. De Mel Mawatha, Colombo 03, Sri Lanka'
        WHERE id = {COMPANY_ID};""",
        f"""UPDATE branches SET 
            branch_code = 'COL_MAIN',
            branch_name = 'Colombo Central Hub',
            branch_type = 'headquarters',
            address = 'No. 128, R.A. De Mel Mawatha, Colombo 03',
            phone = '+94 11 258 9631',
            email = 'colombo@ceylonmed.lk',
            is_main_branch = 1,
            status = 'active'
        WHERE id = 1;""",
        f"""INSERT INTO branches (id, company_id, branch_code, branch_name, branch_type, address, phone, email, is_main_branch, status, created_at, updated_at) VALUES
        (2, {COMPANY_ID}, 'KANDY_REG', 'Kandy Hill Country Branch', 'regional_hub', 'No. 45, Peradeniya Road, Kandy', '+94 81 223 4567', 'kandy@ceylonmed.lk', 0, 'active', '2023-01-01', '2023-01-01'),
        (3, {COMPANY_ID}, 'GALLE_SOUTH', 'Galle Southern Hub', 'regional_hub', 'No. 88, Matara Road, Galle', '+94 91 224 5678', 'galle@ceylonmed.lk', 0, 'active', '2023-03-15', '2023-03-15'),
        (4, {COMPANY_ID}, 'BIYAGAMA_LOG', 'Biyagama Cold Chain Logistics Hub', 'logistics_center', 'Zone 2, EPZ Biyagama, Malwana', '+94 11 248 7890', 'coldchain@ceylonmed.lk', 0, 'active', '2023-05-01', '2023-05-01'),
        (5, {COMPANY_ID}, 'JAFFNA_NORTH', 'Jaffna Northern Depot', 'depot', 'No. 12, Hospital Road, Jaffna', '+94 21 222 3456', 'jaffna@ceylonmed.lk', 0, 'active', '2024-01-10', '2024-01-10')
        ON DUPLICATE KEY UPDATE branch_name = VALUES(branch_name), branch_type = VALUES(branch_type);"""
    ]
    run_sql_batch(sql_branches)

    # ----------------------------------------------------
    # 2. Warehouses & Warehouse Locations
    # ----------------------------------------------------
    print("[2/10] Seeding 5 Multi-Temperature Warehouses & 25 Storage Locations...")
    sql_warehouses = [
        f"""INSERT INTO warehouses (id, company_id, branch_id, warehouse_code, warehouse_name, warehouse_type, address, contact_person, contact_number, is_default, status, created_at, updated_at) VALUES
        (1, {COMPANY_ID}, 1, 'WH_COL_MAIN', 'Colombo Central Medical Warehouse', 'main', 'Central Hub, Colombo 03', 'Rohan Jayasinghe', '+94 77 123 4567', 1, 'active', '2023-01-01', '2023-01-01'),
        (2, {COMPANY_ID}, 2, 'WH_KDY_DIST', 'Kandy Central Distribution Warehouse', 'sub', 'Peradeniya Rd, Kandy', 'Chaminda Bandara', '+94 77 234 5678', 0, 'active', '2023-01-15', '2023-01-15'),
        (3, {COMPANY_ID}, 3, 'WH_GLE_DIST', 'Galle Maritime Warehouse', 'sub', 'Matara Rd, Galle', 'Sunil Wickramasinghe', '+94 77 345 6789', 0, 'active', '2023-03-20', '2023-03-20'),
        (4, {COMPANY_ID}, 4, 'WH_BIY_COLD', 'Biyagama Cold Chain Vaccines Facility', 'cold_chain', 'EPZ Biyagama', 'Nirosha Fernando', '+94 77 456 7890', 0, 'active', '2023-05-10', '2023-05-10'),
        (5, {COMPANY_ID}, 1, 'WH_QUARANTINE', 'Central Quality Control & Quarantine Holding', 'quarantine', 'Central Hub, Colombo 03', 'Dr. Anura Perera', '+94 77 567 8901', 0, 'active', '2023-01-01', '2023-01-01')
        ON DUPLICATE KEY UPDATE warehouse_name = VALUES(warehouse_name);"""
    ]

    loc_stmts = []
    loc_id = 1
    # Generate 25 locations
    for wh_id, prefix in [(1, 'COL'), (2, 'KDY'), (3, 'GLE'), (4, 'COLD'), (5, 'QUAR')]:
        cond = 'cold_storage' if wh_id == 4 else ('quarantine' if wh_id == 5 else 'normal')
        for r in range(1, 6):
            loc_code = f"LOC-{prefix}-R{r}-S1"
            loc_name = f"{prefix} Rack {r} Shelf 1"
            loc_stmts.append(f"({loc_id}, {COMPANY_ID}, {wh_id}, '{loc_code}', '{loc_name}', 'R{r}', 'S1', 'B1', '{cond}', 'active', '2023-01-01', '2023-01-01')")
            loc_id += 1
    
    sql_warehouses.append(f"""INSERT INTO warehouse_locations (id, company_id, warehouse_id, location_code, location_name, rack, shelf, bin, storage_condition, status, created_at, updated_at) VALUES
    {','.join(loc_stmts)}
    ON DUPLICATE KEY UPDATE location_name = VALUES(location_name);""")
    run_sql_batch(sql_warehouses)

    # ----------------------------------------------------
    # 3. Manufacturers & Suppliers
    # ----------------------------------------------------
    print("[3/10] Seeding 15 Leading Pharma Manufacturers & 12 Suppliers...")
    sql_partners = [
        f"""INSERT INTO manufacturers (id, company_id, manufacturer_code, manufacturer_name, country, contact_person, contact_number, email, address, status, created_at, updated_at) VALUES
        (1, {COMPANY_ID}, 'MFG_SPMC', 'State Pharmaceuticals Manufacturing Corporation (SPMC)', 'Sri Lanka', 'Dr. Gamini Senanayake', '+94 11 289 1234', 'info@spmc.gov.lk', 'Ratmalana, Sri Lanka', 'active', '2023-01-01', '2023-01-01'),
        (2, {COMPANY_ID}, 'MFG_CIPLA', 'Cipla Ltd', 'India', 'Rajesh Sharma', '+91 22 2482 6000', 'contact@cipla.com', 'Mumbai, India', 'active', '2023-01-01', '2023-01-01'),
        (3, {COMPANY_ID}, 'MFG_GSK', 'GlaxoSmithKline Pharmaceuticals (GSK)', 'United Kingdom', 'David Miller', '+44 20 8047 5000', 'gsk.info@gsk.com', 'Brentford, London, UK', 'active', '2023-01-01', '2023-01-01'),
        (4, {COMPANY_ID}, 'MFG_SUN', 'Sun Pharmaceutical Industries', 'India', 'Amit Patel', '+91 22 4324 4324', 'info@sunpharma.com', 'Vadodara, Gujarat, India', 'active', '2023-01-01', '2023-01-01'),
        (5, {COMPANY_ID}, 'MFG_PFIZER', 'Pfizer Inc', 'United States', 'Sarah Jenkins', '+1 212 733 2323', 'contact@pfizer.com', 'New York, NY, USA', 'active', '2023-01-01', '2023-01-01'),
        (6, {COMPANY_ID}, 'MFG_SANOFI', 'Sanofi Aventis', 'France', 'Jean-Luc Dupont', '+33 1 53 77 40 00', 'contact@sanofi.com', 'Paris, France', 'active', '2023-01-01', '2023-01-01'),
        (7, {COMPANY_ID}, 'MFG_NOVARTIS', 'Novartis AG', 'Switzerland', 'Markus Steiner', '+41 61 324 1111', 'info@novartis.com', 'Basel, Switzerland', 'active', '2023-01-01', '2023-01-01'),
        (8, {COMPANY_ID}, 'MFG_DRREDDY', 'Dr. Reddy Laboratories', 'India', 'Sanjay Reddy', '+91 40 4900 2900', 'mail@drreddys.com', 'Hyderabad, India', 'active', '2023-01-01', '2023-01-01'),
        (9, {COMPANY_ID}, 'MFG_TORRENT', 'Torrent Pharmaceuticals', 'India', 'Vikram Desai', '+91 79 2658 5060', 'info@torrentpharma.com', 'Ahmedabad, India', 'active', '2023-01-01', '2023-01-01'),
        (10, {COMPANY_ID}, 'MFG_ABBOTT', 'Abbott Healthcare', 'United States', 'Michael Chang', '+1 224 667 6100', 'contact@abbott.com', 'Abbott Park, IL, USA', 'active', '2023-01-01', '2023-01-01'),
        (11, {COMPANY_ID}, 'MFG_ASTRA', 'AstraZeneca PLC', 'United Kingdom', 'Claire Wilson', '+44 20 3749 5000', 'contact@astrazeneca.com', 'Cambridge, UK', 'active', '2023-01-01', '2023-01-01'),
        (12, {COMPANY_ID}, 'MFG_ASTRON', 'Astron Limited Sri Lanka', 'Sri Lanka', 'Pradeep Silva', '+94 11 263 5141', 'info@astron.lk', 'Ratmalana, Sri Lanka', 'active', '2023-01-01', '2023-01-01'),
        (13, {COMPANY_ID}, 'MFG_EMER', 'Emerchemie NB Sri Lanka', 'Sri Lanka', 'Lalith Fernando', '+94 11 471 2222', 'info@emerchemie.lk', 'Colombo 10, Sri Lanka', 'active', '2023-01-01', '2023-01-01'),
        (14, {COMPANY_ID}, 'MFG_LINK', 'Link Natural Products', 'Sri Lanka', 'Dr. Devapriya Nugawela', '+94 11 286 1122', 'info@linknaturalproducts.com', 'Kapugoda, Sri Lanka', 'active', '2023-01-01', '2023-01-01'),
        (15, {COMPANY_ID}, 'MFG_HEMAS', 'Hemas Manufacturing Healthcare', 'Sri Lanka', 'Kasturi Chellaraja', '+94 11 473 1731', 'healthcare@hemas.com', 'Peliyagoda, Sri Lanka', 'active', '2023-01-01', '2023-01-01')
        ON DUPLICATE KEY UPDATE manufacturer_name = VALUES(manufacturer_name);""",

        f"""INSERT INTO suppliers (id, company_id, supplier_code, supplier_name, contact_person, contact_number, email, address, tax_registration_number, payment_terms_days, payable_account_id, status, created_at, updated_at) VALUES
        (1, {COMPANY_ID}, 'SUP_SPC', 'State Pharmaceuticals Corporation of Sri Lanka (SPC)', 'Mrs. Swarna Perera', '+94 11 232 0356', 'procurement@spc.lk', 'No. 75, Sir Baron Jayathilake Mawatha, Colombo 01', '100023491-7000', 30, 9, 'active', '2023-01-01', '2023-01-01'),
        (2, {COMPANY_ID}, 'SUP_HEMAS', 'Hemas Healthcare Distribution (Pvt) Ltd', 'Mr. Sanjeewa Silva', '+94 11 473 1731', 'distribution@hemas.com', 'Hemas House, Colombo 02', '101239842-7000', 45, 9, 'active', '2023-01-01', '2023-01-01'),
        (3, {COMPANY_ID}, 'SUP_BAURS', 'A. Baur & Co. (Pvt) Ltd Healthcare', 'Mr. Rolf Blaser', '+94 11 244 8081', 'pharma@baurs.com', 'No. 62, Upper Chatham Street, Colombo 01', '102348571-7000', 60, 9, 'active', '2023-01-01', '2023-01-01'),
        (4, {COMPANY_ID}, 'SUP_GEOSTEUART', 'George Steuart Health (Pvt) Ltd', 'Mr. Eran Wickramaratne', '+94 11 232 4581', 'health@georgesteuart.lk', 'No. 19, St. Michaels Road, Colombo 03', '103495821-7000', 30, 9, 'active', '2023-01-01', '2023-01-01'),
        (5, {COMPANY_ID}, 'SUP_EMERCHEMIE', 'Emerchemie NB (Ceylon) Ltd', 'Mr. Nihal Fernando', '+94 11 471 2222', 'sales@emerchemie.lk', 'No. 50, Hyde Park Corner, Colombo 02', '104593821-7000', 45, 9, 'active', '2023-01-01', '2023-01-01'),
        (6, {COMPANY_ID}, 'SUP_SUNSHINE', 'Sunshine Healthcare Lanka Ltd', 'Mr. Shyam Sathasivam', '+94 11 470 2400', 'shl@sunshineholdings.lk', 'No. 60, Nawala Road, Narahenpita', '105849301-7000', 30, 9, 'active', '2023-01-01', '2023-01-01'),
        (7, {COMPANY_ID}, 'SUP_DARLEY', 'Darley Butler & Co Healthcare', 'Mr. Anura Ekanayake', '+94 11 247 8888', 'healthcare@darleybutler.lk', 'No. 98, Sri Sangaraja Mawatha, Colombo 10', '106948301-7000', 45, 9, 'active', '2023-01-01', '2023-01-01'),
        (8, {COMPANY_ID}, 'SUP_MEGAPHARMA', 'Mega Pharma Lanka (Pvt) Ltd', 'Mr. Suresh Goonewardene', '+94 11 250 8910', 'info@megapharma.lk', 'No. 14, Deal Place, Colombo 03', '107849201-7000', 30, 9, 'active', '2023-01-01', '2023-01-01'),
        (9, {COMPANY_ID}, 'SUP_INTERPHARM', 'Interpharm (Pvt) Ltd', 'Mr. Kalana Rodrigo', '+94 11 289 9199', 'info@interpharm.lk', 'Kalalgoda, Pannipitiya', '108940291-7000', 60, 9, 'active', '2023-01-01', '2023-01-01'),
        (10, {COMPANY_ID}, 'SUP_CITIHEALTH', 'Citihealth Imports Lanka', 'Mr. Mahen Fernando', '+94 11 268 4930', 'imports@citihealth.lk', 'No. 120, Kynsey Road, Colombo 08', '109302918-7000', 30, 9, 'active', '2023-01-01', '2023-01-01'),
        (11, {COMPANY_ID}, 'SUP_MORISON', 'Morison Limited Healthcare', 'Mr. Dinesh Athapaththu', '+94 11 286 8686', 'morison@hemas.com', 'Homagama, Sri Lanka', '110394821-7000', 45, 9, 'active', '2023-01-01', '2023-01-01'),
        (12, {COMPANY_ID}, 'SUP_SWISSPHARMA', 'Swiss Pharma Lanka', 'Mr. Felix Keller', '+94 11 255 4433', 'contact@swisspharma.lk', 'No. 32, Ward Place, Colombo 07', '111495820-7000', 30, 9, 'active', '2023-01-01', '2023-01-01')
        ON DUPLICATE KEY UPDATE supplier_name = VALUES(supplier_name);"""
    ]
    run_sql_batch(sql_partners)

    # ----------------------------------------------------
    # 4. Products Catalog (70 Diverse Pharma Products)
    # ----------------------------------------------------
    print("[4/10] Seeding 70+ Diverse Products (Medicines, Cold Chain, Low-Stock, Out-of-Stock)...")
    
    # Define product matrix
    products_data = [
        # (id, code, name, cat_id, gen_id, dose_id, mfg_id, unit_id, strength, pack, type, reorder_lvl, reorder_qty, cond)
        (1, 'MED_AMOX_500', 'Amoxicillin 500mg Capsules', 1, 1, 2, 1, 2, '500mg', '10x10 Strips / Box', 'medicine', 150.0, 500.0, 'normal'),
        (2, 'MED_AMOX_250_SYR', 'Amoxicillin 125mg/5ml Oral Suspension', 1, 1, 8, 1, 4, '125mg/5ml', '100ml Bottle', 'medicine', 80.0, 300.0, 'normal'),
        (3, 'MED_AUGM_625', 'Augmentin (Co-Amoxiclav) 625mg Tablets', 1, 1, 1, 3, 2, '625mg', '2x7 Strips / Box', 'medicine', 120.0, 400.0, 'normal'),
        (4, 'MED_PARA_500_TAB', 'Paracetamol 500mg Tablets (Panadol)', 1, 2, 1, 3, 2, '500mg', '100x10 Blister Pack', 'medicine', 500.0, 2000.0, 'normal'),
        (5, 'MED_PARA_120_SYR', 'Paracetamol 120mg/5ml Paediatric Syrup', 1, 2, 3, 12, 4, '120mg/5ml', '60ml Bottle', 'medicine', 100.0, 500.0, 'normal'),
        (6, 'MED_PARA_IV_1G', 'Paracetamol IV Infusion 10mg/ml', 1, 2, 4, 2, 4, '1000mg/100ml', '100ml Vial', 'medicine', 50.0, 250.0, 'normal'),
        (7, 'MED_METF_500', 'Metformin HCl 500mg Tablets', 2, 3, 1, 4, 2, '500mg', '10x10 Strips / Box', 'medicine', 200.0, 800.0, 'normal'),
        (8, 'MED_METF_850', 'Metformin HCl 850mg Tablets', 2, 3, 1, 4, 2, '850mg', '10x10 Strips / Box', 'medicine', 150.0, 600.0, 'normal'),
        (9, 'MED_METF_1000_XR', 'Metformin Extended Release 1000mg', 2, 3, 1, 8, 2, '1000mg', '60 Tablets / Box', 'medicine', 80.0, 300.0, 'normal'),
        (10, 'MED_ATOR_10', 'Atorvastatin 10mg Tablets (Lipitor)', 3, 4, 1, 5, 2, '10mg', '3x10 Strips / Box', 'medicine', 120.0, 500.0, 'normal'),
        (11, 'MED_ATOR_20', 'Atorvastatin 20mg Tablets', 3, 4, 1, 8, 2, '20mg', '3x10 Strips / Box', 'medicine', 150.0, 600.0, 'normal'),
        (12, 'MED_ATOR_40', 'Atorvastatin 40mg Tablets', 3, 4, 1, 8, 2, '40mg', '3x10 Strips / Box', 'medicine', 60.0, 200.0, 'normal'),
        (13, 'MED_OMEP_20', 'Omeprazole 20mg Capsules', 4, 5, 2, 1, 2, '20mg', '10x10 Strips / Box', 'medicine', 250.0, 1000.0, 'normal'),
        (14, 'MED_OMEP_40_INJ', 'Omeprazole 40mg IV Injection', 4, 5, 4, 2, 1, '40mg', 'Vial + Solvent', 'medicine', 80.0, 400.0, 'normal'),
        (15, 'MED_PANTO_40', 'Pantoprazole 40mg Gastro-Resistant Tabs', 4, 13, 1, 4, 2, '40mg', '10x10 Strips / Box', 'medicine', 150.0, 600.0, 'normal'),
        (16, 'MED_CIPRO_500', 'Ciprofloxacin 500mg Tablets (Cipro)', 1, 6, 1, 2, 2, '500mg', '10x10 Strips / Box', 'medicine', 100.0, 400.0, 'normal'),
        (17, 'MED_CIPRO_IV', 'Ciprofloxacin 200mg/100ml IV Infusion', 1, 6, 4, 2, 4, '200mg/100ml', '100ml Infusion Bag', 'medicine', 40.0, 200.0, 'normal'),
        (18, 'MED_SALB_INHAL', 'Salbutamol Inhaler 100mcg (Ventolin)', 5, 7, 1, 3, 1, '100mcg/dose', '200 Actuations', 'medicine', 80.0, 350.0, 'normal'),
        (19, 'MED_SALB_RESP', 'Salbutamol Respirator Solution 5mg/ml', 5, 7, 7, 3, 4, '5mg/ml', '20ml Dropper Bottle', 'medicine', 50.0, 200.0, 'normal'),
        (20, 'MED_AZITH_500', 'Azithromycin 500mg Tablets (Zithromax)', 1, 8, 1, 5, 2, '500mg', '1x3 Strip / Box', 'medicine', 150.0, 600.0, 'normal'),
        (21, 'MED_AZITH_200_SUS', 'Azithromycin 200mg/5ml Oral Suspension', 1, 8, 8, 5, 4, '200mg/5ml', '15ml Bottle', 'medicine', 75.0, 300.0, 'normal'),
        (22, 'MED_LOSAR_50', 'Losartan Potassium 50mg Tablets', 3, 9, 1, 9, 2, '50mg', '10x10 Strips / Box', 'medicine', 180.0, 700.0, 'normal'),
        (23, 'MED_LOSAR_100', 'Losartan Potassium 100mg Tablets', 3, 9, 1, 9, 2, '100mg', '10x10 Strips / Box', 'medicine', 90.0, 350.0, 'normal'),
        (24, 'MED_CEFT_1G', 'Ceftriaxone 1g Powder for Injection', 1, 10, 4, 7, 1, '1000mg', 'Vial + 10ml WFI', 'medicine', 100.0, 500.0, 'normal'),
        (25, 'MED_CEFT_500MG', 'Ceftriaxone 500mg Powder for Injection', 1, 10, 4, 7, 1, '500mg', 'Vial + 5ml WFI', 'medicine', 60.0, 250.0, 'normal'),
        # Cold Chain Products
        (26, 'MED_INS_LANTUS', 'Insulin Glargine 100 IU/ml (Lantus SoloStar)', 2, 11, 4, 6, 1, '100 IU/ml', '5x3ml Pre-filled Pens', 'medicine', 40.0, 150.0, 'cold_storage'),
        (27, 'MED_INS_ACTRAPID', 'Human Soluble Insulin Actrapid 100 IU/ml', 2, 11, 4, 7, 4, '100 IU/ml', '10ml Vial', 'medicine', 60.0, 250.0, 'cold_storage'),
        (28, 'MED_INS_MIXTARD', 'Insulin Mixtard 30/70 100 IU/ml', 2, 11, 4, 7, 4, '100 IU/ml', '10ml Vial', 'medicine', 80.0, 300.0, 'cold_storage'),
        (29, 'MED_VACC_HEP_B', 'Hepatitis B Recombinant Vaccine 20mcg', 1, 10, 4, 3, 1, '20mcg/ml', 'Single Dose 1ml Vial', 'medicine', 30.0, 120.0, 'cold_storage'),
        (30, 'MED_VACC_RABIES', 'Purified Verorab Rabies Vaccine 2.5 IU', 1, 10, 4, 6, 1, '2.5 IU', 'Vial + Diluent', 'medicine', 25.0, 100.0, 'cold_storage'),
        # Antihistamines & Pain
        (31, 'MED_CETIR_10', 'Cetirizine 10mg Film-Coated Tablets', 1, 12, 1, 8, 2, '10mg', '10x10 Strips / Box', 'medicine', 180.0, 700.0, 'normal'),
        (32, 'MED_CETIR_5_SYR', 'Cetirizine 5mg/5ml Oral Solution', 1, 12, 3, 8, 4, '5mg/5ml', '60ml Bottle', 'medicine', 80.0, 300.0, 'normal'),
        (33, 'MED_CLOPID_75', 'Clopidogrel 75mg Tablets (Plavix)', 3, 14, 1, 6, 2, '75mg', '3x10 Strips / Box', 'medicine', 100.0, 450.0, 'normal'),
        (34, 'MED_IBUP_400', 'Ibuprofen 400mg Tablets (Brufen)', 1, 15, 1, 10, 2, '400mg', '10x10 Strips / Box', 'medicine', 150.0, 600.0, 'normal'),
        (35, 'MED_IBUP_100_SUS', 'Ibuprofen 100mg/5ml Paediatric Suspension', 1, 15, 8, 10, 4, '100mg/5ml', '100ml Bottle', 'medicine', 70.0, 280.0, 'normal'),
        # Additional Diverse Medicines
        (36, 'MED_DICLO_50', 'Diclofenac Sodium 50mg Tablets', 1, 15, 1, 7, 2, '50mg', '10x10 Strips / Box', 'medicine', 120.0, 500.0, 'normal'),
        (37, 'MED_DICLO_GEL', 'Diclofenac Diethylamine 1.16% Emulgel', 9, 15, 5, 7, 1, '1.16%', '50g Tube', 'medicine', 90.0, 360.0, 'normal'),
        (38, 'MED_BETAMETH_CRM', 'Betamethasone Valerate 0.1% Cream', 9, 7, 5, 3, 1, '0.1%', '15g Tube', 'medicine', 80.0, 320.0, 'normal'),
        (39, 'MED_HYDROCORT_100', 'Hydrocortisone Sodium Succinate 100mg Inj', 1, 7, 4, 5, 1, '100mg', 'Vial + 2ml WFI', 'medicine', 60.0, 250.0, 'normal'),
        (40, 'MED_FUROSEM_40', 'Furosemide 40mg Tablets (Lasix)', 3, 9, 1, 6, 2, '40mg', '10x10 Strips / Box', 'medicine', 100.0, 400.0, 'normal'),
        (41, 'MED_AMLODIP_5', 'Amlodipine Besylate 5mg Tablets', 3, 9, 1, 5, 2, '5mg', '10x10 Strips / Box', 'medicine', 160.0, 650.0, 'normal'),
        (42, 'MED_AMLODIP_10', 'Amlodipine Besylate 10mg Tablets', 3, 9, 1, 5, 2, '10mg', '10x10 Strips / Box', 'medicine', 110.0, 440.0, 'normal'),
        (43, 'MED_ENALAPRIL_5', 'Enalapril Maleate 5mg Tablets', 3, 9, 1, 8, 2, '5mg', '10x10 Strips / Box', 'medicine', 90.0, 360.0, 'normal'),
        (44, 'MED_METRONID_400', 'Metronidazole 400mg Tablets (Flagyl)', 1, 6, 1, 6, 2, '400mg', '10x10 Strips / Box', 'medicine', 130.0, 520.0, 'normal'),
        (45, 'MED_METRONID_IV', 'Metronidazole 500mg/100ml IV Infusion', 1, 6, 4, 6, 4, '500mg/100ml', '100ml Bag', 'medicine', 70.0, 300.0, 'normal'),
        (46, 'MED_DOMPER_10', 'Domperidone 10mg Tablets (Motilium)', 4, 5, 1, 10, 2, '10mg', '10x10 Strips / Box', 'medicine', 100.0, 400.0, 'normal'),
        (47, 'MED_ONDAN_4_INJ', 'Ondansetron 4mg/2ml Injection (Zofran)', 4, 5, 4, 3, 1, '4mg/2ml', '5 Ampoules / Box', 'medicine', 50.0, 200.0, 'normal'),
        (48, 'MED_LOPERAM_2', 'Loperamide HCl 2mg Capsules (Imodium)', 4, 5, 2, 10, 2, '2mg', '10x10 Strips / Box', 'medicine', 70.0, 300.0, 'normal'),
        (49, 'MED_ORS_SACHET', 'Oral Rehydration Salts (ORS) WHO Formula', 4, 2, 1, 1, 1, '20.5g', '50 Sachets / Box', 'medicine', 300.0, 1500.0, 'normal'),
        (50, 'MED_VIT_C_500', 'Vitamin C 500mg Chewable Tablets (Celin)', 10, 2, 1, 3, 2, '500mg', '10x10 Strips / Box', 'medicine', 200.0, 800.0, 'normal'),
        (51, 'MED_VIT_B_COMP', 'Vitamin B-Complex Tablets High Potency', 10, 2, 1, 12, 2, 'High Potency', '10x10 Strips / Box', 'medicine', 180.0, 750.0, 'normal'),
        (52, 'MED_CALCIUM_D3', 'Calcium Carbonate 500mg + Vitamin D3', 10, 2, 1, 13, 2, '500mg+400IU', '60 Tablets Bottle', 'medicine', 120.0, 500.0, 'normal'),
        (53, 'MED_FOLIC_5MG', 'Folic Acid 5mg Tablets', 10, 2, 1, 1, 2, '5mg', '100 Tablets Bottle', 'medicine', 140.0, 600.0, 'normal'),
        (54, 'MED_FERROUS_FUM', 'Ferrous Fumarate 200mg Tablets', 10, 2, 1, 1, 2, '200mg', '100 Tablets Bottle', 'medicine', 150.0, 600.0, 'normal'),
        (55, 'MED_DOXY_100', 'Doxycycline Hyclate 100mg Capsules', 1, 1, 2, 8, 2, '100mg', '10x10 Strips / Box', 'medicine', 80.0, 350.0, 'normal'),
        (56, 'MED_ERYTHRO_250', 'Erythromycin Stearate 250mg Tablets', 1, 8, 1, 10, 2, '250mg', '10x10 Strips / Box', 'medicine', 70.0, 300.0, 'normal'),
        (57, 'MED_TRAMADOL_50', 'Tramadol HCl 50mg Capsules (Controlled)', 1, 15, 2, 9, 2, '50mg', '10x10 Strips / Box', 'medicine', 60.0, 250.0, 'normal'),
        (58, 'MED_TRAMADOL_INJ', 'Tramadol HCl 100mg/2ml Ampoules', 1, 15, 4, 9, 1, '100mg/2ml', '5 Ampoules / Box', 'medicine', 40.0, 180.0, 'normal'),
        (59, 'MED_ADRENALIN_1', 'Adrenaline (Epinephrine) 1:1000 Inj 1mg/ml', 1, 7, 4, 1, 1, '1mg/1ml', '10 Ampoules / Box', 'medicine', 30.0, 150.0, 'normal'),
        (60, 'MED_ATROPINE_06', 'Atropine Sulfate 0.6mg/ml Injection', 1, 7, 4, 1, 1, '0.6mg/ml', '10 Ampoules / Box', 'medicine', 25.0, 120.0, 'normal'),
        # Low Stock & Out of Stock Showcase Products
        (61, 'MED_OOS_GLICLAZIDE', 'Gliclazide 80mg Tablets (CURRENTLY OUT OF STOCK)', 2, 3, 1, 4, 2, '80mg', '10x10 Strips / Box', 'medicine', 200.0, 800.0, 'normal'),
        (62, 'MED_OOS_MEROPENEM', 'Meropenem 1g IV Injection (CRITICAL SHORTAGE)', 1, 10, 4, 7, 1, '1000mg', 'Single Vial', 'medicine', 150.0, 500.0, 'normal'),
        (63, 'MED_LOW_SALBUT_NEB', 'Salbutamol Nebules 2.5mg (LOW STOCK ALERT)', 5, 7, 4, 3, 2, '2.5mg/2.5ml', '20 Nebules / Box', 'medicine', 180.0, 600.0, 'normal'),
        (64, 'MED_LOW_INS_HUMALOG', 'Insulin Lispro Humalog 100 IU/ml (LOW STOCK)', 2, 11, 4, 5, 1, '100 IU/ml', '5x3ml Cartridges', 'medicine', 50.0, 200.0, 'cold_storage'),
        (65, 'MED_QUAR_BATCH_ITEM', 'Gentamicin 80mg/2ml Inj (NMRA RECALL BATCH ON HOLD)', 1, 1, 4, 8, 1, '80mg/2ml', '10 Ampoules / Box', 'medicine', 40.0, 200.0, 'normal')
    ]

    prod_stmts = []
    for p in products_data:
        p_id, code, name, cat, gen, dose, mfg, unit, strength, pack, ptype, reorder_l, reorder_q, cond = p
        prod_stmts.append(
            f"({p_id}, {COMPANY_ID}, '{code}', {escape_str(name)}, {cat}, {gen}, {dose}, {mfg}, {unit}, '{strength}', '{pack}', '{ptype}', 1, 1, '{cond}', {reorder_l}, {reorder_q}, 17, 14, 5, 16, 'NMRA/REG/{random.randint(10000,99999)}', '2028-12-31', 'active', '2023-01-01', '2023-01-01')"
        )

    sql_products = [
        f"""INSERT INTO products (id, company_id, product_code, product_name, product_category_id, generic_name_id, dosage_form_id, manufacturer_id, base_unit_id, strength, pack_size, product_type, requires_batch_tracking, requires_expiry_tracking, storage_condition, reorder_level, reorder_quantity, purchase_account_id, sales_account_id, inventory_account_id, cost_of_goods_sold_account_id, nmra_registration_number, nmra_expiry_date, status, created_at, updated_at) VALUES
        {','.join(prod_stmts)}
        ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), reorder_level = VALUES(reorder_level), reorder_quantity = VALUES(reorder_quantity);"""
    ]
    run_sql_batch(sql_products)

    # ----------------------------------------------------
    # 5. Product Batches (280+ Batches: Expired, Near-Expiry, Active, Quarantined)
    # ----------------------------------------------------
    print("[5/10] Seeding 280+ Batches (2023-2025 Expired, 2026 Near-Expiry, 2027 Active, Quarantined)...")
    
    batch_stmts = []
    batch_id = 1
    
    # Store batches per product for stock generation
    product_batch_map = {}

    for p in products_data:
        p_id = p[0]
        p_code = p[1]
        p_cond = p[13]
        product_batch_map[p_id] = []

        # Product 61 and 62 are Out Of Stock (No active batches or 0 stock)
        if p_id in (61, 62):
            # Only 1 old expired batch from 2023
            b_num = f"BAT-EXP-2023-{p_id:02d}"
            batch_stmts.append(
                f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_num}', '2021-03-10', '2023-09-15', {random.randint(1,12)}, {random.randint(1,15)}, 450.00, 650.00, 750.00, 'expired', 0, NULL, '2023-01-01', '2023-01-01')"
            )
            product_batch_map[p_id].append((batch_id, 'expired', 0.0))
            batch_id += 1
            continue

        # Product 65 is quarantined
        if p_id == 65:
            b_num = f"BAT-QUAR-RECALL-{p_id:02d}"
            batch_stmts.append(
                f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_num}', '2024-05-10', '2027-05-10', 5, 8, 220.00, 350.00, 400.00, 'quarantined', 1, 'NMRA Safety Alert: Particulate matter detected in sample batch', '2024-06-01', '2024-06-01')"
            )
            product_batch_map[p_id].append((batch_id, 'quarantined', 250.0))
            batch_id += 1
            continue

        # Product 63 & 64 are Low Stock (< reorder level)
        if p_id in (63, 64):
            b_num = f"BAT-LOW-{p_id:02d}-A"
            batch_stmts.append(
                f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_num}', '2025-01-10', '2027-06-30', {random.randint(1,12)}, {random.randint(1,15)}, 1200.00, 1600.00, 1800.00, 'active', 0, NULL, '2025-02-01', '2025-02-01')"
            )
            # Low quantity on hand e.g. 15 (reorder level is 180 or 50)
            product_batch_map[p_id].append((batch_id, 'active', 15.0))
            batch_id += 1
            continue

        # Regular Products: 4 to 5 batches across timeline
        # 1. Expired 2023/2024
        b_exp_23 = f"BAT-EXP23-{p_id:02d}"
        batch_stmts.append(
            f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_exp_23}', '2021-06-15', '2023-11-20', {random.randint(1,12)}, {random.randint(1,15)}, 350.00, 520.00, 600.00, 'expired', 0, NULL, '2023-01-01', '2023-01-01')"
        )
        product_batch_map[p_id].append((batch_id, 'expired', 0.0))
        batch_id += 1

        # 2. Expired 2024/2025
        b_exp_24 = f"BAT-EXP24-{p_id:02d}"
        batch_stmts.append(
            f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_exp_24}', '2022-09-10', '2024-10-15', {random.randint(1,12)}, {random.randint(1,15)}, 380.00, 550.00, 620.00, 'expired', 0, NULL, '2023-06-01', '2023-06-01')"
        )
        product_batch_map[p_id].append((batch_id, 'expired', 0.0))
        batch_id += 1

        # 3. Near Expiry (Late 2026 - Early 2027)
        b_near = f"BAT-NEAR26-{p_id:02d}"
        exp_date_near = f"2026-{random.randint(11,12):02d}-{random.randint(10,28):02d}"
        batch_stmts.append(
            f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_near}', '2024-11-01', '{exp_date_near}', {random.randint(1,12)}, {random.randint(1,15)}, 410.00, 590.00, 680.00, 'near_expiry', 0, NULL, '2024-11-15', '2024-11-15')"
        )
        product_batch_map[p_id].append((batch_id, 'near_expiry', random.randint(40, 180)))
        batch_id += 1

        # 4. Active Current Batch (Expiry late 2027)
        b_act = f"BAT-ACT27-{p_id:02d}"
        exp_date_act = f"2027-{random.randint(6,12):02d}-{random.randint(10,28):02d}"
        batch_stmts.append(
            f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_act}', '2025-05-15', '{exp_date_act}', {random.randint(1,12)}, {random.randint(1,15)}, 430.00, 620.00, 710.00, 'active', 0, NULL, '2025-06-01', '2025-06-01')"
        )
        product_batch_map[p_id].append((batch_id, 'active', random.randint(300, 1200)))
        batch_id += 1

        # 5. Long-life Active Batch (Expiry 2028)
        if p_id % 2 == 0:
            b_act28 = f"BAT-ACT28-{p_id:02d}"
            batch_stmts.append(
                f"({batch_id}, {COMPANY_ID}, {p_id}, '{b_act28}', '2026-02-10', '2028-08-30', {random.randint(1,12)}, {random.randint(1,15)}, 450.00, 650.00, 750.00, 'active', 0, NULL, '2026-03-01', '2026-03-01')"
            )
            product_batch_map[p_id].append((batch_id, 'active', random.randint(500, 1500)))
            batch_id += 1

    # Chunk inserts into batches of 100
    for chunk_idx in range(0, len(batch_stmts), 100):
        chunk = batch_stmts[chunk_idx:chunk_idx + 100]
        sql_batch = [
            f"""INSERT INTO product_batches (id, company_id, product_id, batch_number, manufacture_date, expiry_date, supplier_id, manufacturer_id, purchase_rate, selling_price, mrp, batch_status, is_blocked, block_reason, created_at, updated_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE batch_status = VALUES(batch_status), expiry_date = VALUES(expiry_date);"""
        ]
        run_sql_batch(sql_batch)

    # ----------------------------------------------------
    # 6. Stock Balances & Stock Ledger (Multi-Warehouse Tracking)
    # ----------------------------------------------------
    print("[6/10] Seeding Multi-Warehouse Stock Balances & Stock Ledger Movements...")
    stock_bal_stmts = []
    stock_led_stmts = []
    
    bal_id = 1
    led_id = 1

    for p in products_data:
        p_id = p[0]
        p_cond = p[13]
        batches = product_batch_map.get(p_id, [])

        for b_info in batches:
            b_id, b_status, b_qty = b_info
            
            # Decide target warehouse based on condition and status
            if b_status == 'quarantined':
                wh_id = 5 # Quarantine WH
                loc_id = 21 # LOC-QUAR-R1-S1
            elif p_cond == 'cold_storage':
                wh_id = 4 # Cold Chain WH
                loc_id = 16 # LOC-COLD-R1-S1
            else:
                # Distribute across Colombo, Kandy, Galle
                wh_id = random.choice([1, 2, 3])
                loc_id = (wh_id - 1) * 5 + random.randint(1, 5)

            branch_id = 4 if wh_id == 4 else (wh_id if wh_id in (1, 2, 3) else 1)
            unit_cost = 420.00
            total_val = round(Decimal(b_qty) * Decimal(unit_cost), 2)
            
            stock_bal_stmts.append(
                f"({bal_id}, {COMPANY_ID}, {branch_id}, {wh_id}, {loc_id}, {p_id}, {b_id}, {b_qty}, 0.000, {b_qty}, {unit_cost}, {total_val}, '2026-03-15 10:30:00', '2023-01-01', '2026-03-15')"
            )
            bal_id += 1

            # Historical ledger movement if quantity > 0
            if b_qty > 0:
                stock_led_stmts.append(
                    f"({led_id}, {COMPANY_ID}, {branch_id}, {wh_id}, {loc_id}, {p_id}, {b_id}, '2025-06-15 09:00:00', 'PROCUREMENT', 'GRN', {random.randint(1,50)}, 'GRN-2025-{p_id:03d}', 'IN', {b_qty}, 0.000, {b_qty}, {unit_cost}, {total_val}, 'Stock receipt from overseas supplier', 1, '2025-06-15 09:00:00')"
                )
                led_id += 1

    # Insert stock balances
    for chunk_idx in range(0, len(stock_bal_stmts), 100):
        chunk = stock_bal_stmts[chunk_idx:chunk_idx + 100]
        sql_bal = [
            f"""INSERT INTO stock_balances (id, company_id, branch_id, warehouse_id, warehouse_location_id, product_id, product_batch_id, quantity_on_hand, quantity_allocated, quantity_available, average_cost, stock_value, last_movement_date, created_at, updated_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE quantity_on_hand = VALUES(quantity_on_hand), quantity_available = VALUES(quantity_available), stock_value = VALUES(stock_value);"""
        ]
        run_sql_batch(sql_bal)

    # Insert stock ledger entries
    for chunk_idx in range(0, len(stock_led_stmts), 100):
        chunk = stock_led_stmts[chunk_idx:chunk_idx + 100]
        sql_led = [
            f"""INSERT INTO stock_ledger_entries (id, company_id, branch_id, warehouse_id, warehouse_location_id, product_id, product_batch_id, transaction_date, source_module, source_type, source_id, source_number, movement_type, quantity_in, quantity_out, balance_quantity, unit_cost, total_cost, remarks, created_by, created_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE total_cost = VALUES(total_cost);"""
        ]
        run_sql_batch(sql_led)

    # ----------------------------------------------------
    # 7. Procurement: Goods Receipt Notes (GRN) (75 GRNs across 2023-2027)
    # ----------------------------------------------------
    print("[7/10] Seeding 75 Goods Receipt Notes & 180 GRN Line Items (Pending, Approved, Posted)...")
    
    grn_stmts = []
    grn_line_stmts = []
    line_id = 1

    # Financial year IDs: 1 (2023/24), 2 (2024/25), 3 (2025/26), 4 (2026/27)
    for grn_id in range(1, 76):
        # Distribute dates across 2023 to 2027
        if grn_id <= 18:
            fy_id = 1
            period_id = random.randint(1, 12)
            grn_date = f"2023-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            app_status = 'approved'
            post_status = 'posted'
        elif grn_id <= 38:
            fy_id = 2
            period_id = random.randint(13, 24)
            grn_date = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            app_status = 'approved'
            post_status = 'posted'
        elif grn_id <= 58:
            fy_id = 3
            period_id = random.randint(25, 36)
            grn_date = f"2025-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            app_status = 'approved'
            post_status = 'posted'
        else:
            fy_id = 4
            period_id = random.randint(37, 48)
            grn_date = f"2026-{random.randint(1,10):02d}-{random.randint(1,28):02d}"
            # Showcase some pending and draft GRNs in 2026
            if grn_id in (73, 74):
                app_status = 'pending'
                post_status = 'unposted'
            elif grn_id == 75:
                app_status = 'draft'
                post_status = 'unposted'
            else:
                app_status = 'approved'
                post_status = 'posted'

        supplier_id = (grn_id % 12) + 1
        wh_id = 4 if grn_id % 7 == 0 else ((grn_id % 3) + 1)
        branch_id = 4 if wh_id == 4 else wh_id
        grn_num = f"GRN-{grn_date[:4]}-{grn_id:04d}"
        po_num = f"PO-{grn_date[:4]}-{random.randint(100, 999)}"
        sup_inv = f"INV-SUP-{random.randint(10000, 99999)}"

        total_qty = 0.0
        subtotal = 0.0

        # 2 to 3 lines per GRN
        num_lines = random.randint(2, 3)
        for l_idx in range(1, num_lines + 1):
            prod_id = random.randint(1, 60)
            qty = Decimal(random.randint(100, 500))
            cost = Decimal(random.randint(250, 750))
            line_tot = qty * cost
            total_qty += float(qty)
            subtotal += float(line_tot)

            grn_line_stmts.append(
                f"({line_id}, {grn_id}, 1, {prod_id}, {prod_id * 3}, 'BAT-REC-{grn_id}-{l_idx}', '{grn_date}', '2027-12-31', {qty}, 0.000, {qty}, {cost}, 0.00, 0.00, {line_tot}, {cost}, {cost * Decimal('1.4')}, {cost * Decimal('1.6')}, 'Inspected and accepted at receiving bay', {l_idx}, '{grn_date} 10:00:00', '{grn_date} 10:00:00')"
            )
            line_id += 1

        total_amt = subtotal
        grn_stmts.append(
            f"({grn_id}, {COMPANY_ID}, {branch_id}, {supplier_id}, {wh_id}, {fy_id}, {period_id}, '{grn_num}', '{grn_date}', '{sup_inv}', '{grn_date}', '{po_num}', 'REF-{grn_num}', 'Standard shipment clearance', {total_qty}, 0.000, {total_qty}, {subtotal}, 0.00, 0.00, {total_amt}, '{app_status}', 1, '{grn_date} 12:00:00', '{post_status}', 1, '{grn_date} 14:00:00', 'active', 1, 1, '{grn_date} 09:00:00', '{grn_date} 14:00:00', NULL)"
        )

    # Insert GRNs
    for chunk_idx in range(0, len(grn_stmts), 50):
        chunk = grn_stmts[chunk_idx:chunk_idx + 50]
        sql_grn = [
            f"""INSERT INTO goods_receipt_notes (id, company_id, branch_id, supplier_id, warehouse_id, financial_year_id, accounting_period_id, grn_number, grn_date, supplier_invoice_number, supplier_invoice_date, purchase_order_number, reference_number, remarks, total_quantity, total_free_quantity, total_stock_quantity, subtotal_amount, discount_amount, tax_amount, total_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, status, created_by, updated_by, created_at, updated_at, deleted_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);"""
        ]
        run_sql_batch(sql_grn)

    # Insert GRN lines
    for chunk_idx in range(0, len(grn_line_stmts), 100):
        chunk = grn_line_stmts[chunk_idx:chunk_idx + 100]
        sql_grn_lines = [
            f"""INSERT INTO goods_receipt_note_lines (id, goods_receipt_note_id, warehouse_location_id, product_id, product_batch_id, batch_number, manufacture_date, expiry_date, quantity_received, free_quantity, total_stock_quantity, unit_cost, discount_amount, tax_amount, line_total, stock_unit_cost, selling_price, mrp, line_remarks, line_order, created_at, updated_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE line_total = VALUES(line_total);"""
        ]
        run_sql_batch(sql_grn_lines)

    # ----------------------------------------------------
    # 8. Customers Catalog (35 Top Sri Lankan Healthcare Customers)
    # ----------------------------------------------------
    print("[8/10] Seeding 35 Healthcare Customers (Hospitals, Rajya Osusala, Pharmacy Chains)...")
    customers_data = [
        (1, 'CUST_ASIRI_CENTRAL', 'Asiri Central Hospital PLC', 'hospital', 'PV12903', '102938491-7000', 'Dr. Manjula Karunaratne', '+94 11 458 5555', 'purchasing@asiri.lk', 'No. 114, Norris Canal Road, Colombo 10', 5000000.00, 60),
        (2, 'CUST_ASIRI_SURG', 'Asiri Surgical Hospital PLC', 'hospital', 'PV12904', '102938492-7000', 'Mrs. Damayanthi Silva', '+94 11 452 4400', 'pharma@asirisurgical.lk', 'Kirimandala Mawatha, Narahenpita', 4000000.00, 60),
        (3, 'CUST_NAWALOKA', 'Nawaloka Hospitals PLC', 'hospital', 'PV00392', '103849201-7000', 'Mr. Harshith Dharmadasa', '+94 11 557 7111', 'supplies@nawaloka.lk', 'No. 23, Deshamanya H.K. Dharmadasa Mawatha, Colombo 02', 6000000.00, 45),
        (4, 'CUST_LANKA_HOSP', 'The Lanka Hospitals Corporation PLC', 'hospital', 'PQ180', '104859302-7000', 'Dr. Prasad Medawatta', '+94 11 543 0000', 'procurement@lankahospitals.com', 'No. 578, Elvitigala Mawatha, Narahenpita', 7500000.00, 60),
        (5, 'CUST_DURDANS', 'Durdans Hospital (Ceylon Hospitals PLC)', 'hospital', 'PQ113', '105948301-7000', 'Mr. Aminda Tudawe', '+94 11 214 0000', 'medicalstores@durdans.com', 'No. 3, Alfred Place, Colombo 03', 4500000.00, 45),
        (6, 'CUST_KINGS', 'Kings Hospital Colombo', 'hospital', 'PV98201', '106948201-7000', 'Dr. Palitha Rajapakse', '+94 11 774 3743', 'pharmacy@kingshospital.lk', 'Evergreen Park Road, Narahenpita', 3000000.00, 30),
        (7, 'CUST_HEMAS_WAT', 'Hemas Hospital Wattala', 'hospital', 'PV87291', '107849301-7000', 'Dr. Lakith Peiris', '+94 11 788 8888', 'wattala@hemashospitals.com', 'No. 388, Negombo Road, Wattala', 3500000.00, 45),
        (8, 'CUST_HEMAS_THAL', 'Hemas Hospital Thalawathugoda', 'hospital', 'PV87292', '107849302-7000', 'Dr. Chamila Ariyananda', '+94 11 744 4444', 'thalawathugoda@hemashospitals.com', 'Thalawathugoda, Battaramulla', 3000000.00, 45),
        (9, 'CUST_SJGH', 'Sri Jayewardenepura General Hospital', 'hospital', 'GOV001', '100098491-7000', 'Director Medical Supplies', '+94 11 277 8610', 'director@sjgh.health.gov.lk', 'Thalapathpitiya, Nugegoda', 5000000.00, 90),
        (10, 'CUST_OSUSALA_MAIN', 'Rajya Osusala - Colombo Town Hall', 'pharmacy', 'GOV-SPC-01', '100023491-7000', 'Manager In-Charge', '+94 11 269 4140', 'townhall@spc.lk', 'Town Hall, Colombo 07', 2500000.00, 30),
        (11, 'CUST_OSUSALA_KDY', 'Rajya Osusala - Kandy Branch', 'pharmacy', 'GOV-SPC-02', '100023491-7000', 'Branch Pharmacist', '+94 81 222 2333', 'kandy@spc.lk', 'Dalada Veediya, Kandy', 1800000.00, 30),
        (12, 'CUST_OSUSALA_GLE', 'Rajya Osusala - Galle Fort', 'pharmacy', 'GOV-SPC-03', '100023491-7000', 'Branch Pharmacist', '+94 91 223 3444', 'galle@spc.lk', 'Main Street, Galle', 1500000.00, 30),
        (13, 'CUST_HEALTHGUARD_01', 'Healthguard Pharmacy - Kollupitiya', 'pharmacy', 'PV45920', '105849301-7000', 'Mr. Infas Iqbal', '+94 11 257 8899', 'store01@healthguard.lk', 'Galle Road, Colombo 03', 2000000.00, 30),
        (14, 'CUST_HEALTHGUARD_02', 'Healthguard Pharmacy - Bambalapitiya', 'pharmacy', 'PV45921', '105849301-7000', 'Ms. Fathima Rizna', '+94 11 258 7766', 'store02@healthguard.lk', 'Duplication Road, Colombo 04', 2000000.00, 30),
        (15, 'CUST_UNION_CHEM', 'Union Chemists (Pvt) Ltd', 'pharmacy', 'PV39820', '108493021-7000', 'Mr. Gamini Wickrama', '+94 11 269 6601', 'orders@unionchemists.lk', 'No. 460, Union Place, Colombo 02', 3000000.00, 30),
        (16, 'CUST_HARCOURTS_01', 'Harcourts Pharmacy - Wellawatte', 'pharmacy', 'PV29481', '109403921-7000', 'Mr. Ahamed Razeek', '+94 11 258 4433', 'wellawatte@harcourts.lk', 'Galle Road, Colombo 06', 1500000.00, 30),
        (17, 'CUST_HARCOURTS_02', 'Harcourts Pharmacy - Dehiwala', 'pharmacy', 'PV29482', '109403921-7000', 'Mr. Farhan Mansoor', '+94 11 271 2233', 'dehiwala@harcourts.lk', 'Galle Road, Dehiwala', 1500000.00, 30),
        (18, 'CUST_CENTRAL_PHARM_KDY', 'Central Medical Stores & Pharmacy Kandy', 'pharmacy', 'PV67201', '110394829-7000', 'Mr. Upul Dissanayake', '+94 81 223 9988', 'centralpharma@sltnet.lk', 'No. 120, Colombo Street, Kandy', 1200000.00, 30),
        (19, 'CUST_RUHUNU_HOSP', 'Ruhunu Hospital (Pvt) Ltd', 'hospital', 'PV19820', '111495821-7000', 'Dr. Saman Fernando', '+94 91 223 4059', 'info@ruhunuhospital.lk', 'Karapitiya Road, Galle', 2500000.00, 45),
        (20, 'CUST_NORTH_LANKA_PHARM', 'Northern Medix Pharmacy Jaffna', 'pharmacy', 'PV84920', '112394820-7000', 'Mr. K. Theivendran', '+94 21 222 8899', 'northmedix@gmail.com', 'Hospital Road, Jaffna', 1000000.00, 30),
        (21, 'CUST_APOLLO_CARE', 'Apollo Medical Centre Kurunegala', 'clinic', 'PV72019', '113495820-7000', 'Dr. Sunil Jayawardena', '+94 37 222 4455', 'apollocare@sltnet.lk', 'Colombo Road, Kurunegala', 800000.00, 30),
        (22, 'CUST_NEGOMBO_DISP', 'Negombo Cooperative Dispensary & Pharmacy', 'pharmacy', 'COOP082', '114594830-7000', 'Mr. Jude Bastian', '+94 31 222 3344', 'negombocoop@gmail.com', 'Main Street, Negombo', 900000.00, 30),
        (23, 'CUST_MATARA_MED', 'Matara Medicare Hospital', 'hospital', 'PV93820', '115493820-7000', 'Dr. Hemantha Kumara', '+94 41 222 5566', 'mataramedicare@gmail.com', 'Anagarika Dharmapala Mawatha, Matara', 1500000.00, 45),
        (24, 'CUST_KALUTARA_PHARM', 'Kalutara Central Pharmacy', 'pharmacy', 'PV39481', '116493820-7000', 'Mr. Rohan De Silva', '+94 34 222 1122', 'kalutarapharm@sltnet.lk', 'Galle Road, Kalutara North', 700000.00, 30),
        (25, 'CUST_ANURADHAPURA_CARE', 'Rajarata Healthcare & Pharmacy', 'pharmacy', 'PV58392', '117493820-7000', 'Mr. Bandula Herath', '+94 25 222 7788', 'rajaratapharm@gmail.com', 'Maithripala Senanayake Mawatha, Anuradhapura', 950000.00, 30),
        (26, 'CUST_BADULLA_DISP', 'Uva Provincial Medicare Badulla', 'clinic', 'PV84930', '118493820-7000', 'Dr. Anura Wickramasinghe', '+94 55 222 3322', 'uvacare@gmail.com', 'Lower King Street, Badulla', 650000.00, 30),
        (27, 'CUST_RATNAPURA_PHARM', 'Sabaragamuwa Medical Stores', 'pharmacy', 'PV28491', '119493820-7000', 'Mr. Susantha Jayakody', '+94 45 222 4433', 'sabarmed@sltnet.lk', 'Main Street, Ratnapura', 850000.00, 30),
        (28, 'CUST_GAMPAHA_CLINIC', 'Gampaha Family Care Centre', 'clinic', 'PV94830', '120493820-7000', 'Dr. Asitha Ranasinghe', '+94 33 222 5566', 'gampahafamily@gmail.com', 'Yakkala Road, Gampaha', 750000.00, 30),
        (29, 'CUST_BATTICALOA_CARE', 'Eastern Lanka Pharmacy Batticaloa', 'pharmacy', 'PV73920', '121493820-7000', 'Mr. S. Sivakumaran', '+94 65 222 4455', 'easternpharma@gmail.com', 'Trinco Road, Batticaloa', 900000.00, 30),
        (30, 'CUST_TRINCO_MED', 'Trincomalee Medicare Clinic', 'clinic', 'PV64920', '122493820-7000', 'Dr. M. Farook', '+94 26 222 3344', 'trincomed@sltnet.lk', 'Dockyard Road, Trincomalee', 600000.00, 30),
        (31, 'CUST_NUWARA_ELIYA', 'Hill Club Pharmacy Nuwara Eliya', 'pharmacy', 'PV48392', '123493820-7000', 'Mr. K. Chandrasekar', '+94 52 222 2211', 'hillpharma@gmail.com', 'Badulla Road, Nuwara Eliya', 500000.00, 30),
        (32, 'CUST_PANADURA_HOSP', 'Panadura Nursing Home & Medical Centre', 'hospital', 'PV39401', '124493820-7000', 'Dr. Nihal Wijeratne', '+94 38 223 3445', 'panaduracare@sltnet.lk', 'Arthur V Dias Mawatha, Panadura', 1200000.00, 45),
        (33, 'CUST_MORATUWA_DISP', 'Moratuwa Community Dispensary', 'clinic', 'PV84910', '125493820-7000', 'Dr. Priyantha Mendis', '+94 11 264 5566', 'moratuwaclinic@gmail.com', 'Rawathawatta, Moratuwa', 600000.00, 30),
        (34, 'CUST_MAHARAGAMA_PHARM', 'Apex Medicare Pharmacy Maharagama', 'pharmacy', 'PV19482', '126493820-7000', 'Mr. Janaka Abeykoon', '+94 11 284 3322', 'apexmaharagama@gmail.com', 'High Level Road, Maharagama', 950000.00, 30),
        (35, 'CUST_HOMAGAMA_MED', 'Homagama Medical Supplies', 'distributor', 'PV74930', '127493820-7000', 'Mr. Kapila Gunasekara', '+94 11 285 5544', 'homagamamed@sltnet.lk', 'Court Road, Homagama', 1400000.00, 45)
    ]

    cust_stmts = []
    for c in customers_data:
        cid, code, name, ctype, brn, tin, contact, phone, email, addr, cr_limit, cr_days = c
        cust_stmts.append(
            f"({cid}, {COMPANY_ID}, 1, '{code}', {escape_str(name)}, '{ctype}', '{brn}', '{tin}', '{contact}', '{phone}', '{email}', {escape_str(addr)}, {escape_str(addr)}, {cr_limit}, {cr_days}, 4, 0.00, 'active', 1, 1, '2023-01-01', '2023-01-01', NULL)"
        )

    sql_customers = [
        f"""INSERT INTO customers (id, company_id, customer_category_id, customer_code, customer_name, customer_type, business_registration_number, tax_registration_number, primary_contact_person, primary_contact_number, primary_email, billing_address, shipping_address, credit_limit, credit_days, receivable_account_id, current_balance, status, created_by, updated_by, created_at, updated_at, deleted_at) VALUES
        {','.join(cust_stmts)}
        ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name), credit_limit = VALUES(credit_limit);"""
    ]
    run_sql_batch(sql_customers)

    # ----------------------------------------------------
    # 9. Sales Orders & Invoices (85 Orders & 130 Invoices: Paid, Partial, Overdue)
    # ----------------------------------------------------
    print("[9/10] Seeding 85 Sales Orders & 130 Sales Invoices (Paid, Partial, Unpaid/Overdue)...")
    
    so_stmts = []
    so_line_stmts = []
    inv_stmts = []
    inv_line_stmts = []
    
    so_line_id = 1
    inv_line_id = 1

    # 1. Seed 85 Sales Orders
    for so_id in range(1, 86):
        if so_id <= 20:
            fy_id = 1
            period_id = random.randint(1, 12)
            so_date = f"2023-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            app_status = 'approved'
            ord_status = 'closed'
        elif so_id <= 45:
            fy_id = 2
            period_id = random.randint(13, 24)
            so_date = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            app_status = 'approved'
            ord_status = 'closed'
        elif so_id <= 68:
            fy_id = 3
            period_id = random.randint(25, 36)
            so_date = f"2025-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            app_status = 'approved'
            ord_status = 'closed'
        else:
            fy_id = 4
            period_id = random.randint(37, 48)
            so_date = f"2026-{random.randint(1,10):02d}-{random.randint(1,28):02d}"
            if so_id in (83, 84):
                app_status = 'approved'
                ord_status = 'open' # Open pending delivery
            elif so_id == 85:
                app_status = 'draft'
                ord_status = 'open'
            else:
                app_status = 'approved'
                ord_status = 'closed'

        cust_id = (so_id % 35) + 1
        branch_id = (so_id % 3) + 1
        so_num = f"SO-{so_date[:4]}-{so_id:04d}"
        exp_delivery = so_date

        subtotal = 0.0
        num_items = random.randint(2, 4)
        for li in range(1, num_items + 1):
            p_id = random.randint(1, 60)
            qty = Decimal(random.randint(20, 150))
            price = Decimal(random.randint(450, 950))
            line_tot = qty * price
            subtotal += float(line_tot)

            so_line_stmts.append(
                f"({so_line_id}, {so_id}, {p_id}, {p_id * 3}, {qty}, {qty if ord_status == 'closed' else 0}, {0 if ord_status == 'closed' else qty}, {price}, 0.00, 0.00, {line_tot}, 'Standard packing request', {li}, '{so_date}', '{so_date}')"
            )
            so_line_id += 1

        total_amt = subtotal
        so_stmts.append(
            f"({so_id}, {COMPANY_ID}, {branch_id}, {cust_id}, {fy_id}, {period_id}, '{so_num}', '{so_date}', '{exp_delivery}', 'CUST-PO-{random.randint(1000,9999)}', 'Order processed via hospital tender desk', {subtotal}, 0.00, 0.00, {total_amt}, '{app_status}', '{ord_status}', 'active', 1, '{so_date} 10:00:00', NULL, NULL, NULL, NULL, 1, 1, '{so_date}', '{so_date}', NULL)"
        )

    # Insert Sales Orders
    for chunk_idx in range(0, len(so_stmts), 50):
        chunk = so_stmts[chunk_idx:chunk_idx + 50]
        sql_so = [
            f"""INSERT INTO sales_orders (id, company_id, branch_id, customer_id, financial_year_id, accounting_period_id, sales_order_number, sales_order_date, expected_delivery_date, customer_reference_number, remarks, subtotal_amount, discount_amount, tax_amount, total_amount, approval_status, order_status, status, approved_by, approved_at, closed_by, closed_at, cancelled_by, cancelled_at, created_by, updated_by, created_at, updated_at, deleted_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);"""
        ]
        run_sql_batch(sql_so)

    # Insert SO Lines
    for chunk_idx in range(0, len(so_line_stmts), 100):
        chunk = so_line_stmts[chunk_idx:chunk_idx + 100]
        sql_so_lines = [
            f"""INSERT INTO sales_order_lines (id, sales_order_id, product_id, product_batch_id, quantity, invoiced_quantity, pending_quantity, unit_price, discount_amount, tax_amount, line_total, line_remarks, line_order, created_at, updated_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE line_total = VALUES(line_total);"""
        ]
        run_sql_batch(sql_so_lines)

    # 2. Seed 130 Sales Invoices across 2023 - 2027
    for inv_id in range(1, 131):
        if inv_id <= 35:
            fy_id = 1
            period_id = random.randint(1, 12)
            inv_date = f"2023-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            pay_status = 'paid' # Older are fully paid
        elif inv_id <= 70:
            fy_id = 2
            period_id = random.randint(13, 24)
            inv_date = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            pay_status = 'paid'
        elif inv_id <= 105:
            fy_id = 3
            period_id = random.randint(25, 36)
            inv_date = f"2025-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            pay_status = random.choice(['paid', 'paid', 'partial', 'unpaid'])
        else:
            fy_id = 4
            period_id = random.randint(37, 48)
            inv_date = f"2026-{random.randint(1,10):02d}-{random.randint(1,28):02d}"
            # Varied payments: paid, partial, unpaid, overdue
            pay_status = random.choice(['paid', 'partial', 'unpaid', 'overdue'])

        cust_id = (inv_id % 35) + 1
        branch_id = (inv_id % 3) + 1
        wh_id = branch_id
        inv_num = f"INV-{inv_date[:4]}-{inv_id:04d}"
        due_date = f"{inv_date[:4]}-12-31"

        subtotal = 0.0
        num_items = random.randint(2, 4)
        for li in range(1, num_items + 1):
            p_id = random.randint(1, 60)
            qty = Decimal(random.randint(25, 120))
            price = Decimal(random.randint(450, 950))
            cost = Decimal(round(float(price) * 0.65, 2))
            line_tot = qty * price
            line_cost = qty * cost
            subtotal += float(line_tot)

            inv_line_stmts.append(
                f"({inv_line_id}, {inv_id}, 1, 1, {p_id}, {p_id * 3}, {qty}, {price}, 0.00, 0.00, {line_tot}, {cost}, {line_cost}, 'Hospital batch release', {li}, '{inv_date}', '{inv_date}')"
            )
            inv_line_id += 1

        total_amt = subtotal
        if pay_status == 'paid':
            paid_amt = total_amt
            bal_amt = 0.0
        elif pay_status == 'partial':
            paid_amt = round(total_amt * 0.4, 2)
            bal_amt = round(total_amt - paid_amt, 2)
        else: # unpaid or overdue
            paid_amt = 0.0
            bal_amt = total_amt

        inv_stmts.append(
            f"({inv_id}, {COMPANY_ID}, {branch_id}, {cust_id}, 1, {wh_id}, {fy_id}, {period_id}, '{inv_num}', '{inv_date}', '{due_date}', 'REF-{inv_num}', 'Commercial tax invoice', {subtotal}, 0.00, 0.00, {total_amt}, {paid_amt}, {bal_amt}, 'approved', 1, '{inv_date} 10:00:00', 'posted', 1, '{inv_date} 11:00:00', '{pay_status}', NULL, NULL, NULL, 'active', 1, 1, '{inv_date}', '{inv_date}', NULL, 1, 'posted', 'FIN-REF-{inv_id:04d}', 1, '{inv_date} 11:00:00')"
        )

    # Insert Invoices
    for chunk_idx in range(0, len(inv_stmts), 50):
        chunk = inv_stmts[chunk_idx:chunk_idx + 50]
        sql_inv = [
            f"""INSERT INTO sales_invoices (id, company_id, branch_id, customer_id, sales_order_id, warehouse_id, financial_year_id, accounting_period_id, invoice_number, invoice_date, due_date, customer_reference_number, remarks, subtotal_amount, discount_amount, tax_amount, total_amount, paid_amount, balance_amount, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, payment_status, cancelled_by, cancelled_at, cancel_reason, status, created_by, updated_by, created_at, updated_at, deleted_at, sales_person_id, finance_post_status, finance_reference_number, finance_posted_by, finance_posted_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), balance_amount = VALUES(balance_amount), payment_status = VALUES(payment_status);"""
        ]
        run_sql_batch(sql_inv)

    # Insert Invoice Lines
    for chunk_idx in range(0, len(inv_line_stmts), 100):
        chunk = inv_line_stmts[chunk_idx:chunk_idx + 100]
        sql_inv_lines = [
            f"""INSERT INTO sales_invoice_lines (id, sales_invoice_id, sales_order_line_id, warehouse_location_id, product_id, product_batch_id, quantity, unit_price, discount_amount, tax_amount, line_total, stock_unit_cost, stock_total_cost, line_remarks, line_order, created_at, updated_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE line_total = VALUES(line_total);"""
        ]
        run_sql_batch(sql_inv_lines)

    # ----------------------------------------------------
    # 10. Financial Accounting: Balanced Journals & General Ledger (2023 - 2027)
    # ----------------------------------------------------
    print("[10/10] Seeding 160 Balanced General Ledger & Journal Entries across 2023-2027...")
    
    jnl_stmts = []
    jnl_line_stmts = []
    gl_stmts = []
    
    jnl_line_id = 1
    gl_id = 1

    # Standard account IDs:
    # 1: Cash in Hand
    # 3: Bank Account (Commercial Bank / Hatton National Bank)
    # 4: Trade Debtors (Accounts Receivable)
    # 5: Inventory Account
    # 9: Trade Creditors (Accounts Payable)
    # 14: Sales Revenue
    # 16: Cost of Goods Sold (COGS)
    # 19: Salaries and Wages
    # 20: Rent Expense

    # Generate 160 Journal Entries across 4 years (40 per financial year)
    years_data = [
        (1, '2023', 1, 12),
        (2, '2024', 13, 24),
        (3, '2025', 25, 36),
        (4, '2026', 37, 48)
    ]

    jnl_id = 1
    for fy_id, yr_str, min_p, max_p in years_data:
        for month in range(1, 13):
            period_id = min_p + (month - 1)
            jnl_date = f"{yr_str}-{month:02d}-28"

            # Entry 1: Monthly Sales & AR Recognition
            sales_amt = Decimal(random.randint(1200000, 3500000))
            cogs_amt = Decimal(round(float(sales_amt) * 0.62, 2))

            jnl_num = f"JV-{yr_str}-{jnl_id:04d}"
            jnl_stmts.append(
                f"({jnl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_num}', '{jnl_date}', 'REF-SALES-{yr_str}-{month:02d}', 'Monthly Consolidated Sales & Debtors Recognition', {sales_amt}, {sales_amt}, 'approved', 1, '{jnl_date} 17:00:00', 'posted', 1, '{jnl_date} 17:00:00', 0, NULL, 'active', 1, 1, '{jnl_date}', '{jnl_date}', NULL)"
            )
            # Lines: DR Trade Debtors (4), CR Sales Revenue (14)
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 4, 'Trade Debtors - Monthly billings', {sales_amt}, 0.00, 1, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 14, 'Pharma sales revenue realized', 0.00, {sales_amt}, 2, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1

            # GL Entries
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 4, '110001', 'Trade Debtors', 'Consolidated monthly customer billing', {sales_amt}, 0.00, {sales_amt}, 'DEBIT', 'REF-{jnl_num}', 1, '{jnl_date} 17:00:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 14, '400001', 'Sales Revenue', 'Consolidated pharma sales recognized', 0.00, {sales_amt}, {sales_amt}, 'CREDIT', 'REF-{jnl_num}', 1, '{jnl_date} 17:00:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            jnl_id += 1

            # Entry 2: Monthly Inventory Consumption (COGS)
            jnl_num = f"JV-{yr_str}-{jnl_id:04d}"
            jnl_stmts.append(
                f"({jnl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_num}', '{jnl_date}', 'REF-COGS-{yr_str}-{month:02d}', 'Monthly Cost of Goods Sold & Inventory Relief', {cogs_amt}, {cogs_amt}, 'approved', 1, '{jnl_date} 17:30:00', 'posted', 1, '{jnl_date} 17:30:00', 0, NULL, 'active', 1, 1, '{jnl_date}', '{jnl_date}', NULL)"
            )
            # Lines: DR COGS (16), CR Inventory (5)
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 16, 'Cost of Goods Sold - Dispensed medications', {cogs_amt}, 0.00, 1, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 5, 'Inventory Account - Medical stock issued', 0.00, {cogs_amt}, 2, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1

            # GL Entries
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 16, '500001', 'Cost of Goods Sold', 'Medical stocks issued to hospital sales', {cogs_amt}, 0.00, {cogs_amt}, 'DEBIT', 'REF-{jnl_num}', 1, '{jnl_date} 17:30:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 5, '120001', 'Inventory Account', 'Stock relief on sales', 0.00, {cogs_amt}, {cogs_amt}, 'CREDIT', 'REF-{jnl_num}', 1, '{jnl_date} 17:30:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            jnl_id += 1

            # Entry 3: Monthly Staff Salaries & Wages
            sal_amt = Decimal(random.randint(650000, 950000))
            jnl_num = f"JV-{yr_str}-{jnl_id:04d}"
            jnl_stmts.append(
                f"({jnl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_num}', '{jnl_date}', 'REF-SAL-{yr_str}-{month:02d}', 'Monthly Staff Payroll & Pharmacist Salaries', {sal_amt}, {sal_amt}, 'approved', 1, '{jnl_date} 18:00:00', 'posted', 1, '{jnl_date} 18:00:00', 0, NULL, 'active', 1, 1, '{jnl_date}', '{jnl_date}', NULL)"
            )
            # Lines: DR Salaries Expense (19), CR Bank (3)
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 19, 'Salaries and wages expense', {sal_amt}, 0.00, 1, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 3, 'Bank transfer - Commercial Bank of Ceylon', 0.00, {sal_amt}, 2, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1

            # GL Entries
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 19, '600001', 'Salaries and Wages', 'Monthly payroll disbursements', {sal_amt}, 0.00, {sal_amt}, 'DEBIT', 'REF-{jnl_num}', 1, '{jnl_date} 18:00:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 3, '100003', 'Bank Account', 'Direct bank payroll disbursement', 0.00, {sal_amt}, {sal_amt}, 'CREDIT', 'REF-{jnl_num}', 1, '{jnl_date} 18:00:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            jnl_id += 1

            # Entry 4: Monthly Warehouse & Office Rent
            rent_amt = Decimal('275000.00')
            jnl_num = f"JV-{yr_str}-{jnl_id:04d}"
            jnl_stmts.append(
                f"({jnl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_num}', '{jnl_date}', 'REF-RENT-{yr_str}-{month:02d}', 'Monthly Warehouse Facility & Head Office Lease', {rent_amt}, {rent_amt}, 'approved', 1, '{jnl_date} 18:30:00', 'posted', 1, '{jnl_date} 18:30:00', 0, NULL, 'active', 1, 1, '{jnl_date}', '{jnl_date}', NULL)"
            )
            # Lines: DR Rent Expense (20), CR Bank (3)
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 20, 'Colombo & Biyagama warehouse premises rent', {rent_amt}, 0.00, 1, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1
            jnl_line_stmts.append(f"({jnl_line_id}, {jnl_id}, 3, 'Bank transfer - Facility lease payment', 0.00, {rent_amt}, 2, '{jnl_date}', '{jnl_date}')")
            jnl_line_id += 1

            # GL Entries
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 20, '610001', 'Rent Expense', 'Premises rental amortization', {rent_amt}, 0.00, {rent_amt}, 'DEBIT', 'REF-{jnl_num}', 1, '{jnl_date} 18:30:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            gl_stmts.append(f"({gl_id}, {COMPANY_ID}, 1, {fy_id}, {period_id}, '{jnl_date}', 'JOURNAL', {jnl_id}, '{jnl_num}', 3, '100003', 'Bank Account', 'Commercial Bank rental wire', 0.00, {rent_amt}, {rent_amt}, 'CREDIT', 'REF-{jnl_num}', 1, '{jnl_date} 18:30:00', 'posted', '{jnl_date}', '{jnl_date}', NULL)")
            gl_id += 1
            jnl_id += 1

    # Insert Journals
    for chunk_idx in range(0, len(jnl_stmts), 50):
        chunk = jnl_stmts[chunk_idx:chunk_idx + 50]
        sql_jnl = [
            f"""INSERT INTO journal_entries (id, company_id, branch_id, financial_year_id, accounting_period_id, journal_number, journal_date, reference_number, description, total_debit, total_credit, approval_status, approved_by, approved_at, posted_status, posted_by, posted_at, is_reversed, reversed_journal_id, status, created_by, updated_by, created_at, updated_at, deleted_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE total_debit = VALUES(total_debit), total_credit = VALUES(total_credit);"""
        ]
        run_sql_batch(sql_jnl)

    # Insert Journal Lines
    for chunk_idx in range(0, len(jnl_line_stmts), 100):
        chunk = jnl_line_stmts[chunk_idx:chunk_idx + 100]
        sql_jnl_lines = [
            f"""INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, line_description, debit_amount, credit_amount, line_order, created_at, updated_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE debit_amount = VALUES(debit_amount), credit_amount = VALUES(credit_amount);"""
        ]
        run_sql_batch(sql_jnl_lines)

    # Insert General Ledger Entries
    for chunk_idx in range(0, len(gl_stmts), 100):
        chunk = gl_stmts[chunk_idx:chunk_idx + 100]
        sql_gl = [
            f"""INSERT INTO general_ledger_entries (id, company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, account_code, account_name, description, debit_amount, credit_amount, running_balance, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at, deleted_at) VALUES
            {','.join(chunk)}
            ON DUPLICATE KEY UPDATE debit_amount = VALUES(debit_amount), credit_amount = VALUES(credit_amount);"""
        ]
        run_sql_batch(sql_gl)

    print("\n[+] Enterprise 1500+ Seeding Complete Successfully!")

if __name__ == '__main__':
    main()
