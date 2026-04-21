import sqlite3
import numpy as np
import base64
import io
import time
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from PIL import Image

app = FastAPI(title="HostelGuard AI - Standalone Backend")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SQLite Database Setup (Consolidated) ---
def init_db():
    conn = sqlite3.connect('hostel_management.db')
    cursor = conn.cursor()
    
    # Students Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            hostel_block TEXT NOT NULL,
            room_number TEXT NOT NULL,
            parent_phone TEXT NOT NULL,
            parent_email TEXT NOT NULL,
            qr_code TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'inside',
            last_event_time INTEGER
        )
    ''')
    
    # Outings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS outings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_db_id INTEGER,
            exit_time INTEGER,
            entry_time INTEGER,
            status TEXT DEFAULT 'active',
            FOREIGN KEY(student_db_id) REFERENCES students(id)
        )
    ''')
    
    # Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            message TEXT,
            timestamp INTEGER,
            student_db_id INTEGER,
            FOREIGN KEY(student_db_id) REFERENCES students(id)
        )
    ''')
    
    # Seed data if empty
    cursor.execute("SELECT count(*) FROM students")
    if cursor.fetchone()[0] == 0:
        students_data = [
            ('STU24001', 'Aditya Verma', 'A-Block', '201', '+91 9876543210', 'parent1@example.com', 'qr_aditya'),
            ('STU24005', 'Rahul Sharma', 'B-Block', '305', '+91 9123456789', 'parent2@example.com', 'qr_rahul'),
            ('STU24012', 'Sneha Reddy', 'A-Block', '112', '+91 9988776655', 'parent3@example.com', 'qr_sneha'),
            ('STU24021', 'Priya Das', 'C-Block', '401', '+91 9000111222', 'parent4@example.com', 'qr_priya'),
        ]
        cursor.executemany('''
            INSERT INTO students (student_id, name, hostel_block, room_number, parent_phone, parent_email, qr_code, last_event_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', [(s[0], s[1], s[2], s[3], s[4], s[5], s[6], int(time.time())) for s in students_data])
    
    conn.commit()
    conn.close()

init_db()

# --- Schemas ---
class FrameData(BaseModel):
    image: str

class StudentEnroll(BaseModel):
    name: str
    studentId: str
    hostelBlock: str
    roomNumber: str
    parentPhone: str
    parentEmail: str

class GateEvent(BaseModel):
    studentId: str # The student_id string (e.g. STU24001)
    eventType: str # "EXIT" or "ENTRY"

# --- API Endpoints ---

@app.get("/stats")
async def get_stats():
    conn = sqlite3.connect('hostel_management.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM students")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM students WHERE status = 'outside'")
    outside = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM outings WHERE status = 'active' AND (?-exit_time) > 21600", (int(time.time()),))
    overdue = cursor.fetchone()[0]
    
    conn.close()
    return {
        "totalStudents": total,
        "currentlyOut": outside,
        "overdue": overdue,
        "recentAlerts": 0
    }

@app.get("/students")
async def list_students():
    conn = sqlite3.connect('hostel_management.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/enroll")
async def enroll(s: StudentEnroll):
    conn = sqlite3.connect('hostel_management.db')
    cursor = conn.cursor()
    try:
        qr = f"qr_{s.studentId.lower()}"
        cursor.execute('''
            INSERT INTO students (student_id, name, hostel_block, room_number, parent_phone, parent_email, qr_code, last_event_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (s.studentId, s.name, s.hostelBlock, s.roomNumber, s.parentPhone, s.parentEmail, qr, int(time.time())))
        conn.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    finally:
        conn.close()

@app.post("/recognize")
async def recognize(data: FrameData):
    # Simulated recognition: pick a random student
    conn = sqlite3.connect('hostel_management.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students ORDER BY RANDOM() LIMIT 1")
    student = cursor.fetchone()
    conn.close()
    if student:
        return {"success": True, "student": dict(student)}
    return {"success": False}

@app.post("/gate-event")
async def gate_event(event: GateEvent):
    conn = sqlite3.connect('hostel_management.db')
    cursor = conn.cursor()
    now = int(time.time())
    
    # Get student internal ID
    cursor.execute("SELECT id, name, status FROM students WHERE student_id = ?", (event.studentId,))
    res = cursor.fetchone()
    if not res:
        conn.close()
        return {"success": False, "message": "Student not found"}
    
    db_id, name, current_status = res
    
    if event.eventType == "EXIT":
        if current_status == "outside":
            conn.close()
            return {"success": False, "message": "Already outside"}
        
        cursor.execute("INSERT INTO outings (student_db_id, exit_time, status) VALUES (?, ?, 'active')", (db_id, now))
        cursor.execute("UPDATE students SET status = 'outside', last_event_time = ? WHERE id = ?", (now, db_id))
        cursor.execute("INSERT INTO logs (type, message, timestamp, student_db_id) VALUES ('info', ?, ?, ?)", 
                       (f"{name} exited. Parent notified.", now, db_id))
        msg = f"Exit logged for {name}"
    else:
        if current_status == "inside":
            conn.close()
            return {"success": False, "message": "Already inside"}
            
        cursor.execute("UPDATE outings SET entry_time = ?, status = 'completed' WHERE student_db_id = ? AND status = 'active'", (now, db_id))
        cursor.execute("UPDATE students SET status = 'inside', last_event_time = ? WHERE id = ?", (now, db_id))
        cursor.execute("INSERT INTO logs (type, message, timestamp, student_db_id) VALUES ('info', ?, ?, ?)", 
                       (f"{name} returned. Welcome back.", now, db_id))
        msg = f"Entry logged for {name}"
        
    conn.commit()
    conn.close()
    return {"success": True, "message": msg}

@app.get("/logs")
async def get_logs():
    conn = sqlite3.connect('hostel_management.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
