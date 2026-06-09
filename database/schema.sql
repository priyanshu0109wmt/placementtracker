CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'recruiter', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  college_name VARCHAR(150) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  graduation_year YEAR NOT NULL,
  skills TEXT,
  phone VARCHAR(20),
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  job_type ENUM('full-time', 'part-time', 'internship', 'contract') NOT NULL,
  salary VARCHAR(100),
  description TEXT NOT NULL,
  skills_required TEXT NOT NULL,
  application_deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_recruiter
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_jobs_recruiter_id (recruiter_id),
  INDEX idx_jobs_application_deadline (application_deadline)
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  resume_path VARCHAR(255) NOT NULL,
  cover_letter TEXT,
  status ENUM('applied', 'shortlisted', 'rejected', 'accepted') NOT NULL DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_applications_job
    FOREIGN KEY (job_id) REFERENCES jobs(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_applications_student_job UNIQUE (student_id, job_id),
  INDEX idx_applications_student_id (student_id),
  INDEX idx_applications_job_id (job_id),
  INDEX idx_applications_status (status)
);
