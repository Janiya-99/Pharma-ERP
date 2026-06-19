-- +goose Up
CREATE TABLE IF NOT EXISTS `designations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_designations_company` (`company_id`),
    INDEX `idx_designations_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_designations_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users` ADD COLUMN `designation_id` BIGINT UNSIGNED DEFAULT NULL AFTER `branch_id`;
ALTER TABLE `users` ADD CONSTRAINT `fk_users_designation` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE RESTRICT;

-- +goose Down
ALTER TABLE `users` DROP FOREIGN KEY `fk_users_designation`;
ALTER TABLE `users` DROP COLUMN `designation_id`;
DROP TABLE IF EXISTS `designations`;
