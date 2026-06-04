-- =================================================================
-- Migration 014: paper_attempts.away_count — light test integrity.
-- Counts how many times the student left the test tab/window
-- (visibilitychange -> hidden) during an online attempt. Surfaced to
-- the teacher in the Scores drilldown as a soft proctoring signal.
-- Apply manually (see 003 for the SSH command):
--   MYSQL_PWD='<DB_PASSWORD>' mysql -h 127.0.0.1 -u u692382124_chatwithpdf \
--     u692382124_chatwithpdfai < 014_attempt_integrity.sql
-- =================================================================
ALTER TABLE paper_attempts ADD COLUMN IF NOT EXISTS away_count INT UNSIGNED NOT NULL DEFAULT 0;
