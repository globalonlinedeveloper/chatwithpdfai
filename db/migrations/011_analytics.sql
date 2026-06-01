-- =================================================================
-- Migration 011: first-party, privacy-preserving analytics
-- No cookies, no PII. visitor_hash is a daily-rotating, non-reversible
-- hash of ip+ua+salt+date — cannot be traced back to a person.
-- =================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kind           VARCHAR(24)     NOT NULL,          -- pageview | signup | upload | purchase | paper
  path           VARCHAR(512)    NULL,
  referrer_host  VARCHAR(255)    NULL,              -- host only, never full URL
  utm_source     VARCHAR(128)    NULL,
  device         VARCHAR(12)     NULL,              -- mobile | desktop
  visitor_hash   CHAR(16)        NULL,              -- anonymized, rotates daily
  user_id        BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_created (created_at),
  KEY idx_kind_created (kind, created_at),
  KEY idx_path (path(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
