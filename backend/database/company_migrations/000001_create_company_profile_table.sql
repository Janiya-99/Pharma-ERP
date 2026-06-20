-- +goose Up
-- Company Database: Company Profile
-- Stores the company's own profile in its dedicated database.
-- NOTE: Do NOT use tenant_id. Use company_id, branch_id, created_by, updated_by.
CREATE TABLE IF NOT EXISTS `company_profile` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL COMMENT 'Matches platform_companies.id',
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `tax_id` VARCHAR(100) DEFAULT NULL,
    `registration_no` VARCHAR(100) DEFAULT NULL,
    `address` VARCHAR(500) DEFAULT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `logo_url` VARCHAR(500) DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_company_profile_code` (`code`),
    INDEX `idx_company_profile_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `company_profile`;
