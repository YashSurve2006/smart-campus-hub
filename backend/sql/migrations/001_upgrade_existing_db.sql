-- Optional migration for databases created from an older smart_campus.sql.
-- Run manually; skip statements that fail if objects already exist.

USE smart_campus;

ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL AFTER avatar_url;
ALTER TABLE faculty ADD COLUMN specialization VARCHAR(255) NULL AFTER designation;
ALTER TABLE notices ADD COLUMN notice_category VARCHAR(64) NOT NULL DEFAULT 'general' AFTER attachment_url;
ALTER TABLE notices ADD COLUMN priority ENUM('normal', 'high', 'urgent') NOT NULL DEFAULT 'normal' AFTER notice_category;

CREATE TABLE IF NOT EXISTS notice_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  notice_id INT UNSIGNED NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_na_notice FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  INDEX idx_na_notice (notice_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notice_reads (
  user_id INT UNSIGNED NOT NULL,
  notice_id INT UNSIGNED NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, notice_id),
  CONSTRAINT fk_nr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_nr_notice FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notice_favorites (
  user_id INT UNSIGNED NOT NULL,
  notice_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, notice_id),
  CONSTRAINT fk_nf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_nf_notice FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campus_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('academic', 'cultural', 'sports', 'career', 'general') NOT NULL DEFAULT 'general',
  location VARCHAR(255) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  created_by INT UNSIGNED NOT NULL,
  target_role ENUM('all', 'student', 'faculty') NOT NULL DEFAULT 'all',
  department_id INT UNSIGNED NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  max_attendees INT UNSIGNED NULL,
  banner_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ce_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ce_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_ce_starts (starts_at),
  INDEX idx_ce_ends (ends_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role_at_register ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  registration_code CHAR(36) NOT NULL,
  CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES campus_events(id) ON DELETE CASCADE,
  CONSTRAINT fk_er_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_er_event_user (event_id, user_id),
  UNIQUE KEY uq_er_code (registration_code),
  INDEX idx_er_event (event_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS uploaded_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  scope ENUM('notice_attachment', 'event_banner', 'avatar', 'other') NOT NULL DEFAULT 'other',
  entity_type VARCHAR(64) NULL,
  entity_id VARCHAR(64) NULL,
  public_path VARCHAR(512) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_uf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_uf_user_created (user_id, created_at),
  INDEX idx_uf_scope (scope)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(96) NOT NULL,
  entity_type VARCHAR(64) NULL,
  entity_id VARCHAR(64) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  action VARCHAR(96) NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_act_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_act_user_created (user_id, created_at)
) ENGINE=InnoDB;

-- Performance hardening indexes for high-traffic paths
CREATE INDEX idx_er_user ON event_registrations (user_id);
CREATE INDEX idx_att_tt_date ON attendance_records (timetable_entry_id, attendance_date);
CREATE INDEX idx_students_dept_sem ON students (department_id, semester);
CREATE INDEX idx_notices_author ON notices (author_id);
CREATE INDEX idx_ce_target_window ON campus_events (target_role, starts_at, ends_at);
CREATE INDEX idx_ce_featured_window ON campus_events (is_featured, starts_at, ends_at);
