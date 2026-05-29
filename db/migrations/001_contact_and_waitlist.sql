-- =================================================================
-- Migration 001: contact_submissions + waitlist_signups
-- Applied: 2026-05-28
-- =================================================================
-- To apply manually on Hostinger:
--   ssh hostinger  MYSQL_PWD='...' mysql -h 127.0.0.1 -u u692382124_chatwithpdf u692382124_chatwithpdfai < 001_contact_and_waitlist.sql

CREATE TABLE IF NOT EXISTS contact_submissions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email        VARCHAR(320)    NOT NULL,
  topic        VARCHAR(32)     NOT NULL,
  message      TEXT            NOT NULL,
  ip           VARCHAR(45)     NULL,
  user_agent   VARCHAR(512)    NULL,
  referer      VARCHAR(512)    NULL,
  status       ENUM('new','read','replied','spam') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email      (email),
  INDEX idx_status     (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email        VARCHAR(320)    NOT NULL,
  source       VARCHAR(64)     NULL,
  ip           VARCHAR(45)     NULL,
  user_agent   VARCHAR(512)    NULL,
  referer      VARCHAR(512)    NULL,
  confirmed    TINYINT(1)      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
