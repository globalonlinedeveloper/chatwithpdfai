-- =================================================================
-- Migration 016: paper_seen_questions — add ON DELETE CASCADE to users.
-- The cross-session "never repeat a question" history (paper_seen_questions)
-- had NO foreign key to users, so deleting a user left orphan stem rows behind
-- (privacy: their generated question text persisted; plus unbounded growth).
-- This adds the missing FK so the rows are purged with the account, matching
-- every other user-owned table (papers, paper_assignments, bank_grants, ...).
--
-- NOTE: the ALTER fails if orphan rows already exist, so delete them first.
-- Apply manually (see 003 for the SSH command):
--   MYSQL_PWD='<DB_PASSWORD>' mysql -h 127.0.0.1 -u u692382124_chatwithpdf \
--     u692382124_chatwithpdfai < 016_seen_questions_cascade.sql
-- =================================================================
DELETE FROM paper_seen_questions WHERE user_id NOT IN (SELECT id FROM users);

ALTER TABLE paper_seen_questions
  ADD CONSTRAINT fk_seen_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
