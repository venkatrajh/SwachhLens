# SwachhLens — Backend API & Decision Engine

> The asynchronous REST backend and intelligence core powering SwachhLens. Built with FastAPI, PostgreSQL/Supabase, Groq Vision AI, and a deterministic municipal dispatch decision engine.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Directory Layout](#directory-layout)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation & Local Setup](#installation--local-setup)
- [Database Schema & Migrations](#database-schema--migrations)
- [Fleet Initialization Script](#fleet-initialization-script)
- [Core Services Deep Dive](#core-services-deep-dive)
  - [Vision AI Pipeline (Groq)](#vision-ai-pipeline-groq)
  - [Reverse Geocoding & Address Fallback](#reverse-geocoding--address-fallback)
  - [Geospatial Duplicate Detection](#geospatial-duplicate-detection)
  - [Rule-Based Decision Engine](#rule-based-decision-engine)
  - [Deterministic Site Clearance Images](#deterministic-site-clearance-images)
  - [Email & Notification Services](#email--notification-services)
- [Complete REST API Reference](#complete-rest-api-reference)
- [Automated Testing Suite (210 Tests)](#automated-testing-suite-210-tests)
- [Security & RBAC Specifications](#security--rbac-specifications)

---

## Architectural Overview

The backend is structured around clean asynchronous architecture:
- **FastAPI 0.115.5**: Non-blocking asynchronous web layer with automatic OpenAPI documentation (`/docs` and `/redoc`).
- **SQLAlchemy 2.0.36 (Async)**: Utilizing `psycopg` (psycopg 3.2.3) with connection pooling and lazy engine instantiation.
- **Alembic 1.14.0**: Database migration versioning targeting PostgreSQL (compatible with local Postgres and Supabase pooler).
- **Groq Vision AI Engine**: Multimodal processing with `qwen/qwen3.6-27b` for rapid waste triage, volume calculation, and continuous severity scoring (`0.0 – 100.0`).
- **Fail-Safe Geocoding**: Nominatim integration with custom headers and a strict 2-second timeout; coordinate fallback ensures report creation never fails due to network or geocoder unavailability.

---

## Directory Layout

```
backend/
├── alembic/
│   ├── env.py                         # Migration runtime with async engine
│   ├── script.py.mako                 # Migration template
│   ├── versions/
│   │   ├── 0001_initial_schema.py     # Base tables: users, reports, teams, vehicles, status history
│   │   ├── 0002_add_auth_fields_to_users.py # Verification tokens, reset tokens, active/verified flags
│   │   └── 0003_create_notifications_table.py # In-app notification queue table
│   └── README                         # Dedicated Alembic documentation
├── app/
│   ├── main.py                        # FastAPI application factory, lifespan, CORS, error handling
│   ├── core/
│   │   ├── config.py                  # Pydantic Settings with env parsing and validators
│   │   ├── logging.py                 # Structured application logging
│   │   ├── security.py                # bcrypt password hashing + JWT encoding/decoding
│   │   └── dependencies.py            # get_current_user, require_roles(), DB session dependency
│   ├── db/
│   │   ├── base.py                    # DeclarativeBase with custom table naming
│   │   └── session.py                 # Async engine, sessionmaker, and get_db context
│   ├── models/
│   │   ├── __init__.py                # Model registry for Alembic metadata
│   │   ├── user.py                    # User model with role enumeration (citizen, municipal_officer, admin, driver)
│   │   ├── report.py                  # Central Report model with display_id and GPS
│   │   ├── team.py                    # Sanitation team entity
│   │   ├── vehicle.py                 # Fleet vehicle entity
│   │   ├── report_status_history.py   # Immutable audit trail of lifecycle transitions
│   │   └── notification.py            # User-targeted alerts
│   ├── schemas/
│   │   ├── ai.py                      # AI analysis request & response schemas
│   │   ├── auth.py                    # Login, registration, token schemas
│   │   ├── report.py                  # Report creation, update, triage schemas
│   │   ├── team.py                    # Team validation schemas
│   │   ├── vehicle.py                 # Vehicle validation schemas
│   │   ├── analytics.py               # Aggregation & metrics schemas
│   │   └── notification.py            # Notification event schemas
│   ├── services/
│   │   ├── ai.py                      # Groq multimodal vision client with heuristic fallback
│   │   ├── geocoding.py               # OpenStreetMap Nominatim client with coordinate fallback
│   │   ├── duplicate_detection.py     # 0.001 deg (~111m) bounding box + 48-hour window filter
│   │   ├── decision_engine.py         # Severity mapping and team/vehicle dispatch logic
│   │   ├── cleanup_images.py          # Deterministic after-cleanup photo resolution
│   │   ├── fleet.py                   # Team & vehicle state management
│   │   ├── analytics.py               # KPI and SLA statistical calculations
│   │   ├── email.py                   # Brevo transactional email sender
│   │   ├── notification.py            # Notification dispatcher
│   │   └── report.py                  # Report lifecycle workflow service
│   └── api/
│       └── v1/
│           ├── router.py              # Root v1 APIRouter combining all modules
│           ├── health.py              # GET /health liveness check
│           ├── auth.py                # Register, login, me, password reset, email verify
│           ├── users.py               # User profiles and administrative listing
│           ├── reports.py             # Report CRUD, AI triage, assignment, status update, history
│           ├── teams.py               # Fleet team endpoints
│           ├── vehicles.py            # Municipal vehicle endpoints
│           ├── analytics.py           # Real-time KPIs, fleet workload, performance, trends
│           └── notifications.py       # In-app notifications listing and read marks
├── scripts/
│   └── seed_fleet.py                  # Seeding script for teams and vehicle inventory
├── tests/                             # 13 automated test suites (210 passing tests)
├── alembic.ini                        # Alembic configuration
├── pyproject.toml                     # Python project metadata
├── requirements.txt                   # Frozen production dependencies
├── run_server.py                      # Application launch script
└── README.md                          # This documentation file
```

---

## Prerequisites

- **Python**: `3.12.x` (Do NOT use Python 3.14 — `pydantic-core` and other binary wheels are not yet compatible).
- **PostgreSQL**: Version 14+ (Local PostgreSQL instance or cloud Supabase PostgreSQL database).
- **Git**: Installed and configured.

---

## Environment Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```powershell
Copy-Item .env.example .env
```

### Environment Variables Reference

| Variable | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `APP_NAME` | string | `"SwachhLens API"` | Display name of the backend service |
| `APP_VERSION` | string | `"0.1.0"` | Current semver release |
| `DEBUG` | boolean | `false` | Enable verbose debugging and tracebacks |
| `ENVIRONMENT` | string | `"development"` | Environment tag (`development`, `staging`, `production`) |
| `HOST` | string | `"0.0.0.0"` | Network binding address |
| `PORT` | integer | `8000` | Network binding port |
| `CORS_ORIGINS` | string | `http://localhost:3000,...` | Comma-separated list of allowed frontend origins |
| `DATABASE_URL` | string | - | Async PostgreSQL URI (`postgresql+psycopg://user:pass@host:5432/db`) |
| `JWT_SECRET_KEY` | string | - | Minimum 32-character secret for signing access tokens |
| `JWT_ALGORITHM` | string | `"HS256"` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | integer | `60` | Token validity lifetime |
| `EMAIL_VERIFICATION_EXPIRE_HOURS` | integer | `24` | Account verification link lifespan |
| `PASSWORD_RESET_EXPIRE_MINUTES` | integer | `30` | Password reset link lifespan |
| `GROQ_API_KEY` | string | - | Groq Cloud API Key for Qwen Vision inference |
| `GROQ_MODEL` | string | `"qwen/qwen3.6-27b"` | Target Groq model identifier |
| `GROQ_TIMEOUT` | integer | `30` | Max seconds before AI timeout fallback triggers |
| `BREVO_API_KEY` | string | - | Brevo API key for transactional emails |
| `BREVO_SENDER_EMAIL` | string | `"noreply@swachlens.app"` | Authorized sender email address |
| `BREVO_SENDER_NAME` | string | `"SwachhLens"` | Sender name on outgoing emails |
| `FRONTEND_BASE_URL` | string | `"http://localhost:3000"` | Base URL used to formulate email verification links |

---

## Installation & Local Setup

```powershell
# 1. Enter backend directory
cd C:\PROJECTS\SwachhLens\backend

# 2. Create isolated virtual environment using Python 3.12
py -3.12 -m venv .venv

# 3. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Execute database migrations
alembic upgrade head

# 6. Seed initial municipal teams and vehicles
python scripts\seed_fleet.py

# 7. Start the FastAPI server
python run_server.py
```

The server starts at `http://localhost:8000`.
- **OpenAPI Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

## Database Schema & Migrations

Database migrations are managed via Alembic. The schema includes the following core models:

```mermaid
erDiagram
    USERS ||--o{ REPORTS : "files"
    USERS ||--o{ NOTIFICATIONS : "receives"
    TEAMS ||--o{ REPORTS : "assigned_to"
    VEHICLES ||--o{ REPORTS : "allocated_to"
    REPORTS ||--o{ REPORT_STATUS_HISTORY : "tracks"

    USERS {
        uuid id PK
        string email UK
        string full_name
        string role "citizen | municipal_officer | admin | driver"
        string password_hash
        boolean is_verified
        boolean is_active
        timestamp created_at
    }

    REPORTS {
        uuid id PK
        string display_id UK "SL-YYYY-XXXXXX"
        uuid citizen_id FK
        float latitude
        float longitude
        string address
        string image_url
        string cleanup_image_url
        string waste_type
        string volume_level
        float severity_score "0.0 - 100.0"
        float confidence
        string priority "low | medium | high | critical"
        string status "pending | analyzing | assigned | in_progress | completed | verified | duplicate"
        uuid assigned_team_id FK
        uuid assigned_vehicle_id FK
        timestamp created_at
        timestamp updated_at
    }

    TEAMS {
        uuid id PK
        string name
        string team_type
        integer capacity
        string status "available | dispatched | off_duty"
        string ward
    }

    VEHICLES {
        uuid id PK
        string registration_number UK
        string vehicle_type
        float capacity_tons
        string status "available | active | maintenance"
    }

    REPORT_STATUS_HISTORY {
        uuid id PK
        uuid report_id FK
        string from_status
        string to_status
        string changed_by
        string notes
        timestamp changed_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        string message
        string notification_type
        boolean is_read
        timestamp created_at
    }
```

### Migration History

1. **`0001_initial_schema.py`** (Revision `0001`): Creates base tables: `users`, `reports`, `teams`, `vehicles`, and `report_status_history`.
2. **`0002_add_auth_fields_to_users.py`** (Revision `0002`): Adds `is_active`, `is_verified`, `verification_token`, `verification_token_expires_at`, `reset_token`, and `reset_token_expires_at` to `users`.
3. **`0003_create_notifications_table.py`** (Revision `d1d3d3e230f0`): Adds the `notifications` table for dispatch and verification alerts.

```powershell
# Upgrade to latest revision
alembic upgrade head

# Roll back by one revision
alembic downgrade -1

# Inspect current database revision
alembic current
```

---

## Fleet Initialization Script

A dedicated seeding utility initializes standard municipal sanitation teams and fleet vehicles in `scripts/seed_fleet.py`:

```powershell
python scripts\seed_fleet.py
```

This script is idempotent (safe to run multiple times) and seeds:
- **Teams**: North Zone Quick Response, Central Debris Crew, Hazardous Materials Response Team, Wet Waste Collection Team, South Sweeper Unit.
- **Vehicles**: Tipper Truck (TN-01-AB-1234), Compactor Unit (TN-01-CD-5678), Biohazard Van (TN-01-EF-9012), Mini Dumper (TN-01-GH-3456), Sweeper Vehicle (TN-01-IJ-7890).

---

## Core Services Deep Dive

### Vision AI Pipeline (Groq)

- **File**: `app/services/ai.py`
- **Model**: `qwen/qwen3.6-27b` via Groq's Vision API with 30s timeout.
- **Output Schema**:
  - `waste_type`: Classified waste category string.
  - `volume_level`: One of `'small'`, `'medium'`, `'large'`, `'very_large'`.
  - `confidence`: Floating-point probability between `0.0` and `1.0`.
  - `severity_score`: Continuous severity metric between `0.0` and `100.0`.
  - `estimated_weight_kg`: Estimated mass in kilograms.
  - `is_hazardous`: Boolean flag for biohazard/chemical risks.
  - `is_recyclable`: Boolean flag for recyclable content.
  - `recommended_action`: Operational instructions for sanitation workers.
- **Resilience**: Pydantic validation handles JSON formatting; exceptions trigger fallback behavior without breaking report ingestion.

### Reverse Geocoding & Address Fallback

- **File**: `app/services/geocoding.py`
- **Provider**: OpenStreetMap Nominatim with `User-Agent: SwachhLens-Civic-Platform/1.0 (contact@swachhlens.app)`.
- **Resilience Guarantee**:
  - The HTTP request is awaited with a strict 2-second timeout.
  - Resolves road, neighborhood, suburb, and city into a clean string (e.g., *"Moolakadai, Chennai, Tamil Nadu"*).
  - On timeout, network disconnect, or rate limiting, exceptions are caught and the service immediately returns formatted GPS coordinates (e.g., `13.12870°, 80.25121°`).
  - Report creation is **never blocked** or failed due to geocoding.

### Geospatial Duplicate Detection

- **File**: `app/services/duplicate_detection.py`
- **Methodology**:
  - Evaluates active, non-duplicate reports created within the last `48 hours` (`time_window_hours = 48`).
  - Applies a bounding box filter with `radius_degrees = 0.001` (approximately ~111 meters at the equator).
  - Cross-checks classified `waste_type` compatibility when available.
  - Matches are flagged with `duplicate = True` and linked to the existing incident to prevent duplicate fleet mobilization.

### Rule-Based Decision Engine

- **File**: `app/services/decision_engine.py`
- **Deterministic Business Logic**:
  - **Priority Mapping**:
    - `severity < 30.0`: `low`
    - `30.0 <= severity < 60.0`: `medium`
    - `60.0 <= severity < 80.0`: `high`
    - `severity >= 80.0`: `critical`
  - **Team & Vehicle Dispatch Rules**:
    1. If `is_hazardous` is true: Assigns **Hazardous Response Team** with a **Hazmat Truck**.
    2. Else if `volume_level == "very_large"` or `estimated_weight_kg >= 500`: Assigns **Heavy Cleanup Crew** with a **Dump Truck**.
    3. Else if `is_recyclable` is true: Assigns **Recycling Team** with a **Recycling Truck**.
    4. Else if `volume_level == "large"` or `estimated_weight_kg >= 100`: Assigns **Standard Cleanup Crew** with a **Standard Garbage Truck**.
    5. Default (routine maintenance): Assigns **General Maintenance** with a **Light Pickup**.

### Deterministic Site Clearance Images

- **File**: `app/services/cleanup_images.py`
- **Purpose**:
  - Provides deterministic, category-specific cleanup proof images when field operations mark a report as resolved.
  - Supplies the municipal verification queue with photographic before/after comparisons so officers can audit site clearance.

### Email & Notification Services

- **Email Service** (`app/services/email.py`): Brevo REST API v3 wrapper for account activation tokens and password reset workflows.
- **Notification Service** (`app/services/notification.py`): Generates in-app notifications stored in the database for citizen updates and municipal alerts.

---

## Complete REST API Reference

All routes are prefixed with `/api/v1`.

### 1. Health (`/api/v1/health`)
- `GET /health`: Liveness probe returning service name, version, and ISO-8601 UTC timestamp.

### 2. Authentication (`/api/v1/auth`)
- `POST /auth/register`: Register new citizen or officer account.
- `POST /auth/login`: Authenticate credentials and receive JWT access token.
- `GET /auth/me`: Retrieve currently authenticated user profile.
- `POST /auth/verify-email`: Verify account using emailed verification token.
- `POST /auth/forgot-password`: Request a password-reset token via email.
- `POST /auth/reset-password`: Set new password using valid reset token.

### 3. Users (`/api/v1/users`)
- `GET /users/me`: Return current user profile details.
- `GET /users/{user_id}`: Retrieve specific user profile.
- `GET /users`: List users with pagination and role filters (Admin only).

### 4. Reports (`/api/v1/reports`)
- `POST /reports`: Submit a new waste complaint (photo, coordinates, optional address).
- `GET /reports`: List complaints with pagination and filtering (status, priority, date).
- `GET /reports/me`: List complaints filed by the authenticated user.
- `GET /reports/{report_id}`: Detailed complaint view with AI metrics and friendly `display_id`.
- `PATCH /reports/{report_id}`: Update complaint fields.
- `POST /reports/{report_id}/status`: Transition report lifecycle status.
- `POST /reports/{report_id}/assign`: Assign sanitation team and fleet vehicle.
- `POST /reports/{report_id}/resolve`: Resolve report with optional post-cleanup image.
- `POST /reports/{report_id}/analyze`: Trigger or re-run AI vision triage.
- `GET /reports/{report_id}/history`: Retrieve complete status transition audit log.

### 5. Teams (`/api/v1/teams`)
- `GET /teams/`: List all municipal sanitation teams and availability.
- `POST /teams/`: Register a new sanitation team.
- `GET /teams/{team_id}`: Retrieve specific team details.
- `PATCH /teams/{team_id}`: Update team status, capacity, or ward.

### 6. Vehicles (`/api/v1/vehicles`)
- `GET /vehicles/`: List all fleet vehicles and operational statuses.
- `POST /vehicles/`: Register a new fleet vehicle.
- `GET /vehicles/{vehicle_id}`: Retrieve vehicle telemetry and assignment status.
- `PATCH /vehicles/{vehicle_id}`: Update vehicle status or capacity.

### 7. Analytics (`/api/v1/analytics`)
- `GET /analytics/summary`: Aggregate KPIs (total reports, pending, resolved, active teams).
- `GET /analytics/fleet`: Fleet workload and crew deployment statistics.
- `GET /analytics/performance`: Resolution velocity and performance metrics.
- `GET /analytics/trends`: Temporal complaint volume trends over time.

### 8. Notifications (`/api/v1/notifications`)
- `GET /notifications`: Retrieve current user's in-app notification feed.
- `GET /notifications/unread-count`: Retrieve number of unread notifications.
- `PATCH /notifications/{notification_id}/read`: Mark specific notification as read.
- `POST /notifications/mark-all-read`: Mark all user notifications as read.

---

## Automated Testing Suite (210 Tests)

The backend test suite is built on `pytest` and `pytest-asyncio`. Tests utilize SQLite in-memory engines (`aiosqlite`) to guarantee isolated, lightning-fast execution.

### Running Tests

```powershell
# Run all 210 tests with concise summary
pytest -q

# Run with verbose output
pytest -v

# Run a specific test suite
pytest tests/test_reports.py -v
```

### Complete Test Suites Breakdown

| Test Suite | File | Tests | Validation Domain |
| :--- | :--- | :---: | :--- |
| **Reports Workflow** | `tests/test_reports.py` | 52 | Report creation, state transitions, timeline generation, permissions |
| **Database Models** | `tests/test_database.py` | 50 | SQLAlchemy models, UUID keys, relations, table constraints |
| **Authentication** | `tests/test_auth.py` | 40 | Registration, login, password hashing, JWT claims, role gates |
| **AI Vision Engine** | `tests/test_ai.py` | 23 | Groq vision client, prompt structure, JSON validation, heuristics |
| **Duplicate Detection** | `tests/test_duplicate_detection.py` | 12 | 0.001° bounding box (~111m), 48h temporal cutoff, waste type matching |
| **Health Probe** | `tests/test_health.py` | 9 | API uptime, service status, metadata response |
| **Analytics & KPIs** | `tests/test_analytics.py` | 8 | Real-time aggregation, SLA tracking, fleet workload metrics |
| **Notifications** | `tests/test_notifications.py` | 6 | In-app alerts, unread counts, status update notifications |
| **Fleet Management** | `tests/test_fleet.py` | 4 | Team/vehicle capacities, allocation states, availability updates |
| **CORS & Headers** | `tests/test_cors.py` | 3 | Allowed origins, preflight OPTIONS headers, security headers |
| **Dispatch Reassignment** | `tests/test_reassign.py` | 1 | Team/vehicle reassignment, conflict prevention, audit trail |
| **Fleet Seeding** | `tests/test_seed.py` | 1 | Seeding idempotency, initial records verification |
| **E2E Verification** | `tests/test_e2e_verification.py` | 1 | Full lifecycle: report → AI → assign → dispatch → verify |
| **Total Passing Tests** | | **210** | **100% Passing** |

---

## Security & RBAC Specifications

1. **Password Security**: Passwords are encrypted using `bcrypt` (pinned `bcrypt==4.0.1` for Python 3.12 compatibility) via `passlib`.
2. **Access Tokens**: Short-lived JSON Web Tokens signed with HMAC-SHA256 (`HS256`).
3. **Role-Based Authorization (`require_roles`)**:
   - `citizen`: Can create reports, view their own reports (`/reports/me`), update personal profile.
   - `municipal_officer`: Can view all reports, reassign crews, verify clearances, access analytics.
   - `driver`: Can view assigned routes and update operational field statuses.
   - `admin`: Full administrative access to users, teams, and vehicle registries.
4. **Data Sanitization**: Pydantic v2 models validate all incoming payload data types and schemas.
