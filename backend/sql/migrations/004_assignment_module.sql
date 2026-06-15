-- Smart Campus Hub — Assignment Module Migration
-- Run: mysql -u root -p smart_campus < sql/migrations/004_assignment_module.sql

USE smart_campus;

-- Step 1: Update uploaded_files table for Cloudinary support
ALTER TABLE uploaded_files
MODIFY COLUMN scope ENUM('notice_attachment', 'event_banner', 'avatar', 'other', 'assignment_attachment', 'submission_attachment') NOT NULL DEFAULT 'other';

ALTER TABLE uploaded_files
ADD COLUMN cloud_url VARCHAR(512) NULL AFTER public_path;

ALTER TABLE uploaded_files
ADD COLUMN cloud_public_id VARCHAR(255) NULL AFTER cloud_url;

ALTER TABLE uploaded_files
ADD COLUMN cloud_folder VARCHAR(128) NULL AFTER cloud_public_id;

ALTER TABLE uploaded_files
ADD INDEX idx_uploaded_cloud (cloud_public_id);

-- Step 2: Create assignments table
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

-- Step 3: Create assignment_attachments table
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

-- Step 4: Create assignment_submissions table
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

-- Step 5: Create submission_attachments table
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

-- Step 6: Create assignment_analytics_cache table
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
