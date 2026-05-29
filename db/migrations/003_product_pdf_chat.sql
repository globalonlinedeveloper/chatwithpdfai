-- =================================================================
-- Migration 003: PDF chat product (documents, pages, chat, usage, cache)
-- Created: 2026-05-29  (Phase 1 / milestone M1)
--
-- REQUIRES MariaDB 11.7+ for the native VECTOR type + VECTOR INDEX.
--   Hostinger production is MariaDB 11.8.6 (confirmed) — OK.
--
-- Apply manually (this is NOT auto-run on deploy):
--   ssh hostinger
--   MYSQL_PWD='<DB_PASSWORD>' mysql -h 127.0.0.1 -u u692382124_chatwithpdf \
--     u692382124_chatwithpdfai < 003_product_pdf_chat.sql
--
-- ⚠ The exact `VECTOR INDEX ... DISTANCE=cosine` clause has not been run
--   against 11.8.6 from this machine — validate on first apply (see
--   REQUIREMENTS.md Open questions / M1). Everything else is standard DDL.
--
-- Design notes:
--   * Every user-owned table carries user_id. Auth lands later (M5); until
--     then the app writes a stub user id behind the PRODUCT_MVP feature flag,
--     so the data model is already launch-ready.
--   * pdf_pages.embedding is VECTOR(1536) (OpenAI text-embedding-3-small) and
--     is NOT NULL because MariaDB vector indexes require non-null values.
--     Pages are therefore inserted AFTER embeddings are computed
--     (extract -> embed -> bulk insert), matching the per-page design.
--   * One row per page; an over-long page may be split into chunks that share
--     page_number (chunk_index disambiguates) for clean citation.
-- =================================================================

CREATE TABLE IF NOT EXISTS pdf_documents (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id           BIGINT UNSIGNED NOT NULL,
  original_filename VARCHAR(512)    NOT NULL,
  disk_path         VARCHAR(768)    NOT NULL,
  file_size_bytes   BIGINT UNSIGNED NOT NULL DEFAULT 0,
  page_count        INT UNSIGNED    NOT NULL DEFAULT 0,
  status            ENUM('uploaded','processing','ready','failed') NOT NULL DEFAULT 'uploaded',
  error_message     VARCHAR(512)    NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user       (user_id),
  INDEX idx_status     (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pdf_pages (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_id   BIGINT UNSIGNED NOT NULL,
  page_number   INT UNSIGNED    NOT NULL,
  chunk_index   INT UNSIGNED    NOT NULL DEFAULT 0,
  text          MEDIUMTEXT      NOT NULL,
  token_count   INT UNSIGNED    NOT NULL DEFAULT 0,
  source        ENUM('text','ocr') NOT NULL DEFAULT 'text',
  embedding     VECTOR(1536)    NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_document (document_id),
  INDEX idx_doc_page (document_id, page_number),
  -- HNSW cosine index for top-k retrieval (added now, not retrofitted later):
  VECTOR INDEX (embedding) DISTANCE=cosine,
  CONSTRAINT fk_pages_document
    FOREIGN KEY (document_id) REFERENCES pdf_documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_conversations (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  primary_document_id BIGINT UNSIGNED NULL,
  title               VARCHAR(255)    NULL,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user             (user_id),
  INDEX idx_primary_document (primary_document_id),
  CONSTRAINT fk_conv_document
    FOREIGN KEY (primary_document_id) REFERENCES pdf_documents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  role            ENUM('user','assistant','system') NOT NULL,
  content         MEDIUMTEXT      NOT NULL,
  cited_page_ids  JSON            NULL,
  credits_used    INT UNSIGNED    NOT NULL DEFAULT 0,
  llm_provider    VARCHAR(32)     NULL,
  llm_model       VARCHAR(64)     NULL,
  input_tokens    INT UNSIGNED    NOT NULL DEFAULT 0,
  output_tokens   INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_conversation (conversation_id),
  CONSTRAINT fk_msg_conversation
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cost ledger: every LLM call (chat/embed/ocr) logged for margin tracking.
CREATE TABLE IF NOT EXISTS llm_usage (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NULL,
  document_id     BIGINT UNSIGNED NULL,
  task            ENUM('chat','embed','ocr') NOT NULL,
  provider        VARCHAR(32)     NOT NULL,
  model           VARCHAR(64)     NOT NULL,
  input_tokens    INT UNSIGNED    NOT NULL DEFAULT 0,
  output_tokens   INT UNSIGNED    NOT NULL DEFAULT 0,
  cost_inr        DECIMAL(12,6)   NOT NULL DEFAULT 0,
  credits_charged INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user       (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Response cache (margin booster): same model + scope + normalized query -> cached answer.
CREATE TABLE IF NOT EXISTS llm_cache (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cache_key      CHAR(64)        NOT NULL,    -- sha256(model + document scope + normalized query)
  document_id    BIGINT UNSIGNED NULL,
  model          VARCHAR(64)     NOT NULL,
  response_text  MEDIUMTEXT      NOT NULL,
  cited_page_ids JSON            NULL,
  hit_count      INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_hit_at    TIMESTAMP       NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cache_key (cache_key),
  INDEX idx_document (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
