-- Seed Platform Admin Comprehensive Operational Data for all scenarios

USE erp_phrma;

-- 1. Ensure Tenant Companies cover all scenarios: Active, Expiring Soon, Expired/Locked, Trial
INSERT INTO tenant_companies (id, company_code, company_name, legal_name, registration_number, tax_number, industry, company_email, company_phone, country, timezone, database_name, database_host, database_port, subscription_status, status, license_start_date, license_end_date, created_at, updated_at)
VALUES 
  (1, 'QA20261015', 'QA20261015 Pharma Distribution (Test)', 'QA Pharma Distribution Ltd', 'PV-2026-9901', 'TIN-4920192', 'Pharmaceuticals Distribution', 'contact@qa20261015.lk', '+94 11 234 5678', 'Sri Lanka', 'Asia/Colombo', 'erp_qa20261015', 'shared-mysql', 3306, 'active', 'active', '2026-10-15 10:48:13', '2026-11-15 10:48:13', '2026-10-15 10:48:13', NOW()),
  (2, 'CEYLONMED', 'Ceylon MedEx Pharmaceuticals (Pvt) Ltd', 'Ceylon MedEx Group (Pvt) Ltd', 'PV-88912', 'TIN-9912041', 'Pharmaceutical Importer & Wholesale', 'contact@ceylonmed.lk', '+94 11 789 0123', 'Sri Lanka', 'Asia/Colombo', 'erp_ceylonmed', 'shared-mysql', 3306, 'active', 'active', '2026-10-15 11:00:01', '2027-10-15 11:00:01', '2026-10-15 11:00:01', NOW())
ON DUPLICATE KEY UPDATE 
  company_name = VALUES(company_name),
  status = VALUES(status),
  subscription_status = VALUES(subscription_status),
  license_end_date = VALUES(license_end_date);

INSERT INTO tenant_companies (id, company_code, company_name, legal_name, registration_number, tax_number, industry, company_email, company_phone, country, timezone, database_name, database_host, database_port, subscription_status, status, license_start_date, license_end_date, created_at, updated_at)
VALUES 
  (3, 'HEALTHFIRST', 'HealthFirst Pharmacy Network (Pvt) Ltd', 'HealthFirst Healthcare Holdings Ltd', 'PV-77621', 'TIN-3321942', 'Retail Pharmacy Chain', 'operations@healthfirst.lk', '+94 11 556 7890', 'Sri Lanka', 'Asia/Colombo', 'erp_healthfirst', 'shared-mysql', 3306, 'active', 'active', '2025-10-22 09:00:00', '2026-10-22 23:59:59', '2025-10-22 09:00:00', NOW()),
  (4, 'APOLLOMED', 'Apollo Healthcare & Surgical Supplies', 'Apollo Medical Lanka (Pvt) Ltd', 'PV-44102', 'TIN-1120938', 'Surgical & Medical Equipment', 'accounts@apollomed.lk', '+94 11 445 6712', 'Sri Lanka', 'Asia/Colombo', 'erp_apollomed', 'shared-mysql', 3306, 'suspended', 'suspended', '2025-10-01 08:00:00', '2026-10-01 23:59:59', '2025-10-01 08:00:00', NOW()),
  (5, 'SUNSHINEMED', 'Sunshine MediCare Distribution Ltd', 'Sunshine Healthcare Logistics', 'PV-99341', 'TIN-8839201', 'Pharmaceutical Distribution', 'admin@sunshinemed.lk', '+94 11 998 1234', 'Sri Lanka', 'Asia/Colombo', 'erp_sunshinemed', 'shared-mysql', 3306, 'active', 'active', '2026-10-01 10:00:00', '2026-10-30 23:59:59', '2026-10-01 10:00:00', NOW())
ON DUPLICATE KEY UPDATE 
  company_name = VALUES(company_name),
  status = VALUES(status),
  subscription_status = VALUES(subscription_status),
  license_end_date = VALUES(license_end_date);

