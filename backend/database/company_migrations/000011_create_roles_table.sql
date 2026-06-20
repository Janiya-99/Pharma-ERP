-- +goose Up
CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `software_id` BIGINT UNSIGNED NOT NULL,

    `role_name` VARCHAR(100) NOT NULL,
    `role_code` VARCHAR(100) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,

    `is_system_role` BOOLEAN DEFAULT false,
    `status` VARCHAR(30) DEFAULT 'active',

    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,
    `deleted_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_roles_software` FOREIGN KEY (`software_id`) REFERENCES `software_modules` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `idx_roles_software_name` (`software_id`, `role_name`),
    UNIQUE KEY `idx_roles_software_code` (`software_id`, `role_code`),
    INDEX `idx_roles_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `roles`;
