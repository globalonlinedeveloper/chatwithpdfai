-- =================================================================
-- Migration 009: add 'studio_paper' to credit_transactions.reason
-- Created: 2026-05-30.
-- The Studio paper generator charges with reason='studio_paper', which
-- was missing from the ENUM. Under non-strict sql_mode MariaDB silently
-- stored '' (blank); under strict mode it would ERROR and 500 every paid
-- Studio generation. This adds the value and relabels any blank rows.
-- =================================================================

ALTER TABLE credit_transactions
  MODIFY reason ENUM('purchase','chat','refund','grant','adjust','studio_paper') NOT NULL;

UPDATE credit_transactions
  SET reason = 'studio_paper'
  WHERE reason = '' AND ref_type = 'studio';
