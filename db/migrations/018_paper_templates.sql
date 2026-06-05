-- Per-user reusable build templates (topic/blueprint/sections/options).
-- Logged-in-only tool, so these live server-side (cross-device) keyed to the user.
CREATE TABLE IF NOT EXISTS paper_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  payload MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_paper_templates_user (user_id),
  CONSTRAINT fk_paper_templates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
