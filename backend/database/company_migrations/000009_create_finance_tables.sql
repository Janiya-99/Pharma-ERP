-- +goose Up
-- Disable foreign key checks temporarily to run setup smoothly
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- GROUP 1: CONFIGURATION & BASE SETTINGS
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_shipping_methods` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_terms_of_payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_reason_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_transaction_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_entry_posting_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 2: CHART OF ACCOUNTS (COA) HIERARCHY
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_main_category_types` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(10) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_main_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `main_category_type_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`main_category_type_id`) REFERENCES `finance_main_category_types` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_sub_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `main_category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`main_category_id`) REFERENCES `finance_main_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `sub_category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`sub_category_id`) REFERENCES `finance_sub_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_chart_of_accounts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `gl_code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `is_cash_bank` BOOLEAN DEFAULT FALSE,
    `show_to_po` BOOLEAN DEFAULT FALSE,
    `inter_branch` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`category_id`) REFERENCES `finance_categories` (`id`) ON DELETE RESTRICT,
    INDEX `idx_coa_gl_code` (`gl_code`),
    INDEX `idx_coa_flags` (`is_cash_bank`, `show_to_po`, `inter_branch`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 3: PARTIES & GL TRANSACTIONS (Polymorphic Ledger)
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_suppliers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `pv_nic_no` VARCHAR(50) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `contact_no` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(150) DEFAULT NULL,
    `type` TINYINT DEFAULT 1 COMMENT '1-Local, 2-Foreign',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    INDEX `idx_suppliers_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_customers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `type` TINYINT DEFAULT 1 COMMENT '1-Retail, 2-Corporate',
    `address` TEXT DEFAULT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `contact_no` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(150) DEFAULT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    INDEX `idx_customers_name` (`name`),
    INDEX `idx_customers_branch` (`branch_id`),
    CONSTRAINT `fk_finance_customers_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_gl_transactions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `reference_no` VARCHAR(50) NOT NULL COMMENT 'Origin invoice/voucher number',
    `reference_type` VARCHAR(100) NOT NULL COMMENT 'Polymorphic model reference (e.g. Invoice, JournalEntry)',
    `reference_id` BIGINT UNSIGNED NOT NULL COMMENT 'Polymorphic model ID',
    `transaction_type` ENUM('CR', 'DR') NOT NULL,
    `transaction_category` VARCHAR(100) DEFAULT NULL,
    `transaction_amount` DECIMAL(15, 2) NOT NULL,
    `transaction_date` DATE NOT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '1-Draft, 2-Posted, 3-Reversed',
    `reconciled` BOOLEAN DEFAULT FALSE,
    `description` VARCHAR(255) DEFAULT NULL,
    `cheque_no` VARCHAR(50) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    INDEX `idx_gl_trans_composite_branch` (`branch_id`, `transaction_date`),
    INDEX `idx_gl_trans_composite_gl` (`gl_id`, `transaction_date`),
    INDEX `idx_gl_trans_polymorphic` (`reference_type`, `reference_id`),
    CONSTRAINT `fk_finance_gl_trans_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 4: PRODUCTS & INVENTORY (Polymorphic Stock Tracking)
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_products` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_name` VARCHAR(255) NOT NULL,
    `product_code` VARCHAR(50) NOT NULL UNIQUE,
    `product_type` TINYINT NOT NULL COMMENT '1-Inventory, 2-Service, 3-Non-Stock',
    `cost_amount` DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    `sales_amount` DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    `minimum_qty` INT DEFAULT 0,
    `unit_type` VARCHAR(20) DEFAULT 'PCS',
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `tax_applicable` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_product_stocks` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `remaining_qty` INT NOT NULL DEFAULT 0,
    `cost_price` DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    `selling_price` DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`product_id`) REFERENCES `finance_products` (`id`) ON DELETE CASCADE,
    INDEX `idx_stock_branch_product` (`branch_id`, `product_id`),
    CONSTRAINT `fk_finance_stock_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_product_stock_histories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_stock_id` BIGINT UNSIGNED NOT NULL,
    `reference_type` VARCHAR(100) NOT NULL COMMENT 'Polymorphic reference type (e.g. GRN, Invoice, GTN)',
    `reference_id` BIGINT UNSIGNED NOT NULL COMMENT 'Polymorphic reference ID',
    `qty` INT NOT NULL,
    `remaining_qty` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_stock_id`) REFERENCES `finance_product_stocks` (`id`) ON DELETE CASCADE,
    INDEX `idx_stock_hist_poly` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 5: JOURNAL ENTRIES (General Ledger Entries)
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_journal_entries_header` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `ref_no` VARCHAR(50) NOT NULL UNIQUE,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `description` TEXT,
    `first_approve_status` TINYINT DEFAULT 0 COMMENT '0-Pending, 1-First Approved, 2-Rejected',
    `reject_reason` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_je_ref` (`ref_no`),
    INDEX `idx_je_branch_date` (`branch_id`, `created_at`),
    CONSTRAINT `fk_finance_je_header_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_journal_entries_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `journal_entry_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `credit_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `debit_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `remarks` VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (`journal_entry_id`) REFERENCES `finance_journal_entries_header` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_je_details_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_journal_entry_approvals` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `journal_entry_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `approved_status` TINYINT NOT NULL COMMENT '0-Rejected, 1-Approved',
    `approval` TINYINT NOT NULL COMMENT '1-First Approval, 2-Final Approval',
    `comment` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`journal_entry_id`) REFERENCES `finance_journal_entries_header` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_finance_je_approvals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_journal_entry_reverses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `journal_entry_id` BIGINT UNSIGNED NOT NULL,
    `reversed_by` BIGINT UNSIGNED NOT NULL,
    `approve_status` TINYINT DEFAULT 0,
    `ref_no` VARCHAR(50) NOT NULL UNIQUE,
    `reason` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`journal_entry_id`) REFERENCES `finance_journal_entries_header` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_je_reverses_user` FOREIGN KEY (`reversed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 6: CREDIT / DEBIT NOTES
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_credit_debit_note_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `ref_no` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_finance_cdn_header_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_credit_debit_note_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `credit_debit_note_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('CR', 'DR') NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `remarks` VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (`credit_debit_note_id`) REFERENCES `finance_credit_debit_note_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_cdn_details_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 7: PURCHASE ORDERS & GRN
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_purchase_orders_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Inventory GL asset account',
    `po_no` VARCHAR(50) NOT NULL UNIQUE,
    `po_date` DATE NOT NULL,
    `delivery_address` TEXT,
    `delivery_date` DATE DEFAULT NULL,
    `terms_of_payment_id` BIGINT UNSIGNED NOT NULL,
    `currency` VARCHAR(10) DEFAULT 'LKR',
    `shipping_method_id` BIGINT UNSIGNED NOT NULL,
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `total_cost` DECIMAL(15, 2) DEFAULT 0.00,
    `shipping_cost` DECIMAL(15, 2) DEFAULT 0.00,
    `tax` DECIMAL(15, 2) DEFAULT 0.00,
    `total_qty` INT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `grn_completed` BOOLEAN DEFAULT FALSE,
    `grn_blns` DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Pending GRN balance',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`terms_of_payment_id`) REFERENCES `finance_terms_of_payments` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`shipping_method_id`) REFERENCES `finance_shipping_methods` (`id`) ON DELETE RESTRICT,
    INDEX `idx_po_no` (`po_no`),
    CONSTRAINT `fk_finance_po_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_purchase_orders_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `purchase_order_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `unit_price` DECIMAL(15, 4) NOT NULL,
    `grn_blns` DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (`purchase_order_id`) REFERENCES `finance_purchase_orders_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `finance_products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_goods_received_note_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Stock Asset account to debit',
    `po_id` BIGINT UNSIGNED DEFAULT NULL,
    `grn_no` VARCHAR(50) NOT NULL UNIQUE,
    `grn_date` DATE NOT NULL,
    `bill_no` VARCHAR(50) DEFAULT NULL,
    `reference` VARCHAR(100) DEFAULT NULL,
    `bill_date` DATE DEFAULT NULL,
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `total_cost` DECIMAL(15, 2) DEFAULT 0.00,
    `shipping_cost` DECIMAL(15, 2) DEFAULT 0.00,
    `tax` DECIMAL(15, 2) DEFAULT 0.00,
    `total_qty` INT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `paid_status` TINYINT DEFAULT 1 COMMENT '1-Pending, 2-Partial, 3-Paid',
    `paid_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`po_id`) REFERENCES `finance_purchase_orders_headers` (`id`) ON DELETE SET NULL,
    INDEX `idx_grn_no` (`grn_no`),
    CONSTRAINT `fk_finance_grn_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_goods_received_note_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `grn_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL,
    `discount` DECIMAL(15, 2) DEFAULT 0.00,
    `amount` DECIMAL(15, 2) NOT NULL,
    `unit_price` DECIMAL(15, 4) NOT NULL,
    FOREIGN KEY (`grn_id`) REFERENCES `finance_goods_received_note_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `finance_products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 8: GOODS TRANSFERS & RETURNS & STOCK ADJUSTMENTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_goods_transfer_note_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_branch_id` BIGINT UNSIGNED NOT NULL,
    `to_branch_id` BIGINT UNSIGNED NOT NULL,
    `total_qty` INT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `ref_no` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_finance_gtn_from_branch` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_gtn_to_branch` FOREIGN KEY (`to_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_goods_transfer_note_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `goods_transfer_note_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `unit_price` DECIMAL(15, 4) NOT NULL,
    FOREIGN KEY (`goods_transfer_note_id`) REFERENCES `finance_goods_transfer_note_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `finance_products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_goods_return_note_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `bill_no` VARCHAR(50) DEFAULT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `grn_should_return` BIGINT UNSIGNED NOT NULL,
    `gl_account_credit` BIGINT UNSIGNED NOT NULL COMMENT 'GL account to credit for returns',
    `reference` VARCHAR(100) DEFAULT NULL,
    `reason` TEXT,
    `total_qty` INT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `ref_no` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`grn_should_return`) REFERENCES `finance_goods_received_note_headers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`gl_account_credit`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_grt_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_goods_return_note_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `goods_return_note_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `reason_id` BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (`goods_return_note_id`) REFERENCES `finance_goods_return_note_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `finance_products` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`reason_id`) REFERENCES `finance_reason_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_stock_adjust_in_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED DEFAULT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Offset account for adjustment values',
    `type` TINYINT NOT NULL COMMENT '1-Increase, 2-Decrease',
    `ref_no` VARCHAR(50) NOT NULL UNIQUE,
    `reference` VARCHAR(100) DEFAULT NULL,
    `total_qty` INT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_finance_sta_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_stock_adjust_in_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `stock_adjust_in_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `serial_no` VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (`stock_adjust_in_id`) REFERENCES `finance_stock_adjust_in_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `finance_products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 9: SALES INVOICES & CUSTOMER RECEIPTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_invoices` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `invoice_no` VARCHAR(50) NOT NULL UNIQUE,
    `invoice_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `total_fee` DECIMAL(15, 2) DEFAULT 0.00,
    `tax` DECIMAL(15, 2) DEFAULT 0.00,
    `shipping_fee` DECIMAL(15, 2) DEFAULT 0.00,
    `total_qty` INT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `tax_gl_id` BIGINT UNSIGNED DEFAULT NULL,
    `shipping_gl_id` BIGINT UNSIGNED DEFAULT NULL,
    `description` TEXT,
    `ref_no` VARCHAR(50) DEFAULT NULL,
    `paid_status` ENUM('pending', 'paid') DEFAULT 'pending',
    `paid_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `finance_customers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`tax_gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`shipping_gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE SET NULL,
    INDEX `idx_invoice_no` (`invoice_no`),
    CONSTRAINT `fk_finance_inv_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_invoice_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`invoice_id`) REFERENCES `finance_invoices` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `finance_products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_customer_receipts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `receipt_no` VARCHAR(50) NOT NULL UNIQUE,
    `date` DATE NOT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `payment_method` ENUM('cash', 'fund_transfer', 'cheque', 'card') NOT NULL,
    `bank_id` BIGINT UNSIGNED DEFAULT NULL,
    `bank_account_id` BIGINT UNSIGNED DEFAULT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Bank/Cash GL Account',
    `outstanding_amount` DECIMAL(15, 2) NOT NULL,
    `paid_amount` DECIMAL(15, 2) NOT NULL,
    `balance_amount` DECIMAL(15, 2) NOT NULL,
    `total_other_charges` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `finance_customers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_receipt_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_customer_receipt_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `customer_receipt_id` BIGINT UNSIGNED NOT NULL,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `due_amount` DECIMAL(15, 2) NOT NULL,
    `paid_amount` DECIMAL(15, 2) NOT NULL,
    `balance_amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`customer_receipt_id`) REFERENCES `finance_customer_receipts` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`invoice_id`) REFERENCES `finance_invoices` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_other_charges` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_customer_receipt_other_charge_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `customer_receipt_id` BIGINT UNSIGNED NOT NULL,
    `other_charge_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`customer_receipt_id`) REFERENCES `finance_customer_receipts` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`other_charge_id`) REFERENCES `finance_other_charges` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 10: PAYMENTS (Supplier Payments, Advances, Other Payments)
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_supplier_payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `bank_id` BIGINT UNSIGNED DEFAULT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `cheque_id` BIGINT UNSIGNED DEFAULT NULL,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` ENUM('cash', 'fund_transfer', 'cheque', 'card') NOT NULL,
    `fund_transfer_to` VARCHAR(150) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    INDEX `idx_supplier_pay_voucher` (`voucher_no`),
    CONSTRAINT `fk_finance_supplier_pay_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_supplier_payment_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `supplier_payment_id` BIGINT UNSIGNED NOT NULL,
    `grn_id` BIGINT UNSIGNED NOT NULL,
    `due_amount` DECIMAL(15, 2) NOT NULL,
    `paid_amount` DECIMAL(15, 2) NOT NULL,
    `balance_amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`supplier_payment_id`) REFERENCES `finance_supplier_payments` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`grn_id`) REFERENCES `finance_goods_received_note_headers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_advance_payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `bank_id` BIGINT UNSIGNED DEFAULT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `cheque_id` BIGINT UNSIGNED DEFAULT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `remaining_balance` DECIMAL(15, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_adv_pay_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_other_supplier_payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `from_branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `payment_date` DATE NOT NULL,
    `payment_method` ENUM('cash', 'cheque', 'fund_transfer', 'card') NOT NULL,
    `credit_gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Bank/Cash Account to Credit',
    `amount` DECIMAL(15, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`credit_gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_oth_sup_pay_from_branch` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_other_supplier_payment_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `other_supplier_payment_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Expense GL Account to Debit',
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`other_supplier_payment_id`) REFERENCES `finance_other_supplier_payments` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 11: OTHER DIRECT PAYMENTS & DIRECT RECEIPTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_other_payment_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_branch_id` BIGINT UNSIGNED NOT NULL,
    `bank_id` BIGINT UNSIGNED DEFAULT NULL,
    `bank_account_id` BIGINT UNSIGNED DEFAULT NULL,
    `cheque_id` BIGINT UNSIGNED DEFAULT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` TINYINT NOT NULL COMMENT '1-Cash, 2-Fund Transfer, 3-Cheque',
    `fund_transfer_to` VARCHAR(150) DEFAULT NULL,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_finance_oth_pay_from_branch` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_other_payment_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `other_payment_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`other_payment_id`) REFERENCES `finance_other_payment_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_other_receipts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `payment_method` TINYINT NOT NULL COMMENT '1-Cash, 2-Fund Transfer, 3-Cheque, 4-Card',
    `bank_id` BIGINT UNSIGNED DEFAULT NULL,
    `bank_account_id` BIGINT UNSIGNED DEFAULT NULL,
    `client_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Optional customer link',
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Offset asset GL account',
    `amount` DECIMAL(15, 2) NOT NULL,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`client_id`) REFERENCES `finance_customers` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_oth_rec_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_other_receipt_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `other_receipt_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`other_receipt_id`) REFERENCES `finance_other_receipts` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 12: PETTY CASH SYSTEM
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_petty_cash_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_branch_id` BIGINT UNSIGNED NOT NULL,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `petty_cash_gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Associated Petty Cash account',
    `description` VARCHAR(255) DEFAULT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL,
    `is_reimbursed` BOOLEAN DEFAULT FALSE,
    `payee` VARCHAR(150) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`petty_cash_gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_pc_headers_from_branch` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_petty_cash_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `petty_cash_header_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Expense GL account debited',
    `amount` DECIMAL(15, 2) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (`petty_cash_header_id`) REFERENCES `finance_petty_cash_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_petty_cash_reimbursement_headers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `bank_account_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_petty_cash_reimbursement_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `reimburse_header_id` BIGINT UNSIGNED NOT NULL,
    `petty_cash_header_id` BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (`reimburse_header_id`) REFERENCES `finance_petty_cash_reimbursement_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`petty_cash_header_id`) REFERENCES `finance_petty_cash_headers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_petty_cash_payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `reimburse_header_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `bank_id` BIGINT UNSIGNED NOT NULL,
    `bank_account_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL COMMENT 'Offset bank account',
    `cheque_id` BIGINT UNSIGNED DEFAULT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` TINYINT NOT NULL COMMENT '1-Cash, 2-Fund Transfer, 3-Cheque',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`reimburse_header_id`) REFERENCES `finance_petty_cash_reimbursement_headers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_pc_payments_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 13: BANK TRANSFERS & BANK RECONCILIATIONS
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_bank_transfers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `from_bank_id` BIGINT UNSIGNED NOT NULL,
    `to_bank_id` BIGINT UNSIGNED NOT NULL,
    `bank_branch_id` BIGINT UNSIGNED DEFAULT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `reference` VARCHAR(100) DEFAULT NULL,
    `from_bank_account_id` BIGINT UNSIGNED NOT NULL,
    `to_bank_account_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_finance_bt_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_bank_reconciliations` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_date` DATE NOT NULL,
    `to_date` DATE NOT NULL,
    `bank_id` BIGINT UNSIGNED NOT NULL,
    `bank_account_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `system_bank_balance` DECIMAL(15, 2) NOT NULL,
    `statement_balance` DECIMAL(15, 2) NOT NULL,
    `difference` DECIMAL(15, 2) NOT NULL,
    `reconciliation_no` VARCHAR(50) NOT NULL UNIQUE,
    `reconciliation_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_finance_reconciliation_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_bank_reconciliation_ids` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `bank_reconciliation_id` BIGINT UNSIGNED NOT NULL,
    `gl_transaction_id` BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (`bank_reconciliation_id`) REFERENCES `finance_bank_reconciliations` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_transaction_id`) REFERENCES `finance_gl_transactions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_bank_non_reconciliation_ids` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `bank_reconciliation_id` BIGINT UNSIGNED NOT NULL,
    `gl_transaction_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`bank_reconciliation_id`) REFERENCES `finance_bank_reconciliations` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_transaction_id`) REFERENCES `finance_gl_transactions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_payment_returns` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_date` DATE NOT NULL,
    `to_date` DATE NOT NULL,
    `bank_id` BIGINT UNSIGNED NOT NULL,
    `bank_account_id` BIGINT UNSIGNED NOT NULL,
    `system_bank_balance` DECIMAL(15, 2) NOT NULL,
    `statement_balance` DECIMAL(15, 2) NOT NULL,
    `difference` DECIMAL(15, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 14: FIXED ASSETS & DEPRECIATION SYSTEM
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_fixed_asset_main_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL UNIQUE,
    `disposal_controller` BIGINT UNSIGNED DEFAULT NULL,
    `disposal_income` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_fixed_asset_sub_categories` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `main_category_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`main_category_id`) REFERENCES `finance_fixed_asset_main_categories` (`id`) ON DELETE RESTRICT,
    UNIQUE KEY `idx_asset_sub_category_name` (`name`, `main_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_fixed_assets` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED DEFAULT NULL,
    `grn_item_id` BIGINT UNSIGNED DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sub_category_id` BIGINT UNSIGNED NOT NULL,
    `qty` INT NOT NULL DEFAULT 1,
    `cost_amount` DECIMAL(15, 2) NOT NULL,
    `purchase_date` DATE NOT NULL,
    `depreciation_method` TINYINT NOT NULL COMMENT '1-Straight Line, 2-Reducing Balance',
    `life_time` INT NOT NULL COMMENT 'Useful life in months',
    `depreciation_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `last_depreciation_date` DATE DEFAULT NULL,
    `gl_cost_id` BIGINT UNSIGNED NOT NULL COMMENT 'Asset Cost GL Account',
    `depreciation_id` BIGINT UNSIGNED NOT NULL COMMENT 'Depreciation Expense GL Account',
    `accumilated_depreciation_id` BIGINT UNSIGNED NOT NULL COMMENT 'Accumulated Depreciation Offset GL Account',
    `accumilated_depreciation_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `status` TINYINT DEFAULT 1 COMMENT '1-Active, 2-Fully Depreciated, 3-Disposed',
    `ref_no` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`sub_category_id`) REFERENCES `finance_fixed_asset_sub_categories` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`gl_cost_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_fa_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_fixed_asset_disposals` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `fixed_asset_id` BIGINT UNSIGNED NOT NULL,
    `disposal_date` DATE NOT NULL,
    `disposal_amount` DECIMAL(15, 2) NOT NULL,
    `disposal_type` ENUM('sold', 'donated', 'write_off') NOT NULL,
    `disposal_reason` TEXT,
    `bank_id` BIGINT UNSIGNED DEFAULT NULL,
    `bank_account_id` BIGINT UNSIGNED DEFAULT NULL,
    `sold_method` ENUM('cash', 'bank') DEFAULT 'bank',
    `sold_gl_id` BIGINT UNSIGNED DEFAULT NULL,
    `donation_expense_gl_id` BIGINT UNSIGNED DEFAULT NULL,
    `loss_on_disposal_gl_id` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`fixed_asset_id`) REFERENCES `finance_fixed_assets` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_fad_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_depreciation_schedules` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `fixed_asset_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`fixed_asset_id`) REFERENCES `finance_fixed_assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 15: SCHEDULED / RECURRING PAYMENTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_scheduled_payments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_branch_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `payment_amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('pending', 'running', 'expired', 'stopped') DEFAULT 'pending',
    `frequency` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    `start_date` DATE NOT NULL,
    `payment_date` DATE DEFAULT NULL,
    `expiry_date` DATE DEFAULT NULL,
    `is_variable` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`supplier_id`) REFERENCES `finance_suppliers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_sp_from_branch` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_scheduled_payment_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `scheduled_payment_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`scheduled_payment_id`) REFERENCES `finance_scheduled_payments` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_scheduled_payment_lists` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `scheduled_payment_id` BIGINT UNSIGNED NOT NULL,
    `voucher_no` VARCHAR(50) NOT NULL UNIQUE,
    `payment_amount` DECIMAL(15, 2) NOT NULL,
    `status` TINYINT NOT NULL COMMENT '1-Pending, 2-Completed, 3-Failed',
    `sync_status` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`scheduled_payment_id`) REFERENCES `finance_scheduled_payments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_scheduled_payment_list_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `scheduled_payment_list_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`scheduled_payment_list_id`) REFERENCES `finance_scheduled_payment_lists` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- GROUP 16: REPORTING CONFIGS, LEDGER MAPPING & AUDITING