-- 2. Databases metadata
INSERT INTO tenant_company_databases (tenant_company_id, database_name, database_host, database_username, database_status, migration_status, last_migrated_at, created_at, updated_at)
VALUES 
  (1, 'erp_qa20261015', 'shared-mysql', 'pharma_erp_user', 'created', 'completed', NOW(), NOW(), NOW()),
  (2, 'erp_ceylonmed', 'shared-mysql', 'pharma_erp_user', 'created', 'completed', NOW(), NOW(), NOW()),
  (3, 'erp_healthfirst', 'shared-mysql', 'pharma_erp_user', 'created', 'completed', NOW(), NOW(), NOW()),
  (4, 'erp_apollomed', 'shared-mysql', 'pharma_erp_user', 'created', 'completed', NOW(), NOW(), NOW()),
  (5, 'erp_sunshinemed', 'shared-mysql', 'pharma_erp_user', 'created', 'completed', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE database_status = VALUES(database_status);

-- 3. Subscriptions contracts
DELETE FROM tenant_company_subscriptions WHERE tenant_company_id IN (1, 2, 3, 4, 5);
INSERT INTO tenant_company_subscriptions (id, tenant_company_id, subscription_plan_id, subscription_number, start_date, end_date, billing_cycle, price, currency, status, auto_renew, created_at, updated_at)
VALUES 
  (1, 1, 2, 'SUB-QA-2026-001', '2026-10-15 10:48:13', '2026-11-15 10:48:13', 'monthly', 5000, 'LKR', 'active', 1, NOW(), NOW()),
  (2, 2, 3, 'SUB-CEY-2026-001', '2026-10-15 11:00:01', '2027-10-15 11:00:01', 'annual', 100000, 'LKR', 'active', 1, NOW(), NOW()),
  (3, 3, 2, 'SUB-HF-2025-001', '2025-10-22 09:00:00', '2026-10-22 23:59:59', 'annual', 50000, 'LKR', 'active', 1, NOW(), NOW()),
  (4, 4, 3, 'SUB-APO-2025-001', '2025-10-01 08:00:00', '2026-10-01 23:59:59', 'annual', 100000, 'LKR', 'suspended', 0, NOW(), NOW()),
  (5, 5, 1, 'SUB-SUN-2026-001', '2026-10-01 10:00:00', '2026-10-30 23:59:59', 'monthly', 0, 'LKR', 'active', 0, NOW(), NOW());

-- 4. Invoices
DELETE FROM subscription_invoices WHERE tenant_company_id IN (1, 2, 3, 4, 5);
INSERT INTO subscription_invoices (id, tenant_company_id, subscription_id, invoice_number, invoice_date, due_date, billing_period_start, billing_period_end, subtotal_amount, discount_amount, tax_amount, total_amount, paid_amount, balance_amount, invoice_status, created_at, updated_at)
VALUES 
  (1, 2, 2, 'INV-2026-001', '2026-10-15 11:00:00', '2026-10-25 23:59:59', '2026-10-15 00:00:00', '2027-10-14 23:59:59', 100000, 0, 0, 100000, 100000, 0, 'paid', NOW(), NOW()),
  (2, 1, 1, 'INV-2026-002', '2026-10-15 10:50:00', '2026-10-25 23:59:59', '2026-10-15 00:00:00', '2026-11-14 23:59:59', 50000, 0, 0, 50000, 50000, 0, 'paid', NOW(), NOW()),
  (3, 3, 3, 'INV-2026-003', '2026-10-10 09:00:00', '2026-10-22 23:59:59', '2026-10-22 00:00:00', '2027-10-21 23:59:59', 50000, 0, 0, 50000, 0, 50000, 'unpaid', NOW(), NOW()),
  (4, 4, 4, 'INV-2026-004', '2026-09-15 08:00:00', '2026-10-01 23:59:59', '2026-10-01 00:00:00', '2027-09-30 23:59:59', 100000, 0, 0, 100000, 0, 100000, 'overdue', NOW(), NOW());

-- 5. Payments
DELETE FROM subscription_payments WHERE tenant_company_id IN (1, 2);
INSERT INTO subscription_payments (id, subscription_invoice_id, tenant_company_id, payment_date, payment_method, reference_number, amount, payment_status, remarks, created_at, updated_at)
VALUES 
  (1, 1, 2, '2026-10-15 12:30:00', 'bank_transfer', 'HNB-FT-20261015-881', 100000, 'confirmed', 'Annual Enterprise SaaS License 2026-2027', NOW(), NOW()),
  (2, 2, 1, '2026-10-15 11:15:00', 'credit_card', 'STRIPE-CHG-992014', 50000, 'confirmed', 'Standard Plan Subscription Activation', NOW(), NOW());

-- 6. Support Tickets
DELETE FROM support_tickets;
INSERT INTO support_tickets (id, tenant_company_id, ticket_number, subject, description, priority, status, created_at, updated_at)
VALUES 
  (1, 2, 'TKT-20261016-001', 'Urgent: Additional branch capacity license required for Kandy facility', 'We are commissioning a new central distribution depot in Kandy on Monday. Please advise on adding 2 additional warehouse branches to our enterprise license quota.', 'high', 'open', '2026-10-16 09:30:00', '2026-10-16 14:15:00'),
  (2, 1, 'TKT-20261016-002', 'Payment receipt confirmation for Annual Invoice #INV-2026-002', 'Our finance team processed the SaaS renewal via bank transfer. Please issue the tax invoice with VAT breakdown for statutory auditing.', 'medium', 'in_progress', '2026-10-16 11:00:00', '2026-10-16 15:40:00'),
  (3, 3, 'TKT-20261017-003', 'License renewal inquiry - contract expiring in 5 days', 'Our primary agreement expires on October 22nd. Please furnish the renewal quotation and confirmed payment link to prevent any system clocking.', 'urgent', 'open', '2026-10-17 08:15:00', '2026-10-17 08:15:00'),
  (4, 2, 'TKT-20261015-004', 'MySQL automated nightly backup verification request', 'Please verify that our tenant isolated database (erp_ceylonmed) is included in the platform automated offsite snapshot routine.', 'low', 'resolved', '2026-10-15 14:00:00', '2026-10-15 17:30:00'),
  (5, 4, 'TKT-20261014-005', 'Account lock resolution: bank transfer remittance advice attached', 'Our accounts team submitted the renewal payment yesterday. Kindly lift the account suspension clock so our operations staff can resume billing.', 'urgent', 'in_progress', '2026-10-14 10:20:00', '2026-10-16 16:00:00'),
  (6, 5, 'TKT-20261012-006', 'Assistance configuring POS branch offline sync', 'We are testing POS synchronization across low-bandwidth retail counters. Requesting technical checklist documentation.', 'medium', 'closed', '2026-10-12 11:45:00', '2026-10-13 14:20:00');

-- 7. Support Ticket Messages (Thread correspondence)
DELETE FROM support_ticket_messages;
INSERT INTO support_ticket_messages (id, support_ticket_id, sender_type, sender_id, message_text, created_at, updated_at)
VALUES 
  -- Thread for Ticket 1
  (1, 1, 'client_company', 1, 'We are opening our 4th distribution hub in Kandy next Monday. Need to expand quota from 3 to 5 branches.', '2026-10-16 09:30:00', NOW()),
  (2, 1, 'platform_admin', 1, 'Hello Ceylon MedEx team. We have reviewed your request. You can expand to 5 branches under the Enterprise Tier. A supplementary quote of 20,000 LKR has been generated.', '2026-10-16 10:15:00', NOW()),
  (3, 1, 'client_company', 1, 'Thank you. Managing Director has approved. Please provision the branch slots.', '2026-10-16 14:15:00', NOW()),

  -- Thread for Ticket 2
  (4, 2, 'client_company', 2, 'Payment reference STRIPE-CHG-992014 has cleared on our card statement. Kindly send final invoice PDF.', '2026-10-16 11:00:00', NOW()),
  (5, 2, 'platform_admin', 1, 'Payment confirmed. The official VAT receipt has been registered under your Billing & Invoices tab.', '2026-10-16 15:40:00', NOW()),

  -- Thread for Ticket 3
  (6, 3, 'client_company', 3, 'Contract ends October 22. Need 1-year extension quote today.', '2026-10-17 08:15:00', NOW()),

  -- Thread for Ticket 4
  (7, 4, 'client_company', 1, 'Can you confirm daily backup retention policy for erp_ceylonmed?', '2026-10-15 14:00:00', NOW()),
  (8, 4, 'platform_admin', 1, 'Automated snapshots execute daily at 02:00 AM UTC with 30-day encrypted retention.', '2026-10-15 17:30:00', NOW()),

  -- Thread for Ticket 5
  (9, 5, 'client_company', 4, 'Our staff is locked out from logging into the ERP. Remittance advice slip #991024 submitted to accounts@platform.com. Please unlock our tenant.', '2026-10-14 10:20:00', NOW()),
  (10, 5, 'platform_admin', 1, 'Remittance received and currently undergoing bank clearance verification. Temporary grace extension of 48 hours is being reviewed.', '2026-10-16 16:00:00', NOW()),

  -- Thread for Ticket 6
  (11, 6, 'client_company', 5, 'Need offline sync documentation for cashier stations.', '2026-10-12 11:45:00', NOW()),
  (12, 6, 'platform_admin', 1, 'Documentation PDF dispatched. Issue marked resolved.', '2026-10-13 14:20:00', NOW());

-- 8. Security Audit Logs
DELETE FROM platform_audit_logs;
INSERT INTO platform_audit_logs (user_id, action, target_type, target_id, details, ip_address, user_agent, created_at)
VALUES 
  (1, 'company.activate', 'tenant_companies', '2', 'Activated enterprise license for Ceylon MedEx Pharmaceuticals', '127.0.0.1', 'Mozilla/5.0 (Admin Console)', NOW() - INTERVAL 2 DAY),
  (1, 'company.suspend', 'tenant_companies', '4', 'Enforced automatic subscription lock / clocking on Apollo Healthcare due to payment lapse', '127.0.0.1', 'System Scheduler', NOW() - INTERVAL 1 DAY),
  (1, 'ticket.status_update', 'support_tickets', '4', 'Resolved backup verification inquiry for Ceylon MedEx', '127.0.0.1', 'Platform Admin', NOW() - INTERVAL 18 HOUR),
  (1, 'ticket.message_sent', 'support_tickets', '5', 'Dispatched clearance update to Apollo Healthcare', '127.0.0.1', 'Platform Admin', NOW() - INTERVAL 6 HOUR),
  (1, 'system.ai_evaluation', 'tenant_companies', '2', 'Autonomous AI Tenant Diagnostics generated: Health Score 96/100 (Grade A+)', '127.0.0.1', 'AI Sentinel Engine', NOW() - INTERVAL 1 HOUR);
