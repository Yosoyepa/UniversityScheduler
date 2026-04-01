-- ============================================
-- University Scheduler - Database Schema
-- PostgreSQL DDL Script
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Settings Table (1:1 with User)
-- ============================================
CREATE TABLE settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    alert_preferences JSONB DEFAULT '{}'::jsonb,  -- Stores custom alert timings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Semesters Table
-- ============================================
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "2024-1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- ============================================
-- 4. Subjects Table
-- ============================================
CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE subject_type AS ENUM ('DISCIPLINAR_OBLIGATORIA', 'DISCIPLINAR_OPTATIVA', 'FUNDAMENTAL_OBLIGATORIA', 'LIBRE_ELECCION');

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    group_code VARCHAR(50), -- e.g., "Grp 1"
    credits INTEGER DEFAULT 0 CHECK (credits >= 0),
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex Code
    difficulty difficulty_level DEFAULT 'MEDIUM',
    type subject_type NOT NULL,
    professor_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Class Sessions (Weekly Schedule)
-- ============================================
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255), -- Room or URL
    attendance_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- ============================================
-- 6. Tasks Table
-- ============================================
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE task_category AS ENUM ('TASK', 'EXAM', 'PROJECT', 'READING');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL, -- Nullable for general tasks
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status task_status DEFAULT 'TODO',
    priority task_priority DEFAULT 'MEDIUM',
    category task_category DEFAULT 'TASK',
    is_synced_gcal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_semesters_user ON semesters(user_id);
CREATE INDEX idx_subjects_semester ON subjects(semester_id);
CREATE INDEX idx_sessions_subject ON class_sessions(subject_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status); -- Kanban Board
CREATE INDEX idx_tasks_due_date ON tasks(due_date); -- Calendar View

-- ============================================
-- 7. Evaluation Criteria Table (Phase 3)
-- Defines the grading rubric per subject:
-- e.g. "Parcial 1" = 30%, "Proyecto Final" = 40%, "Talleres" = 30%
-- ============================================
CREATE TABLE evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,           -- e.g. "Parcial 1", "Proyecto Final"
    weight NUMERIC(5,2) NOT NULL,         -- percentage value e.g. 30.00
    category task_category,              -- optional: link to task category filter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_weight CHECK (weight > 0 AND weight <= 100)
);

-- ============================================
-- 8. Grades Table (Phase 3)
-- Records the score obtained per evaluation criterion.
-- Links to a task (exam/project) for traceability.
-- ============================================
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    criteria_id UUID REFERENCES evaluation_criteria(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- nullable: linked exam task
    score NUMERIC(5,2) NOT NULL,          -- e.g. 4.5 on a 0.0-5.0 scale
    max_score NUMERIC(5,2) NOT NULL DEFAULT 5.0,
    graded_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_score CHECK (score >= 0 AND score <= max_score),
    CONSTRAINT check_max_score CHECK (max_score > 0)
);

-- ============================================
-- Indexes for Phase 3 tables
-- ============================================
CREATE INDEX idx_grades_user ON grades(user_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_criteria ON grades(criteria_id);
CREATE INDEX idx_evaluation_criteria_subject ON evaluation_criteria(subject_id);
