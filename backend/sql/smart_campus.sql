-- Smart Campus Hub — MySQL schema
-- Run: mysql -u root -p < sql/smart_campus.sql

CREATE DATABASE IF NOT EXISTS smart_campus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_campus;

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_departments_code (code)
) ENGINE=InnoDB;

-- Users (auth)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  phone VARCHAR(32) NULL,
  avatar_url VARCHAR(512) NULL,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Students
CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  student_code VARCHAR(64) NOT NULL UNIQUE,
  department_id INT UNSIGNED NOT NULL,
  semester TINYINT UNSIGNED NOT NULL DEFAULT 1,
  enrollment_year YEAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_students_dept FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_students_dept (department_id),
  INDEX idx_students_dept_sem (department_id, semester)
) ENGINE=InnoDB;

-- Faculty
CREATE TABLE IF NOT EXISTS faculty (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  employee_code VARCHAR(64) NOT NULL UNIQUE,
  department_id INT UNSIGNED NOT NULL,
  designation VARCHAR(120) NOT NULL DEFAULT 'Faculty',
  specialization VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_faculty_dept FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX idx_faculty_dept (department_id)
) ENGINE=InnoDB;

-- Classrooms
CREATE TABLE IF NOT EXISTS classrooms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  building VARCHAR(120) NOT NULL,
  floor VARCHAR(32) NULL,
  capacity SMALLINT UNSIGNED NULL,
  department_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_classrooms_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_classrooms_building (building)
) ENGINE=InnoDB;

-- Notices
CREATE TABLE IF NOT EXISTS notices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  author_id INT UNSIGNED NOT NULL,
  target_role ENUM('all', 'student', 'faculty') NOT NULL DEFAULT 'all',
  department_id INT UNSIGNED NULL,
  attachment_url VARCHAR(512) NULL,
  notice_category VARCHAR(64) NOT NULL DEFAULT 'general',
  priority ENUM('normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notices_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notices_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_notices_created (created_at),
  INDEX idx_notices_author (author_id),
  INDEX idx_notices_target (target_role),
  FULLTEXT idx_notices_search (title, body)
) ENGINE=InnoDB;

-- Timetable entries
CREATE TABLE IF NOT EXISTS timetable_entries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED NOT NULL,
  semester TINYINT UNSIGNED NOT NULL DEFAULT 1,
  day_of_week TINYINT UNSIGNED NOT NULL COMMENT '1=Monday ... 7=Sunday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_name VARCHAR(160) NOT NULL,
  faculty_id INT UNSIGNED NOT NULL,
  classroom_id INT UNSIGNED NOT NULL,
  section VARCHAR(32) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tt_dept FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_tt_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
  CONSTRAINT fk_tt_room FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
  INDEX idx_tt_dept_sem (department_id, semester),
  INDEX idx_tt_day (day_of_week),
  INDEX idx_tt_faculty (faculty_id)
) ENGINE=InnoDB;

-- Attendance
CREATE TABLE IF NOT EXISTS attendance_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  timetable_entry_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'present',
  marked_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_tt FOREIGN KEY (timetable_entry_id) REFERENCES timetable_entries(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_marker FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY uq_att_slot_student_day (timetable_entry_id, student_id, attendance_date),
  INDEX idx_att_student_date (student_id, attendance_date),
  INDEX idx_att_tt_date (timetable_entry_id, attendance_date)
) ENGINE=InnoDB;

-- Campus places (navigation)
CREATE TABLE IF NOT EXISTS campus_places (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category ENUM('building', 'facility', 'landmark', 'hostel', 'sports') NOT NULL DEFAULT 'building',
  building VARCHAR(120) NULL,
  floor VARCHAR(32) NULL,
  description TEXT NULL,
  map_x DECIMAL(6,2) NULL,
  map_y DECIMAL(6,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_places_category (category)
) ENGINE=InnoDB;

-- In-app notifications (persisted)
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'notice',
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, read_at)
) ENGINE=InnoDB;

-- Notice file attachments
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

-- Per-user read state for notices
CREATE TABLE IF NOT EXISTS notice_reads (
  user_id INT UNSIGNED NOT NULL,
  notice_id INT UNSIGNED NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, notice_id),
  CONSTRAINT fk_nr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_nr_notice FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bookmarked notices
CREATE TABLE IF NOT EXISTS notice_favorites (
  user_id INT UNSIGNED NOT NULL,
  notice_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, notice_id),
  CONSTRAINT fk_nf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_nf_notice FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Campus events
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
  INDEX idx_ce_ends (ends_at),
  INDEX idx_ce_target_window (target_role, starts_at, ends_at),
  INDEX idx_ce_featured_window (is_featured, starts_at, ends_at)
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
  INDEX idx_er_event (event_id),
  INDEX idx_er_user (user_id)
) ENGINE=InnoDB;

-- Central upload registry
CREATE TABLE IF NOT EXISTS uploaded_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  scope ENUM('notice_attachment', 'event_banner', 'avatar', 'other', 'assignment_attachment', 'submission_attachment') NOT NULL DEFAULT 'other',
  entity_type VARCHAR(64) NULL,
  entity_id VARCHAR(64) NULL,
  public_path VARCHAR(512) NOT NULL,
  cloud_url VARCHAR(512) NULL,
  cloud_public_id VARCHAR(255) NULL,
  cloud_folder VARCHAR(128) NULL,
  stored_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_uf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_uf_user_created (user_id, created_at),
  INDEX idx_uf_scope (scope),
  INDEX idx_uploaded_cloud (cloud_public_id)
) ENGINE=InnoDB;

