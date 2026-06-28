
-- Smart Campus Hub — Full Database Recovery Script
-- Created: 2026-06-15
-- Instructions:
-- 1. Create a database first: CREATE DATABASE smart_campus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 2. Use the database: USE smart_campus;
-- 3. Import this file

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in reverse order of creation for safety
DROP TABLE IF EXISTS assignment_analytics_cache;
DROP TABLE IF EXISTS submission_attachments;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignment_attachments;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS cgpa_records;
DROP TABLE IF EXISTS result_publications;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS campus_events;
DROP TABLE IF EXISTS notice_favorites;
DROP TABLE IF EXISTS notice_reads;
DROP TABLE IF EXISTS notice_attachments;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS uploaded_files;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS campus_places;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS timetable_entries;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

SET FOREIGN_KEY_CHECKS = 1;

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

-- ===============================
-- Seed Data
-- ===============================

-- Departments
INSERT INTO departments (name, code) VALUES
('Computer Engineering', 'CSE'),
('Information Technology', 'IT'),
('Electronics Engineering', 'ECE'),
('Mechanical Engineering', 'ME'),
('Civil Engineering', 'CE'),
('AI & Data Science', 'AIDS');

-- Users
-- Default password for all: campus@123 (bcrypt hash)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES
('admin@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'admin', 'Admin', 'User', '+91 9876543210'),
('faculty@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'faculty', 'Jordan', 'Lee', '+91 9876543211'),
('student@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'student', 'Alex', 'Rivera', '+91 9876543212');

-- Classrooms (linked to CSE dept id=1)
INSERT INTO classrooms (name, building, floor, capacity, department_id) VALUES
('A-101', 'Academic Block A', '1', 120, 1),
('A-102', 'Academic Block A', '1', 120, 1),
('Smart Lab', 'Innovation Hub', '2', 60, 1),
('Lab-1', 'Computer Center', '1', 40, 1),
('Lab-2', 'Computer Center', '2', 40, 1),
('Seminar Hall', 'Main Building', 'G', 200, NULL);

-- Faculty profile
INSERT INTO faculty (user_id, employee_code, department_id, designation, specialization) VALUES
(2, 'FAC-CSE-001', 1, 'Assistant Professor', 'Artificial Intelligence');

-- Student profile
INSERT INTO students (user_id, student_code, department_id, semester, enrollment_year) VALUES
(3, 'CSE24-1042', 1, 5, 2024);

-- Subjects (CSE Semester 5)
INSERT INTO subjects (code, name, credits, semester, department_id, total_marks, passing_marks) VALUES
('CSE501', 'Database Management Systems', 4, 5, 1, 100, 40),
('CSE502', 'Operating Systems', 4, 5, 1, 100, 40),
('CSE503', 'Computer Networks', 4, 5, 1, 100, 40),
('CSE504', 'Software Engineering', 4, 5, 1, 100, 40),
('CSE505', 'Cloud Computing', 4, 5, 1, 100, 40),
('CSE506', 'Artificial Intelligence', 4, 5, 1, 100, 40);

-- Timetable (CSE Sem5, Mon-Fri)
INSERT INTO timetable_entries (department_id, semester, day_of_week, start_time, end_time, subject_name, faculty_id, classroom_id, section) VALUES
(1,5,1,'09:00:00','10:00:00','Database Management Systems',1,1,'A'),
(1,5,1,'10:00:00','11:00:00','Operating Systems',1,2,'A'),
(1,5,1,'11:15:00','12:15:00','Computer Networks',1,3,'A'),
(1,5,1,'12:15:00','13:15:00','Software Engineering',1,4,'A'),
(1,5,1,'14:00:00','15:00:00','Cloud Computing',1,5,'A'),
(1,5,1,'15:00:00','16:00:00','Artificial Intelligence',1,6,'A'),
(1,5,2,'09:00:00','10:00:00','Operating Systems',1,1,'A'),
(1,5,2,'10:00:00','11:00:00','Computer Networks',1,2,'A'),
(1,5,2,'11:15:00','12:15:00','Software Engineering',1,3,'A'),
(1,5,2,'12:15:00','13:15:00','Cloud Computing',1,4,'A'),
(1,5,2,'14:00:00','15:00:00','Artificial Intelligence',1,5,'A'),
(1,5,2,'15:00:00','16:00:00','Database Management Systems',1,6,'A'),
(1,5,3,'09:00:00','10:00:00','Computer Networks',1,1,'A'),
(1,5,3,'10:00:00','11:00:00','Software Engineering',1,2,'A'),
(1,5,3,'11:15:00','12:15:00','Cloud Computing',1,3,'A'),
(1,5,3,'12:15:00','13:15:00','Artificial Intelligence',1,4,'A'),
(1,5,3,'14:00:00','15:00:00','Database Management Systems',1,5,'A'),
(1,5,3,'15:00:00','16:00:00','Operating Systems',1,6,'A'),
(1,5,4,'09:00:00','10:00:00','Software Engineering',1,1,'A'),
(1,5,4,'10:00:00','11:00:00','Cloud Computing',1,2,'A'),
(1,5,4,'11:15:00','12:15:00','Artificial Intelligence',1,3,'A'),
(1,5,4,'12:15:00','13:15:00','Database Management Systems',1,4,'A'),
(1,5,4,'14:00:00','15:00:00','Operating Systems',1,5,'A'),
(1,5,4,'15:00:00','16:00:00','Computer Networks',1,6,'A'),
(1,5,5,'09:00:00','10:00:00','Cloud Computing',1,1,'A'),
(1,5,5,'10:00:00','11:00:00','Artificial Intelligence',1,2,'A'),
(1,5,5,'11:15:00','12:15:00','Database Management Systems',1,3,'A'),
(1,5,5,'12:15:00','13:15:00','Operating Systems',1,4,'A'),
(1,5,5,'14:00:00','15:00:00','Computer Networks',1,5,'A'),
(1,5,5,'15:00:00','16:00:00','Software Engineering',1,6,'A');

-- Additional Users
INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES
('smith.faculty@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'faculty', 'Sarah', 'Smith', '+91 9876543213'),
('john.doe@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'student', 'John', 'Doe', '+91 9876543214'),
('jane.smith@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'student', 'Jane', 'Smith', '+91 9876543215'),
('mike.wilson@gmail.com', '$2a$12$yWrgPXUjDpt6hAndd2bK6ein2jCjPmR79n0lnbT.0Yn6IX331ZSPu', 'student', 'Mike', 'Wilson', '+91 9876543216');

-- Additional Faculty
INSERT INTO faculty (user_id, employee_code, department_id, designation, specialization) VALUES
(4, 'FAC-CSE-002', 1, 'Associate Professor', 'Database Systems');

-- Additional Students
INSERT INTO students (user_id, student_code, department_id, semester, enrollment_year) VALUES
(5, 'CSE24-1043', 1, 5, 2024),
(6, 'CSE24-1044', 1, 5, 2024),
(7, 'CSE23-1020', 1, 6, 2023);

-- More Subjects (CSE Sem6)
INSERT INTO subjects (code, name, credits, semester, department_id, total_marks, passing_marks) VALUES
('CSE601', 'Machine Learning', 4, 6, 1, 100, 40),
('CSE602', 'Web Technologies', 4, 6, 1, 100, 40),
('CSE603', 'Compiler Design', 4, 6, 1, 100, 40);

-- Campus Places
INSERT INTO campus_places (name, category, building, floor, description, map_x, map_y) VALUES
('Main Library', 'building', 'Central Block', 'G', 'Central library with 100000+ books', 10.50, 20.75),
('Cafeteria', 'facility', 'Student Center', 'G', 'Campus cafeteria serving breakfast and lunch', 15.30, 25.40),
('Sports Complex', 'sports', 'Sports Block', '1', 'Indoor sports complex with badminton courts', 20.10, 30.20),
('Admin Block', 'building', 'Main Building', '1', 'Administrative offices', 5.00, 10.00);

-- Campus Events
INSERT INTO campus_events (title, description, category, location, starts_at, ends_at, created_by, target_role, department_id, is_featured, max_attendees) VALUES
('Tech Fest 2026', 'Annual tech fest with workshops, hackathons and guest lectures', 'academic', 'Main Ground', '2026-07-15 09:00:00', '2026-07-17 18:00:00', 1, 'all', 1, 1, 500),
('Career Fair 2026', 'Recruitment drive with top companies', 'career', 'Seminar Hall', '2026-08-01 10:00:00', '2026-08-01 17:00:00', 4, 'student', 1, 0, 300);

-- Event Registrations (using hardcoded UUIDs for portability)
INSERT INTO event_registrations (event_id, user_id, role_at_register, registration_code) VALUES
(1, 5, 'student', '550e8400-e29b-41d4-a716-446655440000'),
(1, 6, 'student', '550e8400-e29b-41d4-a716-446655440001'),
(1, 7, 'student', '550e8400-e29b-41d4-a716-446655440002'),
(2, 5, 'student', '550e8400-e29b-41d4-a716-446655440003'),
(2, 6, 'student', '550e8400-e29b-41d4-a716-446655440004');

-- Assignments
INSERT INTO assignments (title, description, subject_id, faculty_id, department_id, semester, due_date, max_marks, allow_late_submissions, late_penalty_percent, status, published_at, created_by) VALUES
('DBMS Assignment 1', 'Write SQL queries for relational database operations', 1, 1, 1, 5, '2026-06-25 23:59:00', 100, 1, 5, 'published', '2026-06-15 10:00:00', 2),
('OS Assignment', 'Implement a simple process scheduler', 2, 1, 1, 5, '2026-06-28 23:59:00', 50, 0, NULL, 'published', '2026-06-15 11:00:00', 2),
('Web Development Project', 'Create a full-stack CRUD application', 8, 2, 1, 6, '2026-07-05 23:59:00', 100, 1, 10, 'published', '2026-06-15 12:00:00', 4);

-- Uploaded Files for Attachments
INSERT INTO uploaded_files (user_id, scope, public_path, stored_name, original_name, mime_type, size_bytes) VALUES
(2, 'assignment_attachment', '/uploads/assignments/dbms-assignment.pdf', 'dbms-assignment.pdf', 'DBMS Assignment Guidelines.pdf', 'application/pdf', 102400),
(2, 'assignment_attachment', '/uploads/assignments/os-assignment.pdf', 'os-assignment.pdf', 'OS Assignment Guidelines.pdf', 'application/pdf', 51200);

-- Assignment Attachments
INSERT INTO assignment_attachments (assignment_id, uploaded_file_id) VALUES
(1, 1),
(2, 2);

-- Sample Submissions (student_id = students.id, NOT users.id!)
INSERT INTO assignment_submissions (assignment_id, student_id, status, marks_obtained, remarks, graded_by, graded_at, created_at) VALUES
(1, 1, 'graded', 95, 'Excellent work!', 2, '2026-06-20 14:30:00', '2026-06-20 10:15:00'),
(1, 2, 'graded', 82, 'Good effort, but some queries need optimization', 2, '2026-06-21 09:45:00', '2026-06-21 08:00:00'),
(1, 3, 'submitted', NULL, NULL, NULL, NULL, '2026-06-22 15:30:00'),
(2, 1, 'under_review', NULL, NULL, NULL, NULL, '2026-06-22 17:00:00');

-- Submission Attachments
INSERT INTO uploaded_files (user_id, scope, public_path, stored_name, original_name, mime_type, size_bytes) VALUES
(3, 'submission_attachment', '/uploads/submissions/alex-rivera-dbms.pdf', 'alex-rivera-dbms.pdf', 'DBMS Assignment Submission.pdf', 'application/pdf', 204800),
(5, 'submission_attachment', '/uploads/submissions/john-doe-dbms.pdf', 'john-doe-dbms.pdf', 'John Doe DBMS Assignment.pdf', 'application/pdf', 153600);

INSERT INTO submission_attachments (submission_id, uploaded_file_id, submission_version) VALUES
(1, 3, 1),
(2, 4, 1);

-- Notices (continued)
INSERT INTO notices (title, body, author_id, target_role, department_id, notice_category, priority) VALUES
('Semester Examination Schedule Released', 'Semester V examination timetable has been officially published.', 1, 'student', 1, 'general', 'urgent'),
('AI Innovation Hackathon', 'Registrations are now open for the national AI Hackathon event.', 1, 'all', 1, 'general', 'high'),
('Faculty Attendance Submission', 'All faculty members must complete attendance updates before Friday.', 1, 'faculty', 1, 'general', 'normal'),
('Campus Network Maintenance', 'Campus servers will undergo maintenance on Saturday night.', 1, 'all', 1, 'general', 'high'),
('Library Book Borrowing Period Extended', 'Due to mid-semester exams, book borrowing period is extended by 2 weeks', 1, 'student', 1, 'general', 'normal'),
('Workshop on Cloud Security', 'Workshop on AWS security best practices will be held on 25th June', 4, 'student', 1, 'academic', 'high');

-- Attendance Records
INSERT INTO attendance_records (timetable_entry_id, student_id, attendance_date, status, marked_by) VALUES
(1, 1, CURDATE(), 'present', 2),
(1, 2, CURDATE(), 'present', 2),
(1, 3, CURDATE(), 'late', 2),
(2, 1, CURDATE(), 'present', 2),
(2, 2, CURDATE(), 'absent', 2),
(2, 3, CURDATE(), 'present', 2);

-- Notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(3, 'Assignment Graded', 'Your DBMS Assignment has been graded: 95/100', 'assignment'),
(5, 'Assignment Graded', 'Your DBMS Assignment has been graded: 82/100', 'assignment'),
(3, 'New Assignment', 'A new OS Assignment has been published', 'assignment'),
(5, 'New Assignment', 'A new OS Assignment has been published', 'assignment'),
(6, 'New Assignment', 'A new OS Assignment has been published', 'assignment');

-- Activity Logs
INSERT INTO activity_logs (user_id, action, details) VALUES
(2, 'Created Assignment', 'Created DBMS Assignment 1'),
(2, 'Created Assignment', 'Created OS Assignment'),
(4, 'Created Assignment', 'Created Web Development Project'),
(3, 'Submitted Assignment', 'Submitted DBMS Assignment'),
(5, 'Submitted Assignment', 'Submitted DBMS Assignment'),
(6, 'Submitted Assignment', 'Submitted DBMS Assignment'),
(2, 'Graded Assignment', 'Graded DBMS Assignment for Alex Rivera'),
(2, 'Graded Assignment', 'Graded DBMS Assignment for John Doe');

-- Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address) VALUES
(1, 'DATABASE_RECOVERY', 'system', 'recovery_script', '{"status": "success"}', '127.0.0.1'),
(2, 'ASSIGNMENT_CREATE', 'assignment', '1', '{"title": "DBMS Assignment 1"}', '192.168.1.10'),
(2, 'ASSIGNMENT_PUBLISH', 'assignment', '1', '{}', '192.168.1.10'),
(2, 'ASSIGNMENT_CREATE', 'assignment', '2', '{"title": "OS Assignment"}', '192.168.1.10'),
(2, 'ASSIGNMENT_PUBLISH', 'assignment', '2', '{}', '192.168.1.10');

-- Results (Semester 4 sample) (student_id = students.id!)
INSERT INTO results (student_id, subject_id, faculty_id, semester, exam_type, marks_obtained, total_marks, percentage, grade, grade_point, remarks, status) VALUES
(4, 1, 1, 4, 'endterm', 88, 100, 88.00, 'A+', 9.00, 'Great job!', 'pass'),
(4, 2, 1, 4, 'endterm', 76, 100, 76.00, 'A', 8.00, 'Good work', 'pass'),
(4, 3, 1, 4, 'endterm', 92, 100, 92.00, 'O', 10.00, 'Outstanding performance', 'pass'),
(4, 4, 1, 4, 'endterm', 85, 100, 85.00, 'A+', 9.00, 'Excellent', 'pass'),
(4, 5, 1, 4, 'endterm', 80, 100, 80.00, 'A+', 9.00, 'Well done', 'pass'),
(4, 6, 1, 4, 'endterm', 78, 100, 78.00, 'A', 8.00, 'Good', 'pass');

-- CGPA Records (student_id = students.id!)
INSERT INTO cgpa_records (student_id, semester, sgpa, cgpa, total_credits) VALUES
(4, 4, 8.83, 8.50, 24);

-- Default login credentials reminder
-- Email: admin@gmail.com, Password: campus@123
-- Email: faculty@gmail.com, Password: campus@123
-- Email: smith.faculty@gmail.com, Password: campus@123
-- Email: student@gmail.com, Password: campus@123
-- Email: john.doe@gmail.com, Password: campus@123
-- Email: jane.smith@gmail.com, Password: campus@123
-- Email: mike.wilson@gmail.com, Password: campus@123
