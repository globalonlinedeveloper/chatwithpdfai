-- =================================================================
-- Migration 013: paper_question_bank — reusable per-question bank.
-- Teachers save individual generated questions and reuse them across papers.
-- Apply manually (see 003 for the SSH command):
--   MYSQL_PWD='<DB_PASSWORD>' mysql -h 127.0.0.1 -u u692382124_chatwithpdf \
--     u692382124_chatwithpdfai < 013_question_bank.sql
-- =================================================================
CREATE TABLE IF NOT EXISTS paper_question_bank (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        VARCHAR(20)     NOT NULL,
  stem        VARCHAR(300)    NOT NULL,
  topic       VARCHAR(160)    NULL,
  payload     LONGTEXT        NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_qbank_user (user_id, created_at),
  CONSTRAINT fk_qbank_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
