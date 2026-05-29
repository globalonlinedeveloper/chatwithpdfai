-- =================================================================
-- Migration 004: credit packs + ledger + purchases (Phase 4 / M6)
-- Created: 2026-05-29. Apply manually (see 003 for the SSH command).
-- M6a uses credit_packs + user_credits + credit_transactions.
-- M6b (Razorpay) uses purchases.
-- =================================================================

CREATE TABLE IF NOT EXISTS credit_packs (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(32)  NOT NULL,
  name       VARCHAR(64)  NOT NULL,
  price_inr  INT UNSIGNED NOT NULL,
  credits    INT UNSIGNED NOT NULL,
  active     TINYINT(1)   NOT NULL DEFAULT 1,
  sort       INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_credits (
  user_id    BIGINT UNSIGNED NOT NULL,
  balance    INT             NOT NULL DEFAULT 0,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS credit_transactions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  delta      INT             NOT NULL,   -- + purchase/grant/refund, - usage
  reason     ENUM('purchase','chat','refund','grant','adjust') NOT NULL,
  ref_type   VARCHAR(32)     NULL,
  ref_id     BIGINT UNSIGNED NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_ct_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchases (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  pack_id             INT UNSIGNED    NULL,
  razorpay_order_id   VARCHAR(64)     NULL,
  razorpay_payment_id VARCHAR(64)     NULL,
  amount_inr          INT UNSIGNED    NOT NULL,
  credits             INT UNSIGNED    NOT NULL,
  status              ENUM('created','paid','failed','refunded') NOT NULL DEFAULT 'created',
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rzp_order (razorpay_order_id),
  INDEX idx_user (user_id),
  CONSTRAINT fk_pur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO credit_packs (code, name, price_inr, credits, sort) VALUES
  ('reader',     'Reader',     399,   50, 1),
  ('practice',   'Practice',   999,  200, 2),
  ('chamber',    'Chamber',   2999,  700, 3),
  ('enterprise', 'Enterprise',9999, 2500, 4)
ON DUPLICATE KEY UPDATE name=VALUES(name), price_inr=VALUES(price_inr), credits=VALUES(credits), sort=VALUES(sort), active=1;
