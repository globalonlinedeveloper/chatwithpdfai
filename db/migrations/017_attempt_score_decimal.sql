-- =================================================================
-- Migration 017: paper_attempts.score/total -> DECIMAL for negative marking.
-- Negative marking yields fractional scores (e.g. 4.75); the old INT column
-- would silently truncate them. Widening to DECIMAL(7,2) preserves existing
-- integer values (X -> X.00). The assignments API Number()-coerces these on
-- read so mysql2's decimal-as-string doesn't reach the client.
-- Apply manually (see 003 for the SSH command):
--   MYSQL_PWD='<DB_PASSWORD>' mysql -h 127.0.0.1 -u u692382124_chatwithpdf \
--     u692382124_chatwithpdfai < 017_attempt_score_decimal.sql
-- =================================================================
ALTER TABLE paper_attempts
  MODIFY COLUMN score DECIMAL(7,2) NOT NULL DEFAULT 0,
  MODIFY COLUMN total DECIMAL(7,2) NOT NULL DEFAULT 0;