-- =========================================================================

CREATE TABLE IF NOT EXISTS `finance_notes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `note_no` INT NOT NULL UNIQUE,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_note_gl_accounts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `note_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED DEFAULT NULL,
    FOREIGN KEY (`note_id`) REFERENCES `finance_notes` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_report_masters` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `report_name` VARCHAR(150) NOT NULL UNIQUE,
    `report_type` VARCHAR(50) NOT NULL,
    `report_category` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_report_details` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `report_master_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (`report_master_id`) REFERENCES `finance_report_masters` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_module_gl_mappings` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `module_name` VARCHAR(100) NOT NULL,
    `mapping_key` VARCHAR(100) NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    UNIQUE KEY `idx_module_mapping_unique` (`module_name`, `mapping_key`),
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_branch_to_branch_gl_accounts` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `from_branch_id` BIGINT UNSIGNED NOT NULL,
    `to_branch_id` BIGINT UNSIGNED NOT NULL,
    `gl_id` BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (`gl_id`) REFERENCES `finance_chart_of_accounts` (`id`) ON DELETE RESTRICT,
    UNIQUE KEY `idx_branch_to_branch_gl` (`from_branch_id`, `to_branch_id`),
    CONSTRAINT `fk_finance_b2b_from_branch` FOREIGN KEY (`from_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_finance_b2b_to_branch` FOREIGN KEY (`to_branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `finance_audit_trails` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `event` VARCHAR(100) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `model_id` BIGINT UNSIGNED NOT NULL,
    `old_values` JSON DEFAULT NULL,
    `new_values` JSON DEFAULT NULL,
    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_model` (`model`, `model_id`),
    INDEX `idx_audit_user` (`user_id`),
    CONSTRAINT `fk_finance_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks after table creations are complete
