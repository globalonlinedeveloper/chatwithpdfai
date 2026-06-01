-- =================================================================
-- Migration 010: rename Studio internals -> Question Papers
-- Applied live 2026-06-01 via expand/migrate/contract (zero downtime).
-- Tables: studio_papers->papers, studio_assignments->paper_assignments,
--         studio_attempts->paper_attempts, studio_seen_questions->paper_seen_questions
-- Ledger: credit_transactions.reason 'studio_paper'->'paper', ref_type 'studio'->'paper'
-- =================================================================
-- EXPAND (backward-compatible; live code keeps working via views):
ALTER TABLE credit_transactions MODIFY reason ENUM('purchase','chat','refund','grant','adjust','studio_paper','paper') NOT NULL;
RENAME TABLE studio_papers TO papers, studio_assignments TO paper_assignments, studio_attempts TO paper_attempts, studio_seen_questions TO paper_seen_questions;
CREATE VIEW studio_papers AS SELECT * FROM papers;
CREATE VIEW studio_assignments AS SELECT * FROM paper_assignments;
CREATE VIEW studio_attempts AS SELECT * FROM paper_attempts;
CREATE VIEW studio_seen_questions AS SELECT * FROM paper_seen_questions;
-- (deploy app code referencing the new names) --
-- CONTRACT (after new code is live):
UPDATE credit_transactions SET reason='paper', ref_type='paper' WHERE reason='studio_paper';
ALTER TABLE credit_transactions MODIFY reason ENUM('purchase','chat','refund','grant','adjust','paper') NOT NULL;
DROP VIEW studio_papers, studio_assignments, studio_attempts, studio_seen_questions;