-- Security / audit
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

-- Result management module
CREATE TABLE IF NOT EXISTS subjects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(180) NOT NULL,
  credits TINYINT UNSIGNED NOT NULL DEFAULT 4,
  semester TINYINT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NOT NULL,
  total_marks SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  passing_marks SMALLINT UNSIGNED NOT NULL DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subjects_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_subject_dept_sem_code (department_id, semester, code),
  INDEX idx_subjects_dept_sem (department_id, semester)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS results (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  faculty_id INT UNSIGNED NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  exam_type ENUM('internal', 'midterm', 'practical', 'endterm', 'supplementary') NOT NULL DEFAULT 'endterm',
  marks_obtained DECIMAL(6,2) NOT NULL,
  total_marks DECIMAL(6,2) NOT NULL,
  percentage DECIMAL(6,2) NOT NULL DEFAULT 0,
  grade ENUM('O', 'A+', 'A', 'B+', 'B', 'C', 'F') NOT NULL DEFAULT 'F',
  grade_point DECIMAL(4,2) NOT NULL DEFAULT 0,
  remarks VARCHAR(255) NULL,
  status ENUM('pass', 'fail') NOT NULL DEFAULT 'fail',
  locked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  UNIQUE KEY uq_results_unique_entry (student_id, subject_id, semester, exam_type),
  INDEX idx_results_student_sem (student_id, semester),
  INDEX idx_results_subject_sem (subject_id, semester),
  INDEX idx_results_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS result_publications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  semester TINYINT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  published_at TIMESTAMP NULL DEFAULT NULL,
  published_by INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_result_publications_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_result_publications_user FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_result_publication (semester, department_id),
  INDEX idx_result_publications_state (department_id, semester, published)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cgpa_records (
  student_id INT UNSIGNED NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  sgpa DECIMAL(4,2) NOT NULL DEFAULT 0,
  cgpa DECIMAL(4,2) NOT NULL DEFAULT 0,
  total_credits SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, semester),
  CONSTRAINT fk_cgpa_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_cgpa_sem (semester)
) ENGINE=InnoDB;

-- Assignment management module
CREATE TABLE IF NOT EXISTS assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  faculty_id INT UNSIGNED NOT NULL,
  department_id INT UNSIGNED NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  due_date DATETIME NOT NULL,
  max_marks SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  allow_late_submissions TINYINT(1) NOT NULL DEFAULT 1,
  late_penalty_percent DECIMAL(5,2) NULL DEFAULT NULL,
  status ENUM('draft', 'published', 'active', 'expired', 'closed') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_creator FOREIGN KEY (created_by) REFERENCES users(id),

  INDEX idx_assignments_dept_sem (department_id, semester),
  INDEX idx_assignments_faculty (faculty_id),
  INDEX idx_assignments_status (status),
  INDEX idx_assignments_due (due_date),
  INDEX idx_assignments_subject (subject_id)
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignment_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT UNSIGNED NOT NULL,
  uploaded_file_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_assignment_att_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_att_upload FOREIGN KEY (uploaded_file_id) REFERENCES uploaded_files(id) ON DELETE CASCADE,

  INDEX idx_assignment_att_id (assignment_id),
  UNIQUE KEY uq_assignment_att_unique (assignment_id, uploaded_file_id)
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  status ENUM('not_submitted', 'submitted', 'late_submitted', 'under_review', 'graded') NOT NULL DEFAULT 'not_submitted',
  marks_obtained DECIMAL(6,2) NULL,
  remarks TEXT NULL,
  graded_by INT UNSIGNED NULL,
  graded_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_submission_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_submission_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_submission_grader FOREIGN KEY (graded_by) REFERENCES users(id),

  UNIQUE KEY uq_submission_unique (assignment_id, student_id),
  INDEX idx_submission_assignment (assignment_id),
  INDEX idx_submission_student (student_id),
  INDEX idx_submission_status (status),
  INDEX idx_submission_graded (graded_at)
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submission_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id BIGINT UNSIGNED NOT NULL,
  uploaded_file_id INT UNSIGNED NOT NULL,
  submission_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_submission_att_submission FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_submission_att_upload FOREIGN KEY (uploaded_file_id) REFERENCES uploaded_files(id) ON DELETE CASCADE,

  INDEX idx_submission_att_id (submission_id),
  INDEX idx_submission_att_version (submission_id, submission_version)
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignment_analytics_cache (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  assignment_id INT UNSIGNED NULL,
  total_assignments INT UNSIGNED NOT NULL DEFAULT 0,
  total_submissions INT UNSIGNED NOT NULL DEFAULT 0,
  submission_rate DECIMAL(5,2) NULL,
  late_submission_rate DECIMAL(5,2) NULL,
  average_marks DECIMAL(6,2) NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_assignment_analytics_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_analytics_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,

  UNIQUE KEY uq_assignment_analytics (department_id, semester, assignment_id),
  INDEX idx_analytics_cached (cached_at)
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