SET FOREIGN_KEY_CHECKS = 1;


-- +goose Down
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `finance_audit_trails`;
DROP TABLE IF EXISTS `finance_branch_to_branch_gl_accounts`;
DROP TABLE IF EXISTS `finance_module_gl_mappings`;
DROP TABLE IF EXISTS `finance_report_details`;
DROP TABLE IF EXISTS `finance_report_masters`;
DROP TABLE IF EXISTS `finance_note_gl_accounts`;
DROP TABLE IF EXISTS `finance_notes`;
DROP TABLE IF EXISTS `finance_scheduled_payment_list_details`;
DROP TABLE IF EXISTS `finance_scheduled_payment_lists`;
DROP TABLE IF EXISTS `finance_scheduled_payment_details`;
DROP TABLE IF EXISTS `finance_scheduled_payments`;
DROP TABLE IF EXISTS `finance_depreciation_schedules`;
DROP TABLE IF EXISTS `finance_fixed_asset_disposals`;
DROP TABLE IF EXISTS `finance_fixed_assets`;
DROP TABLE IF EXISTS `finance_fixed_asset_sub_categories`;
DROP TABLE IF EXISTS `finance_fixed_asset_main_categories`;
DROP TABLE IF EXISTS `finance_payment_returns`;
DROP TABLE IF EXISTS `finance_bank_non_reconciliation_ids`;
DROP TABLE IF EXISTS `finance_bank_reconciliation_ids`;
DROP TABLE IF EXISTS `finance_bank_reconciliations`;
DROP TABLE IF EXISTS `finance_bank_transfers`;
DROP TABLE IF EXISTS `finance_petty_cash_payments`;
DROP TABLE IF EXISTS `finance_petty_cash_reimbursement_details`;
DROP TABLE IF EXISTS `finance_petty_cash_reimbursement_headers`;
DROP TABLE IF EXISTS `finance_petty_cash_details`;
DROP TABLE IF EXISTS `finance_petty_cash_headers`;
DROP TABLE IF EXISTS `finance_other_receipt_details`;
DROP TABLE IF EXISTS `finance_other_receipts`;
DROP TABLE IF EXISTS `finance_other_payment_details`;
DROP TABLE IF EXISTS `finance_other_payment_headers`;
DROP TABLE IF EXISTS `finance_other_supplier_payment_details`;
DROP TABLE IF EXISTS `finance_other_supplier_payments`;
DROP TABLE IF EXISTS `finance_advance_payments`;
DROP TABLE IF EXISTS `finance_supplier_payment_details`;
DROP TABLE IF EXISTS `finance_supplier_payments`;
DROP TABLE IF EXISTS `finance_customer_receipt_other_charge_details`;
DROP TABLE IF EXISTS `finance_other_charges`;
DROP TABLE IF EXISTS `finance_customer_receipt_details`;
DROP TABLE IF EXISTS `finance_customer_receipts`;
DROP TABLE IF EXISTS `finance_invoice_details`;
DROP TABLE IF EXISTS `finance_invoices`;
DROP TABLE IF EXISTS `finance_stock_adjust_in_details`;
DROP TABLE IF EXISTS `finance_stock_adjust_in_headers`;
DROP TABLE IF EXISTS `finance_goods_return_note_details`;
DROP TABLE IF EXISTS `finance_goods_return_note_headers`;
DROP TABLE IF EXISTS `finance_goods_transfer_note_details`;
DROP TABLE IF EXISTS `finance_goods_transfer_note_headers`;
DROP TABLE IF EXISTS `finance_goods_received_note_details`;
DROP TABLE IF EXISTS `finance_goods_received_note_headers`;
DROP TABLE IF EXISTS `finance_purchase_orders_details`;
DROP TABLE IF EXISTS `finance_purchase_orders_headers`;
DROP TABLE IF EXISTS `finance_credit_debit_note_details`;
DROP TABLE IF EXISTS `finance_credit_debit_note_headers`;
DROP TABLE IF EXISTS `finance_journal_entry_reverses`;
DROP TABLE IF EXISTS `finance_journal_entry_approvals`;
DROP TABLE IF EXISTS `finance_journal_entries_details`;
DROP TABLE IF EXISTS `finance_journal_entries_header`;
DROP TABLE IF EXISTS `finance_product_stock_histories`;
DROP TABLE IF EXISTS `finance_product_stocks`;
DROP TABLE IF EXISTS `finance_products`;
DROP TABLE IF EXISTS `finance_gl_transactions`;
DROP TABLE IF EXISTS `finance_customers`;
DROP TABLE IF EXISTS `finance_suppliers`;
DROP TABLE IF EXISTS `finance_chart_of_accounts`;
DROP TABLE IF EXISTS `finance_categories`;
DROP TABLE IF EXISTS `finance_sub_categories`;
DROP TABLE IF EXISTS `finance_main_categories`;
DROP TABLE IF EXISTS `finance_main_category_types`;
DROP TABLE IF EXISTS `finance_entry_posting_categories`;
DROP TABLE IF EXISTS `finance_transaction_categories`;
DROP TABLE IF EXISTS `finance_reason_categories`;
DROP TABLE IF EXISTS `finance_terms_of_payments`;
DROP TABLE IF EXISTS `finance_shipping_methods`;

SET FOREIGN_KEY_CHECKS = 1;
