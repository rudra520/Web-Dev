# HostelGuard AI: Raw Standalone Version (No External Dependencies)

This version of the system is designed for **zero-dependency testing** on local systems. It removes all cloud-managed services (like Convex) and consolidates all logic into a local Python/SQLite environment.

## 🚀 Execution Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 2. Run the Backend (Python + SQLite)
The backend handles 100% of the database and biometric logic locally.

```bash
# Navigate to the project
cd hostel-guard-ai

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate # Linux/macOS
# .\venv\Scripts\activate # Windows

# Install minimum required packages
pip install fastapi uvicorn pillow numpy pydantic

# Start the standalone server
python python_backend/main.py
```
*Server runs on `http://localhost:8000`.*

### 3. Run the Frontend (React)
The frontend communicates directly with your local Python server.

```bash
# In a new terminal
npm install
npm run dev:web
```
*App runs on `http://localhost:3000`.*

---

## 🛠️ "Raw" Architecture Details

### Zero Cloud Dependency
- **No Convex:** All data is stored in a local `hostel_management.db` (SQLite).
- **Native Fetch:** Frontend uses standard web APIs to communicate with the backend.
- **Privacy:** No student data ever leaves your local machine.

### Core Features (Local)
1.  **Real-Time Biometrics:** Browser captures video frames and the Python backend performs recognition.
2.  **Identity HUD:** Overlay displaying recognized student info (Name, Room, ID).
3.  **Security Logs:** Chronological movement audit trail stored in SQLite.
4.  **Dashboard:** Live stats calculated via local SQL queries.

## 📂 Project Structure (Simplified)
- `python_backend/main.py`: The single source of truth (API + DB Logic).
- `hostel_management.db`: SQLite database file.
- `src/routes/`: React pages using standard `fetch` to talk to port 8000.
