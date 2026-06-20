-- +goose Up
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `company_id` BIGINT UNSIGNED NOT NULL,

    `employee_code` VARCHAR(50) DEFAULT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,

    `department_id` BIGINT UNSIGNED DEFAULT NULL,
    `designation_id` BIGINT UNSIGNED DEFAULT NULL,
    `default_branch_id` BIGINT UNSIGNED DEFAULT NULL,

    `user_type` VARCHAR(50) DEFAULT 'company_user',
    `profile_image_url` TEXT DEFAULT NULL,

    `last_login_at` DATETIME DEFAULT NULL,

    `status` VARCHAR(30) DEFAULT 'active',

    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,
    `deleted_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_users_designation` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_users_default_branch` FOREIGN KEY (`default_branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
    UNIQUE KEY `idx_users_email` (`email`),
    UNIQUE KEY `idx_users_company_employee` (`company_id`, `employee_code`),
    INDEX `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `users`;
