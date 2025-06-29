# SprintSync

SprintSync is a project designed to streamline sprint planning, task management, and daily reporting for development teams. It consists of a FastAPI/PostgreSQL backend and a Next.js/React frontend.

---

## Demo Environment

- **Frontend:** [https://sprintsync-xi.vercel.app/](https://sprintsync-xi.vercel.app/)
- **Swagger Docs:** [https://sprintsync-production.up.railway.app/docs](https://sprintsync-production.up.railway.app/docs)

**Demo User:**

- Email: `demo@example.com`
- Password: `demopassword`

## Tech Stack & Decisions

### Backend Architecture

- **FastAPI**: Chosen for its modern async support, automatic OpenAPI documentation, and excellent type hints
- **PostgreSQL**: Reliable, ACID-compliant database with excellent JSON support for flexible data structures
- **SQLAlchemy**: ORM with async support, providing type safety and database abstraction
- **Alembic**: Database migration tool for version-controlled schema changes
- **Pydantic**: Data validation and serialization, ensuring API contract consistency

### Frontend Architecture

- **Next.js 15**: App Router for modern React patterns, server-side rendering, and excellent developer experience
- **TypeScript**: Type safety across the full stack, reducing runtime errors and improving maintainability
- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent UI development
- **NextAuth.js**: Authentication solution with built-in session management and multiple provider support

### AI Integration

- **OpenAI API**: Leveraged for intelligent task description generation and daily planning
- **Server-Sent Events (SSE)**: Real-time streaming of AI-generated content for better user experience
- **Markdown Rendering**: Rich text formatting for AI-generated plans and task descriptions

### Development & Deployment

- **Docker Compose**: Local development environment with consistent dependencies
- **Vercel**: Frontend deployment with automatic CI/CD and edge functions
- **Railway**: Backend deployment with PostgreSQL hosting and automatic scaling
- **Repo Structure**: Single repository for easier development, testing, and deployment coordination

### Security & Performance

- **JWT Tokens**: Stateless authentication with secure token-based sessions
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing for production deployments
- **Database Indexing**: Optimized queries for task and user management

---

## Planned Improvements

- **Rate Limiting**: Prevent abuse of AI APIs and other endpoints by implementing per-user and global rate limits (e.g., using FastAPI-limiter or similar middleware).
- **Stronger Input Validation**: Enforce length and content limits on user input (e.g., task titles, descriptions, AI prompts) to improve security, reliability, and user experience.
- **Audit Logging**: Track important actions for security and debugging.
- **Granular Permissions**: More fine-grained access control for admin/user roles.
- **Monitoring & Alerts**: Add observability for API errors, latency, and usage spikes.

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
