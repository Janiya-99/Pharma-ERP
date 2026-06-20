-- +goose Up
CREATE TABLE IF NOT EXISTS `departments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `company_id` BIGINT UNSIGNED NOT NULL,

    `department_code` VARCHAR(50) DEFAULT NULL,
    `department_name` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,

    `status` VARCHAR(30) DEFAULT 'active',

    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,
    `deleted_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_departments_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `idx_departments_company_name` (`company_id`, `department_name`),
    INDEX `idx_departments_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `departments`;
