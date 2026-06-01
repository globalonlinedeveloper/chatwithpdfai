-- =================================================================
-- Migration 012: allow 'signup_bonus' as a credit_transactions reason
-- (free starter credits granted on signup). Applied live 2026-06-01.
-- =================================================================
ALTER TABLE credit_transactions
  MODIFY reason ENUM('purchase','chat','refund','grant','adjust','paper','signup_bonus') NOT NULL;
