# 🛡️ HostelGuard AI · Raw Standalone Version

> **Zero-dependency, privacy-first, local-first** — No cloud, no Convex, no external services.  
> **Everything runs on your machine.** Biometric recognition, SQLite database, and React frontend communicate directly via local API.

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue)](https://python.org)
[![Node Version](https://img.shields.io/badge/node-18%2B-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)
[![Branch](https://img.shields.io/badge/branch-raw--standalone-orange)](../../tree/raw-standalone)

---

## 📌 Branch Notice

**You are currently viewing the `raw-standalone` branch.**  
This branch removes all cloud-managed services (Convex, Firebase, etc.) and implements a **pure local stack**:

- 🐍 **Backend**: FastAPI + SQLite (single `main.py`)
- ⚛️ **Frontend**: React + native `fetch` API
- 🧠 **Biometrics**: Real-time face recognition via Python backend (no third-party APIs)

> ✅ Perfect for **offline testing**, **privacy demos**, or **air‑gapped deployments**.

---

## ✨ Features (Local-First)

| Feature | Description |
|---------|-------------|
| 🎥 **Real‑time Biometrics** | Browser captures video → Python backend recognizes faces instantly |
| 🆔 **Identity HUD** | Overlay shows student name, room number, and ID on live video |
| 📜 **Security Logs** | Every entry/exit is timestamped and stored in local SQLite |
| 📊 **Live Dashboard** | Stats like “students inside” are computed via local SQL queries |
| 🔒 **Zero Data Leakage** | No student data ever leaves your machine |

---

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- **Python 3.10+** – [Download](https://www.python.org/downloads/)
- **Node.js 18+** – [Download](https://nodejs.org/)

### 2. Clone & Switch Branch
```bash
git clone https://github.com/your-org/hostel-guard-ai.git
cd hostel-guard-ai
git checkout raw-standalone   # <-- important!-->
```
---
## 📂 Project Structure
---
```
hostel-guard-ai/                      # root of raw-standalone branch
│
├── python_backend/                   # 🐍 ALL backend logic
│   └── main.py                       # FastAPI app + SQLite + recognition (single file)
│
├── src/                              # ⚛️ React frontend
│   ├── routes/                       # Page components
│   │   ├── Dashboard.jsx
│   │   ├── SecurityLogs.jsx
│   │   └── BiometricHUD.jsx
│   ├── App.jsx
│   └── main.jsx
│
├── public/                           # Static assets
│   └── index.html
│
├── hostel_management.db              # 🗄️ SQLite database (auto-created)
│
├── package.json                      # Frontend dependencies
├── vite.config.js                    # Vite dev server config
├── requirements.txt                  # (optional – but we use pip install inline)
│
└── README.md                         # This file
---

