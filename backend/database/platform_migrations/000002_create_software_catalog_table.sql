-- +goose Up
-- Platform: Software Catalog
-- Stores all software/modules available in the ERP platform.
CREATE TABLE IF NOT EXISTS `software_catalog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,

    `software_code` VARCHAR(50) NOT NULL,
    `software_name` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `icon_name` VARCHAR(100) DEFAULT NULL,
    `route_path` VARCHAR(150) DEFAULT NULL,
    `display_order` INT DEFAULT 0,

    `status` VARCHAR(30) DEFAULT 'active',

    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_software_catalog_code` (`software_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `software_catalog`;
