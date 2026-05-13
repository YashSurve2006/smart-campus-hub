USE smart_campus;

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
