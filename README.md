# SprintSync

SprintSync is a project designed to streamline sprint planning, task management, and daily reporting for development teams. It consists of a FastAPI/PostgreSQL backend and a Next.js/React frontend.

---

## Project Structure

```
sprintsync/
  backend/    # FastAPI backend, database, and migrations
  frontend/   # Next.js frontend application
  README.md   # Root documentation (this file)
```

---

## Backend

- **Framework:** FastAPI
- **Database:** PostgreSQL (via SQLAlchemy)
- **Location:** `backend/`

### Setup

1. **Install dependencies:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. **Configure environment:**
   - Edit `.env` or set environment variables as needed.
3. **Database migrations:**
   ```bash
   alembic upgrade head
   ```
4. **Run the backend server:**
   ```bash
   uvicorn src.main:app --reload
   ```
5. **Docker (optional):**
   ```bash
   docker-compose up --build
   ```

---

## Frontend

- **Framework:** Next.js (React, TypeScript)
- **Location:** `frontend/`

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env.local` and fill in required values.
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## Development

- Use separate terminals for backend and frontend development.
- Backend API runs by default on `http://localhost:8000`.
- Frontend runs by default on `http://localhost:3000`.
- Update environment variables as needed for local development.
