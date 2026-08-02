-- +goose Up
CREATE TABLE IF NOT EXISTS `login_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `email` VARCHAR(150) DEFAULT NULL,

    `login_status` VARCHAR(50) DEFAULT NULL,
    `failure_reason` TEXT DEFAULT NULL,

    `ip_address` VARCHAR(100) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,

    `logged_at` DATETIME DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_login_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down
DROP TABLE IF EXISTS `login_logs`;
