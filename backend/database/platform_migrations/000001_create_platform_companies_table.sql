-- +goose Up
-- Platform: Registered Companies
-- Stores each ERP client company and the database connection details for that company.
CREATE TABLE IF NOT EXISTS `platform_companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,

    `company_code` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(150) NOT NULL,

    `contact_person` VARCHAR(150) DEFAULT NULL,
    `email` VARCHAR(150) DEFAULT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,

    `database_name` VARCHAR(100) NOT NULL,
    `database_host` VARCHAR(100) DEFAULT 'localhost',
    `database_port` INT DEFAULT 3306,
    `database_user` VARCHAR(100) DEFAULT NULL,
    `database_password_key` VARCHAR(150) DEFAULT NULL,

    `subscription_status` VARCHAR(50) DEFAULT 'active',
    `status` VARCHAR(30) DEFAULT 'active',

    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,
    `deleted_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_platform_companies_code` (`company_code`),
    UNIQUE KEY `idx_platform_companies_dbname` (`database_name`),
    INDEX `idx_platform_companies_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `platform_companies`;
