-- +goose Up
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `software_id` BIGINT UNSIGNED NOT NULL,

    `permission_group` VARCHAR(100) NOT NULL,
    `permission_key` VARCHAR(150) NOT NULL UNIQUE,
    `permission_name` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,

    `status` VARCHAR(30) DEFAULT 'active',

    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_permissions_software` FOREIGN KEY (`software_id`) REFERENCES `software_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `permissions`;
