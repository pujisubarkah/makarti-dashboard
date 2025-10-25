-- IDP schema for Navicat (MySQL / MariaDB)
-- Derived from src/components/IdpFormWizard.tsx and related forms
-- Assumptions:
-- 1) You use MySQL/MariaDB. Request Postgres variant if needed.
-- 2) A `users` table already exists with primary key `id` (BIGINT). If not, an example users table is provided commented out.
-- 3) No attachments table: activities store evidence_url(s) directly.

/* Uncomment and adapt if you don't have a users table
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nip VARCHAR(64) UNIQUE,
  nama VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

CREATE TABLE competencies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main IDP plan per user
CREATE TABLE idp_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) DEFAULT 'Individual Development Plan',
  description TEXT NULL,
  status ENUM('draft','submitted','approved','rejected','in_progress','completed') DEFAULT 'draft',
  start_date DATE NULL,
  end_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goals (Tujuan Pengembangan) within a plan
CREATE TABLE idp_goals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT UNSIGNED NOT NULL,
  kompetensi VARCHAR(512) NOT NULL,
  alasan TEXT NULL,
  target VARCHAR(255) NULL,
  indikator TEXT NULL,
  priority TINYINT UNSIGNED DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES idp_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities to achieve a goal (pelatihan, coaching, self-study, on-job, dll.)
CREATE TABLE idp_activities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  goal_id BIGINT UNSIGNED NOT NULL,
  type ENUM('pelatihan','coaching','onjob','selfstudy','mentoring','other') DEFAULT 'pelatihan',
  title VARCHAR(512) NOT NULL,
  provider VARCHAR(255) NULL,
  lokasi VARCHAR(255) NULL,
  biaya DECIMAL(12,2) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  jam_pelatihan INT UNSIGNED NULL,
  evidence_url TEXT NULL,
  note TEXT NULL,
  status ENUM('planned','ongoing','done','cancelled') DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES idp_goals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews and progress notes (oleh atasan / reviewer)
CREATE TABLE idp_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT UNSIGNED NOT NULL,
  reviewer_id BIGINT UNSIGNED NULL,
  comment TEXT NULL,
  rating TINYINT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES idp_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Templates for pre-made IDP structures
CREATE TABLE idp_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  json_schema JSON NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Simple audit log for changes to plans/goals/activities
CREATE TABLE idp_audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT UNSIGNED NULL,
  actor_id BIGINT UNSIGNED NULL,
  action VARCHAR(128) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES idp_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: mapping table if you want to link goals to competency master
CREATE TABLE idp_goal_competencies (
  goal_id BIGINT UNSIGNED NOT NULL,
  competency_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (goal_id, competency_id),
  FOREIGN KEY (goal_id) REFERENCES idp_goals(id) ON DELETE CASCADE,
  FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for faster queries
CREATE INDEX idx_idp_plans_user ON idp_plans(user_id);
CREATE INDEX idx_idp_goals_plan ON idp_goals(plan_id);
CREATE INDEX idx_idp_activities_goal ON idp_activities(goal_id);

-- SAMPLE SEED DATA (adapt the user ids to match your users table)
INSERT INTO competencies (code, name, description) VALUES
('COMM_BASIC','Komunikasi Dasar','Kemampuan komunikasi lisan dan tulisan'),
('MGMT_TIME','Manajemen Waktu','Pengelolaan waktu dan prioritas kerja');

-- Replace user_id = 1 with a real user id from your users table
INSERT INTO idp_plans (user_id, title, description, status, start_date, end_date)
VALUES (1, 'IDP 2025 - Contoh', 'Rencana pengembangan individu untuk 2025', 'draft', '2025-01-01', '2025-12-31');

INSERT INTO idp_goals (plan_id, kompetensi, alasan, target, indikator, priority)
VALUES (1, 'Komunikasi', 'Perlu meningkatkan presentasi', 'Q2 2025', 'Presentasi minimal 1x per bulan', 1),
       (1, 'Manajemen Waktu', 'Sering terlambat menyelesaikan tugas', 'Q3 2025', 'Tugas selesai tepat waktu 90% bulan', 2);

INSERT INTO idp_activities (goal_id, type, title, provider, start_date, end_date, jam_pelatihan, evidence_url, status)
VALUES (1, 'pelatihan', 'Pelatihan Public Speaking', 'Lembaga X', '2025-02-15', '2025-02-16', 16, 'https://drive.example.com/evidence/ps1', 'planned'),
       (2, 'selfstudy', 'Kursus Manajemen Waktu (online)', 'Coursera', '2025-03-01', '2025-04-01', 20, 'https://drive.example.com/evidence/tm1', 'planned');

INSERT INTO idp_reviews (plan_id, reviewer_id, comment, rating, reviewed_at)
VALUES (1, 2, 'Bagus, lanjutkan fokus pada komunikasi', 4, NOW());

-- Done.
