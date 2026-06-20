-- +goose Up
CREATE TABLE IF NOT EXISTS `user_software_access` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `user_id` BIGINT UNSIGNED NOT NULL,
    `software_id` BIGINT UNSIGNED NOT NULL,

    `can_access` BOOLEAN DEFAULT true,
    `status` VARCHAR(30) DEFAULT 'active',

    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_user_software_access_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_software_access_software` FOREIGN KEY (`software_id`) REFERENCES `software_modules` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `idx_user_software_access` (`user_id`, `software_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `user_software_access`;
