-- HostelGuard AI - SQLite Database Schema
-- This file defines the structure for local student management.

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL, -- Referred to as Student UUID in UI
    name TEXT NOT NULL,
    hostel_block TEXT NOT NULL,
    room_number TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'inside',    -- 'inside' or 'outside'
    last_event_time INTEGER          -- Unix timestamp of last movement
);

CREATE TABLE IF NOT EXISTS outings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_db_id INTEGER,
    exit_time INTEGER NOT NULL,
    entry_time INTEGER,
    status TEXT DEFAULT 'active',    -- 'active', 'completed', 'overdue'
    FOREIGN KEY(student_db_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,              -- 'info', 'warning', 'error'
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    student_db_id INTEGER,
    FOREIGN KEY(student_db_id) REFERENCES students(id)
);

-- Indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_uuid ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_student_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_outing_status ON outings(status);
