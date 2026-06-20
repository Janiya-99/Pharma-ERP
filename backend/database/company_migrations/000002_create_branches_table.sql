-- +goose Up
CREATE TABLE IF NOT EXISTS `branches` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `company_id` BIGINT UNSIGNED NOT NULL,

    `branch_code` VARCHAR(50) NOT NULL,
    `branch_name` VARCHAR(150) NOT NULL,
    `branch_type` VARCHAR(50) DEFAULT NULL,

    `address` TEXT DEFAULT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `email` VARCHAR(150) DEFAULT NULL,

    `is_main_branch` BOOLEAN DEFAULT false,
    `status` VARCHAR(30) DEFAULT 'active',

    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,
    `deleted_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_branches_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `idx_branches_company_code` (`company_id`, `branch_code`),
    INDEX `idx_branches_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `branches`;
