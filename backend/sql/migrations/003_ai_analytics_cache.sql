-- ============================================================
-- Migration 003: AI Analytics Cache Tables
-- Smart Campus Hub — Academic Intelligence Platform
-- ============================================================
-- Safe to run multiple times (all CREATE TABLE use IF NOT EXISTS)
-- Does NOT modify any existing table — purely additive
-- Run: mysql -u root -p smart_campus < sql/migrations/003_ai_analytics_cache.sql
-- ============================================================

USE smart_campus;

-- ----------------------------------------------------------------
-- AI Analytics Snapshots (optional performance cache)
-- Stores pre-computed analytics results keyed by scope+semester.
-- Can be populated by a background job for sub-second dashboard loads.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_analytics_snapshots (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scope        ENUM('department', 'student', 'university') NOT NULL,
  scope_id     VARCHAR(64) NULL                          COMMENT 'department_id or student_id as string',
  semester     TINYINT UNSIGNED NULL,
  snapshot_key VARCHAR(128) NOT NULL                     COMMENT 'e.g. overview, risk_students, heatmap',
  data         JSON NOT NULL                             COMMENT 'Serialized analytics payload',
  computed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at   TIMESTAMP NULL DEFAULT NULL               COMMENT 'NULL = no expiry',
  INDEX idx_ai_snap_lookup (scope, scope_id, snapshot_key),
  INDEX idx_ai_snap_semester (semester),
  INDEX idx_ai_snap_expires (expires_at)
) ENGINE=InnoDB COMMENT='Cache layer for AI analytics payloads';

-- ----------------------------------------------------------------
-- AI Recommendations Log
-- Persists student-level AI recommendations for audit/display.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id     INT UNSIGNED NOT NULL,
  semester       TINYINT UNSIGNED NULL,
  category       VARCHAR(64) NOT NULL    COMMENT 'e.g. urgent, academics, gpa, strength, trend',
  title          VARCHAR(255) NOT NULL,
  recommendation TEXT NOT NULL,
  priority       ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  is_read        TINYINT(1) NOT NULL DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_rec_student FOREIGN KEY (student_id)
    REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_ai_rec_student_sem (student_id, semester),
  INDEX idx_ai_rec_priority (priority),
  INDEX idx_ai_rec_created (created_at)
) ENGINE=InnoDB COMMENT='Persisted AI academic recommendations per student';

-- ----------------------------------------------------------------
-- AI Moderation Audit Log
-- Tracks moderation actions taken by faculty.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_moderation_log (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  faculty_user_id INT UNSIGNED NOT NULL,
  department_id   INT UNSIGNED NOT NULL,
  semester        TINYINT UNSIGNED NOT NULL,
  subject_id      INT UNSIGNED NOT NULL,
  action          ENUM('grace_applied', 'normalization_applied', 'flagged', 'reviewed') NOT NULL,
  grace_marks     TINYINT UNSIGNED NULL DEFAULT 0,
  scale_factor    DECIMAL(5,3) NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_mod_faculty FOREIGN KEY (faculty_user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_mod_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_mod_subject FOREIGN KEY (subject_id)
    REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_ai_mod_dept_sem (department_id, semester),
  INDEX idx_ai_mod_faculty (faculty_user_id),
  INDEX idx_ai_mod_created (created_at)
) ENGINE=InnoDB COMMENT='Audit log for AI moderation actions by faculty';

-- ----------------------------------------------------------------
-- AI Anomaly Reports
-- Persists anomaly scan results for historical review.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_anomaly_reports (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED NOT NULL,
  semester      TINYINT UNSIGNED NOT NULL,
  anomaly_type  VARCHAR(64) NOT NULL   COMMENT 'duplicate_marks, statistical_outlier, mass_failure, etc.',
  severity      ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  subject_code  VARCHAR(32) NULL,
  detail        TEXT NOT NULL,
  resolved      TINYINT(1) NOT NULL DEFAULT 0,
  resolved_by   INT UNSIGNED NULL,
  resolved_at   TIMESTAMP NULL DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_anom_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_anom_resolver FOREIGN KEY (resolved_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ai_anom_dept_sem (department_id, semester),
  INDEX idx_ai_anom_severity (severity),
  INDEX idx_ai_anom_resolved (resolved),
  INDEX idx_ai_anom_created (created_at)
) ENGINE=InnoDB COMMENT='Historical anomaly detection reports';
