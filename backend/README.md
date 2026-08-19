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
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Phase Roadmap](#phase-roadmap)

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
