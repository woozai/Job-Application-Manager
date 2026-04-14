# Job Application Manager

A full-stack job application tracker for managing applications, contacts, referrals, follow-ups, and hiring progress in one place.

The project is a monorepo with a FastAPI backend and a React/Vite frontend.

## Features

- User registration, login, logout, and protected frontend routes.
- Job application CRUD with status, source, priority, dates, notes, descriptions, skills, and process tracking.
- Dashboard with cards, search, filters, stats, loading, empty, success, and error states.
- Job details page with full application context and related contacts.
- Contact CRUD for recruiters, employees, referrals, friends, and other networking contacts.
- SQLite database for local development.

## Tech Stack

Backend:
- Python 3.13+
- FastAPI
- SQLAlchemy
- Pydantic and Pydantic Settings
- Alembic
- SQLite
- PyJWT authentication
- pytest
- uv for Python dependency management

Frontend:
- React 19
- React Router
- TypeScript
- Vite
- CSS modules by feature area
- npm for local frontend commands

## Project Structure

```text
backend/
  app/
    core/          Backend settings and shared config
    routers/       API routes for users, jobs, contacts, and health
  alembic/         Database migration setup
  tests/           Backend tests
  pyproject.toml   Backend dependencies and tooling

frontend/
  src/
    api/           Frontend API clients
    components/    Reusable UI and feature components
    hooks/         Shared frontend state and behavior
    pages/         Route-level screens
    styles/        Global and feature CSS files
    types/         Shared TypeScript types
  package.json     Frontend scripts and dependencies
```

## Prerequisites

- Python 3.13 or newer
- uv
- Node.js
- npm

## Environment Files

Create local environment files from the examples:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Backend variables:

```env
APP_NAME=Job Application Manager API
DATABASE_URL=sqlite:///./job_applications.db
SECRET_KEY=change-me-in-production-with-at-least-32-bytes
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Frontend variables:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not commit real secrets. Use a strong `SECRET_KEY` outside local development.

## Backend Setup

From the backend folder:

```powershell
cd backend
uv sync
```

Run database migrations:

```powershell
uv run alembic upgrade head
```

Start the API:

```powershell
uv run uvicorn app.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

Useful backend URLs:

- API docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health/`

Run backend tests:

```powershell
uv run pytest
```

## Frontend Setup

From the frontend folder:

```powershell
cd frontend
npm install
```

Start the frontend dev server:

```powershell
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

Build the frontend:

```powershell
npm run build
```

Preview a production build:

```powershell
npm run preview
```

## Local Development Flow

1. Start the backend from `backend/`.
2. Start the frontend from `frontend/`.
3. Open `http://127.0.0.1:5173`.
4. Register a user or log in.
5. Create job applications from the dashboard.
6. Open a job details page to add, edit, or delete contacts.

## Local Database Backup

The local SQLite database lives at `backend/job_applications.db`.

Create a timestamped backup before risky local work:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1
```

Backups are written to `backend/backups/` and are ignored by git.

## API Overview

Main backend route groups:

- `/health/` for health checks.
- `/users/` for registration, login, and current-user auth flows.
- `/job-applications/` for job application CRUD.
- `/contacts/` for contact CRUD.

The frontend uses `VITE_API_BASE_URL` to call the backend. By default it falls back to `http://127.0.0.1:8000`.

## Quality Checks

Backend:

```powershell
cd backend
uv run pytest
```

Frontend:

```powershell
cd frontend
npm run build
```

## Notes

- The backend currently uses SQLite for local development.
- CORS is configured for the Vite dev server at `http://127.0.0.1:5173` and `http://localhost:5173`.
- Keep generated files, local databases, virtual environments, and real `.env` values out of commits.
