# SwachhLens — Backend API

> AI-Powered Waste Response Decision Support System  
> FastAPI · PostgreSQL/Supabase · JWT · bcrypt · Brevo · Python 3.12+

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Database Architecture](#database-architecture)
- [Authentication Architecture](#authentication-architecture)
- [Brevo Email Configuration](#brevo-email-configuration)
- [Supabase Setup](#supabase-setup)
- [Migrations](#migrations)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Security Notes](#security-notes)
- [Phase Roadmap](#phase-roadmap)

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                        # Application factory (lifespan, CORS)
│   ├── core/
│   │   ├── config.py                  # Pydantic-settings (all env vars)
│   │   ├── logging.py                 # Structured logging
│   │   ├── security.py                # bcrypt hashing + JWT encode/decode
│   │   └── dependencies.py            # get_current_user, require_roles()
│   ├── db/
│   │   ├── base.py                    # DeclarativeBase
│   │   └── session.py                 # Lazy async engine + get_db()
│   ├── models/
│   │   ├── __init__.py                # Single import point for Alembic
│   │   ├── user.py                    # User ORM model (auth fields included)
│   │   ├── report.py                  # Report model (central table)
│   │   ├── team.py                    # Team model
│   │   ├── vehicle.py                 # Vehicle model
│   │   └── report_status_history.py   # Audit trail
│   ├── schemas/
│   │   └── auth.py                    # Pydantic request/response schemas
│   ├── services/
│   │   ├── auth.py                    # Registration, login, verify, reset
│   │   └── email.py                   # Brevo email service abstraction
│   └── api/
│       └── v1/
│           ├── router.py              # v1 aggregator
│           ├── health.py              # GET /api/v1/health
│           ├── auth.py                # Auth endpoints
│           └── users.py               # User management endpoints
├── alembic/
│   ├── env.py                         # Reads DATABASE_URL from settings
│   └── versions/
│       ├── 0001_initial_schema.py     # Initial migration (5 tables)
│       └── 0002_add_auth_fields_to_users.py  # Auth fields on users
├── tests/
│   ├── test_health.py                 # Phase 1: health tests (9)
│   ├── test_database.py               # Phase 2: model/schema tests (50)
│   └── test_auth.py                   # Phase 3: auth/authz tests (40)
├── alembic.ini
├── .env.example                       # Copy → .env and fill in values
├── .gitignore
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## Prerequisites

| Tool | Minimum Version | Note |
|------|----------------|------|
| Python | **3.12** | Do NOT use 3.14 — no `pydantic-core` wheel |
| pip | 23+ | |
| PostgreSQL | 14+ | Or a Supabase project |

> **Important:** Always create the venv with `py -3.12 -m venv .venv` on Windows.

---

## Setup

```powershell
# 1. Clone and switch to the backend branch
git clone <repo-url>
cd SwachhLens\backend
git checkout venky/backend-ai

# 2. Create a Python 3.12 virtual environment
py -3.12 -m venv .venv

# 3. Activate it (PowerShell)
.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment
copy .env.example .env
# Edit .env — fill in DATABASE_URL, JWT_SECRET_KEY, BREVO_API_KEY, etc.

# 6. Apply migrations to your Supabase/Postgres database
alembic upgrade head
```

---

## Environment Variables

All values come from `.env` (never committed). Copy `.env.example` → `.env`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | `""` | PostgreSQL async connection string |
| `JWT_SECRET_KEY` | **Yes (prod)** | `CHANGE-ME-...` | Long random secret for JWT signing |
| `BREVO_API_KEY` | **Yes (email)** | `""` | Brevo transactional email API key |
| `APP_NAME` | No | `SwachhLens API` | Swagger UI title |
| `APP_VERSION` | No | `0.1.0` | API version |
| `DEBUG` | No | `false` | SQLAlchemy query logging |
| `ENVIRONMENT` | No | `development` | `development` \| `staging` \| `production` |
| `HOST` | No | `0.0.0.0` | Uvicorn bind host |
| `PORT` | No | `8000` | Uvicorn bind port |
| `CORS_ORIGINS` | No | `http://localhost:3000,...` | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `INFO` | Log level |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | JWT token lifetime (minutes) |
| `EMAIL_VERIFICATION_EXPIRE_HOURS` | No | `24` | Verification token lifetime |
| `PASSWORD_RESET_EXPIRE_MINUTES` | No | `30` | Reset token lifetime |
| `BREVO_SENDER_EMAIL` | No | `noreply@swachlens.app` | From address |
| `BREVO_SENDER_NAME` | No | `SwachhLens` | From display name |
| `FRONTEND_BASE_URL` | No | `http://localhost:3000` | Base URL for email links |

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
| `http://localhost:8000/docs` | Swagger UI (interactive) |
| `http://localhost:8000/redoc` | ReDoc |
| `http://localhost:8000/api/v1/health` | Health check |
| `http://localhost:8000/api/v1/auth/...` | Auth endpoints |

---

## Database Architecture

```
FastAPI
  ↓
SQLAlchemy 2.x (async ORM)
  ↓
Alembic (schema migrations)
  ↓
psycopg3 driver (postgresql+psycopg://)
  ↓
PostgreSQL / Supabase PostgreSQL
```

### Tables

| Table | Description |
|-------|-------------|
| `users` | Citizens + municipal officers/commissioners |
| `reports` | Central waste report table |
| `teams` | Municipal waste-response teams |
| `vehicles` | Municipal vehicles |
| `report_status_history` | Immutable audit trail of report status changes |

---

## Authentication Architecture

### Token-based (JWT)

- **Registration** → bcrypt-hashed password stored; verification token (bcrypt-hashed) stored; plain token emailed via Brevo.
- **Login** → credentials verified against bcrypt hash; HS256 JWT issued; contains `sub` (user UUID), `role`, `email`.
- **All protected endpoints** → `Authorization: Bearer <token>` header required; JWT decoded and user fetched from DB.
- **Role checks** → server-side only via `require_roles("commissioner")` dependency.

### Roles

| Role | Description |
|------|-------------|
| `citizen` | Files waste reports (default) |
| `officer` | Municipal field officer |
| `commissioner` | Senior official, full dashboard access |

### Token security

- Tokens stored in DB as **bcrypt hashes** — never plaintext.
- Tokens are **single-use** — cleared on successful verify/reset.
- Tokens have **expiry** enforced both at creation and at validation time.
- Email enumeration protected on `forgot-password` (always 200).
- Timing-attack resistant on login (always runs bcrypt even on unknown email).

### Reusable dependencies

```python
from app.core.dependencies import get_current_user, require_active_user, require_roles

# Any authenticated endpoint
async def endpoint(user: User = Depends(get_current_user)): ...

# Active users only
async def endpoint(user: User = Depends(require_active_user)): ...

# Role-gated (officers and commissioners)
async def endpoint(user: User = Depends(require_roles("officer", "commissioner"))): ...
```

---

## Brevo Email Configuration

1. Create an account at [app.brevo.com](https://app.brevo.com).
2. Go to **SMTP & API → API Keys** → create a key.
3. Set in `.env`:
   ```
   BREVO_API_KEY=your-api-key-here
   BREVO_SENDER_EMAIL=noreply@yourdomain.com
   BREVO_SENDER_NAME=SwachhLens
   ```
4. Verify your sender domain/email in Brevo settings.

> The email service is abstracted in [`app/services/email.py`](app/services/email.py).  
> In tests it is mocked via `app.dependency_overrides` — no real API calls are made.  
> Email failures do **not** crash the API (logged as WARNING, 201 still returned).

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string → Session Pooler**.
3. Copy the URI and set in `.env`:
   ```
   DATABASE_URL=postgresql+psycopg://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
4. Run `alembic upgrade head` to create all tables.

---

## Migrations

```powershell
# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Roll back to base (empty schema)
alembic downgrade base

# View migration history
alembic history

# Preview SQL without connecting (offline)
alembic upgrade head --sql

# Auto-generate from model changes
alembic revision --autogenerate -m "describe your change"
```

### Migration history

| Revision | Description |
|----------|-------------|
| `0001` | Initial schema: users, teams, vehicles, reports, report_status_history |
| `0002` | Add auth fields to users: is_active, is_verified, verification/reset tokens |

---

## API Reference

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | None | Liveness check |

### Authentication (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | None | Register new user |
| `POST` | `/api/v1/auth/login` | None | Log in, receive JWT |
| `GET` | `/api/v1/auth/me` | Bearer | Current user profile |
| `POST` | `/api/v1/auth/verify-email` | None | Verify email with token |
| `POST` | `/api/v1/auth/forgot-password` | None | Request password-reset email |
| `POST` | `/api/v1/auth/reset-password` | None | Complete password reset |

### Users (`/api/v1/users`)

| Method | Path | Auth | Required Role |
|--------|------|------|--------------|
| `GET` | `/api/v1/users/me` | Bearer | Any |
| `GET` | `/api/v1/users/{id}` | Bearer | `officer`, `commissioner` |
| `GET` | `/api/v1/users` | Bearer | `commissioner` |

---

## Running Tests

```powershell
# Run the full test suite (99 tests, no live DB needed)
pytest -v

# Auth tests only
pytest tests/test_auth.py -v

# Database model tests only
pytest tests/test_database.py -v

# Health tests only
pytest tests/test_health.py -v

# With coverage
pip install pytest-cov
pytest -v --cov=app --cov-report=term-missing
```

### Test summary

| File | Tests | DB Required |
|------|-------|-------------|
| `test_health.py` | 9 | No |
| `test_database.py` | 50 | No (metadata introspection) |
| `test_auth.py` | 40 | No (in-memory SQLite + mocked Brevo) |
| **Total** | **99** | **None** |

---

## Security Notes

- **Never commit `.env`** — it is in `.gitignore`.
- **`JWT_SECRET_KEY`** must be a long, random secret in production:  
  ```powershell
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
- Passwords are hashed with **bcrypt** (passlib, 12 rounds) — never stored plaintext.
- Verification and reset tokens are stored as **bcrypt hashes** — plain tokens only exist in memory long enough to be emailed.
- Token lookups iterate only the matching candidate set, not the full table.
- `forgot-password` always returns HTTP 200 regardless of email existence (no enumeration).
- CORS is configured via the `CORS_ORIGINS` env var — restrict in production.
- `BREVO_API_KEY` must never appear in source code, logs, or Git history.

---

## Phase Roadmap

| Phase | Status | Feature |
|-------|--------|---------|
| **1** | ✅ Done | FastAPI scaffold, config, CORS, logging, /health, tests |
| **2** | ✅ Done | SQLAlchemy models, Alembic migrations, database foundation |
| **3** | ✅ Done | JWT auth, RBAC, email verification, password reset, Brevo |
| 4 | 🔜 Next | Report CRUD APIs, Supabase Storage (image uploads) |
| 5 | ⬜ Planned | AI waste analysis, duplicate detection |
| 6 | ⬜ Planned | Explainable Decision Engine |
| 7 | ⬜ Planned | Team/Vehicle assignment, cleanup verification |
| 8 | ⬜ Planned | Dashboard KPIs, analytics |
