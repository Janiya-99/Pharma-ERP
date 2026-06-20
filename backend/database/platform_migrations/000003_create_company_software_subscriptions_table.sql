-- +goose Up
-- Platform: Company Software Subscriptions
-- Controls which company can access which software/module.
CREATE TABLE IF NOT EXISTS `company_software_subscriptions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,

    `platform_company_id` BIGINT NOT NULL,
    `software_id` BIGINT NOT NULL,

    `subscription_plan` VARCHAR(50) DEFAULT NULL,
    `subscription_status` VARCHAR(50) DEFAULT 'active',
    `start_date` DATE DEFAULT NULL,
    `end_date` DATE DEFAULT NULL,

    `status` VARCHAR(30) DEFAULT 'active',

    `created_at` DATETIME DEFAULT NULL,
    `updated_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_company_software` (`platform_company_id`, `software_id`),
    CONSTRAINT `fk_css_company` FOREIGN KEY (`platform_company_id`) REFERENCES `platform_companies` (`id`),
    CONSTRAINT `fk_css_software` FOREIGN KEY (`software_id`) REFERENCES `software_catalog` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `company_software_subscriptions`;
