-- +goose Up
CREATE TABLE IF NOT EXISTS `user_branch_access` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `user_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED NOT NULL,

    `is_default` BOOLEAN DEFAULT false,
    `status` VARCHAR(30) DEFAULT 'active',

    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_user_branch_access_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_branch_access_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `idx_user_branch_access` (`user_id`, `branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `user_branch_access`;
