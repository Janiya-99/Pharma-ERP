-- +goose Up
-- Company Database: User Branch Access & User Software Access
-- Supports: One user can have multiple branch access and multiple software access
-- with different roles per branch and per software.

-- User Branch Access: which branches a user can access, with optional role per branch
CREATE TABLE IF NOT EXISTS `user_branch_access` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Role for this user in this branch',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_branch` (`user_id`, `branch_id`),
    CONSTRAINT `fk_uba_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_uba_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_uba_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Software Access: which software modules a user can access, with optional role per module
CREATE TABLE IF NOT EXISTS `user_software_access` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `module_code` VARCHAR(50) NOT NULL COMMENT 'e.g., FINANCE, INVENTORY, INVOICE, COMPLIANCE',
    `role_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Role for this user in this module',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_module` (`user_id`, `module_code`),
    CONSTRAINT `fk_usa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_usa_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `user_software_access`;
DROP TABLE IF EXISTS `user_branch_access`;
