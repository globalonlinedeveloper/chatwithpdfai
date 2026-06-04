-- =================================================================
-- Migration 015: bank_grants — co-teacher question-bank sharing (#7).
-- An owner grants read/insert access to their question bank to a
-- colleague identified by email. The grantee sees the owner's bank
-- questions alongside their own (read-only: insert/copy, never delete).
-- Apply manually (see 003 for the SSH command):
--   MYSQL_PWD='<DB_PASSWORD>' mysql -h 127.0.0.1 -u u692382124_chatwithpdf \
--     u692382124_chatwithpdfai < 015_bank_grants.sql
-- =================================================================
CREATE TABLE IF NOT EXISTS bank_grants (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  grantee_email VARCHAR(320)    NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_grant (owner_user_id, grantee_email),
  INDEX idx_grantee (grantee_email),
  CONSTRAINT fk_grant_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
