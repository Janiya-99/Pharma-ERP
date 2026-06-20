-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `branch_id` BIGINT UNSIGNED DEFAULT NULL,
    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `software_code` VARCHAR(50) DEFAULT NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity_name` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT UNSIGNED DEFAULT NULL,
    `old_values` JSON DEFAULT NULL,
    `new_values` JSON DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_audit_logs_company_id` (`company_id`),
    INDEX `idx_audit_logs_branch_id` (`branch_id`),
    INDEX `idx_audit_logs_user_id` (`user_id`),
    INDEX `idx_audit_logs_action` (`action`),
    INDEX `idx_audit_logs_entity` (`entity_name`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS `audit_logs`;
-- +goose StatementEnd
