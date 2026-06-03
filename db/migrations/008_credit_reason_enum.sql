-- =================================================================
-- Migration 008: widen credit_transactions.reason ENUM
--
-- Backfilled 2026-06-03. Migration 004 created reason as
--   ENUM('purchase','chat','refund','grant','adjust').
-- Later work added 'paper' (question-paper generation spend) and
-- 'signup_bonus' (free starter credits). This captures that drift so
-- db/migrations matches the live ENUM.
-- =================================================================

ALTER TABLE credit_transactions
  MODIFY reason ENUM('purchase','chat','refund','grant','adjust','paper','signup_bonus') NOT NULL;
