-- =================================================================
-- Migration 007: analytics_events (privacy-light pageview/conversion log)
--
-- Backfilled 2026-06-03 from the live schema (created earlier by the
-- analytics work, never committed). visitor_hash is a salted, rotating
-- anonymous id; no raw IPs are stored here.
-- =================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kind          VARCHAR(24)     NOT NULL,
  path          VARCHAR(512)    NULL,
  referrer_host VARCHAR(255)    NULL,
  utm_source    VARCHAR(128)    NULL,
  device        VARCHAR(12)     NULL,
  visitor_hash  CHAR(16)        NULL,
  user_id       BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  INDEX idx_created (created_at),
  INDEX idx_kind    (kind),
  INDEX idx_visitor (visitor_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
