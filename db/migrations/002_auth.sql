-- =================================================================
-- Migration 002: users + sessions tables for auth
-- Applied: 2026-05-28
-- =================================================================

CREATE TABLE IF NOT EXISTS users (
  id                         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email                      VARCHAR(320)    NOT NULL,
  password_hash              VARCHAR(255)    NOT NULL,
  name                       VARCHAR(120)    NULL,
  email_verified             TINYINT(1)      NOT NULL DEFAULT 0,
  verification_token         VARCHAR(64)     NULL,
  verification_expires_at    TIMESTAMP       NULL,
  password_reset_token       VARCHAR(64)     NULL,
  password_reset_expires_at  TIMESTAMP       NULL,
  failed_login_attempts      INT UNSIGNED    NOT NULL DEFAULT 0,
  locked_until               TIMESTAMP       NULL,
  created_at                 TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                 TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_signin_at             TIMESTAMP       NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email                    (email),
  INDEX      idx_verification_token      (verification_token),
  INDEX      idx_password_reset_token    (password_reset_token),
  INDEX      idx_created_at              (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token         CHAR(64)        NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  expires_at    TIMESTAMP       NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip            VARCHAR(45)     NULL,
  user_agent    VARCHAR(512)    NULL,
  PRIMARY KEY (token),
  INDEX idx_user_id    (user_id),
  INDEX idx_expires_at (expires_at),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
