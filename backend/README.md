# SprintSync Backend

SprintSync is a lean, modern internal tool for fast-moving AI consultancies. It enables engineers to log work, track time, and leverage LLMs for daily planning. This backend is built with FastAPI and designed for clarity, extensibility, and cloud deployment.

---

## Scenario

A fast-moving AI consultancy needs a lean internal tool—SprintSync—so its engineers can log work, track time, and lean on an LLM for quick planning help. The repo also serves as a reference for clean architecture, DevOps, and thoughtful API design.

---

## Features

- **Authentication**: JWT-based, secure, and stateless.
- **Task Management**: CRUD for tasks, with time tracking.
- **AI Daily Planning**: LLM-powered daily plan generation and history.
- **User Management**: Profile and session endpoints.
- **Clean Architecture**: Domain, application, and infrastructure layers.
- **DevOps Ready**: Docker, migrations, and .env support.
- **Testing**: TBD

---

## Stack

- **Python 3.11+**
- **FastAPI** (API framework)
- **SQLAlchemy** (ORM)
- **PostgreSQL** (default, can use SQLite for dev)
- **Alembic** (migrations)
- **Pytest** (testing)
- **OpenAI** (LLM integration)
- See [`requirements.txt`](./requirements.txt) for all packages.

---

## Project Structure

```
backend/
  src/
    ai/           # LLM integration, daily plan logic
    auth/         # Auth logic and models
    database/     # DB core and session
    entities/     # ORM models (User, Task, DailyPlan)
    tasks/        # Task CRUD logic
    users/        # User CRUD logic
    main.py       # FastAPI app entrypoint
    api.py        # Route registration
    logging.py    # Logging config
  migrations/     # Alembic migrations
  .env.example    # Environment variable template
  requirements.txt
  docker-compose.yml
  Dockerfile
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/sprintsync"
SECRET_KEY=YOUR_SECRET_HERE
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_KEY=your-openai-key
```

---

## Running Locally

**With Docker/Postgres:**

```sh
docker compose up --build
# To stop:
docker compose down
```

**Without Docker (SQLite for dev):**

- Edit `src/database/core.py` to use SQLite.
- Run:
  ```sh
  pip install -r requirements-dev.txt
  uvicorn src.main:app --reload
  ```

---

## Migrations

```sh
alembic revision -m "create table"
alembic upgrade head
alembic downgrade -1  # Revert last
alembic downgrade base  # Revert all
```

---

## Testing

```sh
pytest
```

---

## API

- OpenAPI docs: `http://localhost:8000/docs`
- CORS is enabled for the frontend URL.

---

## Cloud/DevOps

- Ready for deployment on any cloud (Docker, .env, stateless).
- Reference for clean, maintainable FastAPI projects.
