# SwachhLens — Backend API

> AI-Powered Waste Response Decision Support System  
> FastAPI · PostgreSQL/Supabase · JWT · Python 3.12+

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Database Architecture](#database-architecture)
- [Supabase Setup](#supabase-setup)
- [Migrations](#migrations)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Phase Roadmap](#phase-roadmap)

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # Application factory
│   ├── core/
│   │   ├── config.py              # Settings (pydantic-settings)
│   │   └── logging.py             # Structured logging
│   ├── db/
│   │   ├── base.py                # DeclarativeBase
│   │   └── session.py             # Async engine + get_db() dependency
│   ├── models/
│   │   ├── __init__.py            # Single import point for Alembic
│   │   ├── user.py                # User model
│   │   ├── report.py              # Report model (central table)
│   │   ├── team.py                # Team model
│   │   ├── vehicle.py             # Vehicle model
│   │   └── report_status_history.py
│   └── api/
│       └── v1/
│           ├── router.py          # v1 aggregator
│           └── health.py          # GET /api/v1/health
├── alembic/
│   ├── env.py                     # Reads DATABASE_URL from settings
│   └── versions/
│       └── 0001_initial_schema.py # Initial migration (all 5 tables)
├── tests/
│   ├── test_health.py             # Phase 1 health tests (9)
│   └── test_database.py           # Phase 2 model/schema tests (50)
├── alembic.ini
├── .env.example
├── .gitignore
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Python | **3.12** (not 3.14 — no pydantic-core wheel yet) |
| pip | 23+ |
| PostgreSQL | 14+ (or Supabase project) |

---

## Setup

```powershell
# 1. Clone and switch to the backend branch
git clone <repo-url>
cd SwachhLens\backend
git checkout venky/backend-ai

# 2. Create a Python 3.12 virtual environment  ← IMPORTANT: use py -3.12
py -3.12 -m venv .venv

# 3. Activate it (PowerShell)
.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment
copy .env.example .env
# Edit .env — set DATABASE_URL to your Supabase/local Postgres connection string
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Phase 2+** | `""` | PostgreSQL connection string (see below) |
| `APP_NAME` | No | `SwachhLens API` | Swagger UI title |
| `APP_VERSION` | No | `0.1.0` | Swagger UI version |
| `DEBUG` | No | `false` | Enable SQLAlchemy query logging |
| `ENVIRONMENT` | No | `development` | `development` \| `staging` \| `production` |
| `HOST` | No | `0.0.0.0` | Uvicorn bind host |
| `PORT` | No | `8000` | Uvicorn bind port |
| `CORS_ORIGINS` | No | `http://localhost:3000,...` | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `INFO` | Log level |

---

## Running the Server

```powershell
# Development (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |
| `http://localhost:8000/api/v1/health` | Health check |

---

## Database Architecture

```
FastAPI
  ↓
SQLAlchemy 2.x (async, ORM)
  ↓
Alembic (schema migrations)
  ↓
psycopg (psycopg3 driver)
  ↓
PostgreSQL / Supabase PostgreSQL
```

### Tables

| Table | Description |
|-------|-------------|
| `users` | Citizens + municipal officers/commissioners |
| `reports` | Central waste report table (shared by both apps) |
| `teams` | Municipal waste-response teams |
| `vehicles` | Municipal vehicles |
| `report_status_history` | Immutable audit trail of report status changes |

### Key constraints

- `reports.confidence` — 0.0 to 1.0 (enforced at DB level)
- `reports.progress` — 0 to 100
- `reports.latitude` — −90 to 90
- `reports.longitude` — −180 to 180
- `reports.severity_score` — non-negative
- `users.email` — unique
- `teams.name` — unique
- `vehicles.plate_number` — unique

---

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string**.
3. Copy the **Session Pooler** URI (port 5432).
4. Replace `[YOUR-PASSWORD]` and paste into your `.env`:

```
DATABASE_URL=postgresql+psycopg://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

> **Note**: Use the `postgresql+psycopg://` scheme (psycopg3), not `postgresql+asyncpg://`.

---

## Migrations

```powershell
# Apply all pending migrations to the database
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Roll back to the beginning
alembic downgrade base

# Preview SQL without connecting (offline mode)
alembic upgrade head --sql

# Check current migration state
alembic current

# View migration history
alembic history

# Auto-generate a new migration from model changes (Phase 3+)
alembic revision --autogenerate -m "describe your change"
```

---

## API Reference

### `GET /api/v1/health`

Liveness check — no DB dependency.

**Response `200 OK`**
```json
{
  "status": "ok",
  "app_name": "SwachhLens API",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-08-19T15:10:00+00:00"
}
```

---

## Running Tests

```powershell
# Run all tests (Phase 1 + Phase 2)
pytest -v

# Run only database tests
pytest tests/test_database.py -v

# Run only health tests
pytest tests/test_health.py -v

# With coverage
pip install pytest-cov
pytest -v --cov=app --cov-report=term-missing
```

> Database model tests run without a live database connection.

---

## Phase Roadmap

| Phase | Status | Feature |
|-------|--------|---------|
| **1** | ✅ Done | Project scaffold, config, CORS, logging, /health, tests |
| **2** | ✅ Done | SQLAlchemy models, Alembic migrations, database foundation |
| 3 | 🔜 Next | JWT authentication, user registration/login |
| 4 | ⬜ Planned | Report APIs, Supabase Storage |
| 5 | ⬜ Planned | AI waste analysis, duplicate detection |
| 6 | ⬜ Planned | Explainable Decision Engine |
| 7 | ⬜ Planned | Team/Vehicle assignment, cleanup verification |
| 8 | ⬜ Planned | Dashboard KPIs, analytics |


---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # Application factory (FastAPI app)
│   ├── core/
│   │   ├── config.py        # Pydantic-settings configuration
│   │   └── logging.py       # Structured logging setup
│   └── api/
│       └── v1/
│           ├── router.py    # Aggregated v1 router
│           └── health.py    # GET /api/v1/health
├── tests/
│   └── test_health.py       # Health endpoint tests
├── .env.example             # Template — copy to .env and fill in values
├── .gitignore
├── pyproject.toml           # Pytest configuration
├── requirements.txt
└── README.md
```

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Python | 3.12 |
| pip | 23+ |

---

## Setup

```bash
# 1. Clone and switch to the backend branch
git clone <repo-url>
cd SwachhLens/backend
git checkout venky/backend-ai

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate it
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux
# Then edit .env with your actual values
```

---

## Environment Variables

All variables are optional for Phase 1 (defaults are sensible for local dev).  
Copy `.env.example` → `.env` and adjust as needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `SwachhLens API` | Displayed in Swagger UI |
| `APP_VERSION` | `0.1.0` | Displayed in Swagger UI |
| `DEBUG` | `false` | Enable debug mode |
| `ENVIRONMENT` | `development` | `development` \| `staging` \| `production` |
| `HOST` | `0.0.0.0` | Uvicorn bind host |
| `PORT` | `8000` | Uvicorn bind port |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Comma-separated allowed origins |
| `LOG_LEVEL` | `INFO` | `DEBUG` \| `INFO` \| `WARNING` \| `ERROR` \| `CRITICAL` |

---

## Running the Server

```bash
# Development (auto-reload on file changes)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The server will be available at:

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI (interactive) |
| `http://localhost:8000/redoc` | ReDoc documentation |
| `http://localhost:8000/openapi.json` | Raw OpenAPI schema |
| `http://localhost:8000/api/v1/health` | Health check |

---

## API Reference

### `GET /api/v1/health`

Liveness check — no database or external dependency required.

**Response `200 OK`**
```json
{
  "status": "ok",
  "app_name": "SwachhLens API",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-08-19T15:10:00+00:00"
}
```

---

## Running Tests

```bash
# Run all tests with verbose output
pytest -v

# Run with coverage report
pip install pytest-cov
pytest -v --cov=app --cov-report=term-missing
```

---

## Phase Roadmap

| Phase | Status | Feature |
|-------|--------|---------|
| **1** | ✅ Done | Project scaffold, config, CORS, logging, /health, tests |
| 2 | 🔜 Next | PostgreSQL/Supabase, JWT authentication |
| 3 | ⬜ Planned | Report APIs, Supabase Storage |
| 4 | ⬜ Planned | AI waste analysis, duplicate detection |
| 5 | ⬜ Planned | Explainable Decision Engine |
| 6 | ⬜ Planned | Team/Vehicle assignment, cleanup verification |
| 7 | ⬜ Planned | Dashboard KPIs, analytics |
| 8 | ⬜ Planned | Automated test suite expansion |
