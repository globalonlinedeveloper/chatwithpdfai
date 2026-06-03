-- =================================================================
-- Migration 006: question-paper product tables
--   papers, paper_assignments, paper_attempts, paper_seen_questions
--
-- Backfilled 2026-06-03: these tables were created on the live DB by
-- earlier (uncommitted) "studio/papers" work and never captured as a
-- migration. This file makes db/migrations reproduce production.
-- DDL matches the live schema exactly (keys re-applied in the 2026-06-03
-- schema repair). Like the other product tables, user_id carries no FK
-- to users (mirrors pdf_documents in 003).
-- =================================================================

CREATE TABLE IF NOT EXISTS papers (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  title         VARCHAR(160)    NOT NULL,
  exam_style    VARCHAR(80)     NULL,
  num_questions INT UNSIGNED    NOT NULL DEFAULT 0,
  payload       LONGTEXT        NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user    (user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS paper_assignments (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  token         VARCHAR(24)     NOT NULL,
  title         VARCHAR(160)    NOT NULL,
  num_questions INT UNSIGNED    NOT NULL DEFAULT 0,
  payload       LONGTEXT        NOT NULL,
  active        TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token (token),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS paper_attempts (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  assignment_id BIGINT UNSIGNED NOT NULL,
  student_name  VARCHAR(120)    NULL,
  score         INT UNSIGNED    NOT NULL DEFAULT 0,
  total         INT UNSIGNED    NOT NULL DEFAULT 0,
  answers       LONGTEXT        NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_assignment (assignment_id),
  CONSTRAINT fk_attempt_assignment
    FOREIGN KEY (assignment_id) REFERENCES paper_assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS paper_seen_questions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  topic_key  VARCHAR(80)     NOT NULL,
  stem       VARCHAR(220)    NOT NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_topic (user_id, topic_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
