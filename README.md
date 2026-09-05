# SwachhLens — AI-Powered Civic Waste Response Decision Support System

> A production-grade civic intelligence and waste management platform closing the feedback loop between everyday citizens and municipal sanitation authorities through mobile reporting, Vision AI classification, geospatial duplicate detection, rule-based fleet dispatch, and site clearance audit workflows.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [System Architecture](#system-architecture)
- [End-to-End Report Lifecycle](#end-to-end-report-lifecycle)
- [Repository Structure](#repository-structure)
- [Technology Stack Matrix](#technology-stack-matrix)
- [Quickstart & Local Setup](#quickstart--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend API & AI Engine](#1-backend-api--ai-engine)
  - [2. Citizen Mobile PWA](#2-citizen-mobile-pwa)
  - [3. Municipal Command Dashboard](#3-municipal-command-dashboard)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Verification & Automated Test Suite](#verification--automated-test-suite)
- [Security, Privacy & Reliability](#security-privacy--reliability)
- [Project Heritage](#project-heritage)

---

## Executive Summary

Urban civic waste management frequently suffers from three structural bottlenecks:
1. **Reporting Friction**: Citizens lack accessible, multilingual channels to document waste with accurate geolocations.
2. **Triage Latency**: Municipal departments are inundated with ambiguous reports, duplicates, and unclassified complaints, creating decision paralysis.
3. **Accountability Gaps**: Citizens rarely receive transparent, photographic confirmation when complaints are resolved.

**SwachhLens** solves these challenges through a unified three-tier ecosystem:
- **Citizen Mobile PWA**: An installable, offline-resilient reporting application offering camera capture, interactive GPS pin-drop, 9-language multilingual support, and real-time resolution timelines.
- **Backend API & Decision Engine**: A high-performance FastAPI asynchronous backend integrating Groq Qwen Vision AI for automated waste classification, spatial clustering for duplicate suppression, and automated fleet matching.
- **Municipal Command Dashboard**: An executive desktop cockpit built with Liquid Glass design language, delivering live GIS mapping, SLA tracking, one-click crew dispatch, and photographic site clearance verification.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Citizens["Citizen Tier"]
        Mobile["Citizen Mobile PWA\n(React 19, Vite 8, Tailwind v4, PWA)\n• Camera Upload & Geolocation\n• 9 Indic Languages (i18next)\n• Status Timeline & Before/After Proof"]
    end

    subgraph Municipal["Municipal Tier"]
        Dashboard["Municipal Command Dashboard\n(React 19, Vite 6, Leaflet, Liquid Glass)\n• Live GIS Waste Incident Map\n• Automated Triage & SLA Tracking\n• Dispatch Operations & Verification Queue"]
    end

    subgraph Gateway["Application Layer (FastAPI)"]
        API["FastAPI 0.115.5 Async REST Gateway\n(run_server.py / port 8000)"]
        Auth["JWT & Role-Based Auth\n(Citizen, Officer, Admin, Driver)"]
        Geo["Nominatim Reverse Geocoder\n(2s Timeout + Coordinate Fallback)"]
        Dup["Geospatial Duplicate Detector\n(0.001 deg ~111m + 48h Window)"]
        Engine["Rule-Based Decision Engine\n(Team & Vehicle Recommendation)"]
        CleanImg["Deterministic Clearance Resolver\n(Photographic Audit Matching)"]
    end

    subgraph AI["Intelligence Tier"]
        VisionAI["Groq Vision Engine\n(qwen/qwen3.6-27b)\n• Waste Type, Volume & Severity\n• Heuristic / Offline Fallback"]
    end

    subgraph Persistence["Storage & Messaging Tier"]
        DB[(PostgreSQL / Supabase\nSQLAlchemy 2.0 Async + Alembic)]
        Email["Brevo Transactional Email\n(Verification & Password Reset)"]
    end

    Mobile -->|"1. Submit Report (Photo + GPS)"| API
    Dashboard -->|"Dispatch / Verify / Triage"| API
    API --> Auth
    API --> Geo
    API --> VisionAI
    API --> Dup
    API --> Engine
    API --> CleanImg
    API --> DB
    API --> Email
```

---

## End-to-End Report Lifecycle

Every incident reported through SwachhLens undergoes a rigorous, transparent state machine:

```mermaid
stateDiagram-v2
    [*] --> Pending: Citizen submits photo & GPS
    Pending --> Analyzing: Reverse geocoded & AI vision queued
    Analyzing --> Assigned: AI classified (Severity 0-10, Waste Type) & awaiting crew
    Assigned --> In_Progress: Municipal supervisor dispatches crew & vehicle
    In_Progress --> Completed: Sanitation crew completes site cleanup
    Completed --> Verified: Municipal officer audits before/after photo evidence
    Verified --> [*]: Citizen notified & case closed

    Pending --> Duplicate: Proximity match (within ~111m, <48h)
    Duplicate --> [*]: Flagged as duplicate
```

1. **Submission (`pending`)**: The citizen captures a live photo and verifies coordinates via the interactive OpenStreetMap picker. Coordinates are reverse-geocoded via OpenStreetMap Nominatim with a strict 2-second timeout; if the lookup times out or encounters a network error, formatted GPS coordinates are preserved so report creation is never blocked.
2. **AI Analysis (`analyzing`)**: The backend analyzes the image via Groq Vision AI (`qwen/qwen3.6-27b`) to determine waste category, volume level (`small`, `medium`, `large`, `very_large`), and continuous severity score (`0.0 – 100.0`). In the frontend UIs, this state is rendered as `"AI Analyzed"` / awaiting team assignment.
3. **Duplicate Detection**: The incident is cross-referenced against active, non-duplicate reports within the last 48 hours and within a `0.001°` bounding box (~111 meters). If a match with compatible waste type is detected, the report is marked as a duplicate.
4. **Municipal Assignment (`assigned`)**: The rule-based decision engine evaluates severity, volume, and hazard flags to recommend optimal team composition (e.g., *Hazardous Response Team*, *Heavy Cleanup Crew*, *Standard Cleanup Crew*) and vehicle requirements (*Hazmat Truck*, *Dump Truck*, *Standard Garbage Truck*).
5. **Field Operations (`in_progress`)**: The assigned crew is mobilized to the target coordinates with turn-by-turn routing data.
6. **Remediation & Closure (`completed`)**: The field team clears the waste and submits digital proof of clearance.
7. **Verification & Audit (`verified`)**: The municipal supervisor reviews side-by-side before-and-after imagery in the verification queue. Once approved, the incident is closed and the citizen receives visual proof of resolution.

---

## Repository Structure

```
C:\PROJECTS\SwachhLens\
├── backend/                             # Core FastAPI Async Service
│   ├── alembic/                         # Database schema migrations
│   │   ├── versions/                    # 0001_initial, 0002_auth, 0003_notifications
│   │   ├── env.py                       # Migration runtime harness
│   │   └── README                       # Alembic migration manual
│   ├── app/
│   │   ├── api/v1/                      # REST endpoints (health, auth, reports, teams, vehicles, etc.)
│   │   ├── core/                        # Configuration, security (JWT, bcrypt), logging
│   │   ├── db/                          # Async SQLAlchemy session and base models
│   │   ├── models/                      # ORM entities (User, Report, Team, Vehicle, Notification)
│   │   ├── schemas/                     # Pydantic validation models
│   │   └── services/                    # Vision AI, geocoding, duplicate filter, decision engine
│   ├── scripts/
│   │   └── seed_fleet.py                # Municipal teams & vehicles initialization script
│   ├── tests/                           # 13 test suites (210 passing tests)
│   ├── run_server.py                    # Production server bootstrap runner
│   ├── requirements.txt                 # Pinned Python dependencies
│   └── README.md                        # Dedicated backend developer manual
│
├── citizen-mobile/                      # Citizen-facing Mobile PWA
│   ├── src/
│   │   ├── components/                  # AIResultCard, Timeline, MapLocationPicker, VerificationCard
│   │   ├── context/                     # AuthContext, LanguageContext, ThemeContext
│   │   ├── i18n/                        # 9 Indic language translation files (locales/)
│   │   ├── pages/                       # Camera, ReportWaste, Reports, ReportDetails, Profile
│   │   └── services/                    # REST API client and hardware integration
│   ├── package.json                     # Dependencies: React 19, Vite 8, Tailwind v4
│   └── README.md                        # Dedicated citizen mobile manual
│
├── municipal-dashboard/                 # Municipal Authority Command Center
│   ├── src/
│   │   ├── components/                  # InteractiveWasteMap, KPI cards, modal dialogues
│   │   ├── context/                     # AppContext, AuthContext, ThemeContext
│   │   ├── pages/                       # Dashboard, WasteMap, Complaints, Operations, Verification, Analytics
│   │   ├── services/                    # API adapters and data normalizers
│   │   └── styles/                      # Liquid Glass CSS design tokens & themes
│   ├── package.json                     # Dependencies: React 19, Vite 6, Leaflet
│   └── README.md                        # Dedicated municipal dashboard manual
│
├── .gitignore                           # Repository-wide ignore rules
└── README.md                            # Master platform documentation (this file)
```

---

## Technology Stack Matrix

| Subsystem | Layer | Technology | Version | Key Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | Framework | FastAPI | 0.115.5 | High-throughput asynchronous REST gateway |
| | ASGI Server | Uvicorn | 0.32.1 | High-concurrency ASGI web server |
| | Language | Python | 3.12+ | Typed execution environment (do not use 3.14) |
| | ORM | SQLAlchemy | 2.0.36 | Fully asynchronous database queries |
| | Driver | psycopg (psycopg3) | 3.2.3 | PostgreSQL binary async connection driver |
| | Migrations | Alembic | 1.14.0 | Schema versioning & continuous migrations |
| | Database | PostgreSQL | 14+ / Supabase | Relational data persistence with geospatial indexing |
| | Vision AI | Groq API | qwen/qwen3.6-27b | Low-latency multimodal waste classification & volume |
| | Reverse Geocoding | OSM Nominatim | Public API | 2-second timeout lookup with coordinate fallback |
| | Email | Brevo | 7.6.0 (SDK) | Citizen verification and password reset transactional emails |
| | Quality Assurance | Pytest & pytest-asyncio | 8.3.4 / 0.24.0 | 13 test suites, 210 passing automated tests |
| **Citizen Mobile** | Framework | React | 19.2.8 | Declarative reactive UI rendering |
| | Bundler | Vite | 8.2.0 | Next-generation frontend build tooling |
| | Styling | Tailwind CSS | 4.3.3 | High-performance utility-first styling |
| | PWA | vite-plugin-pwa | 1.3.0 | Service worker caching, manifest & offline readiness |
| | Multilingual | i18next | 26.3.6 | 9-language internationalization framework |
| | Mapping | Leaflet | 1.9.4 | Standard OpenStreetMap tiles (keyless / no watermarks) |
| | Icons | Lucide React | 1.32.0 | Consistent SVG iconography |
| **Municipal Dashboard** | Framework | React | 19.0.0 | High-density administrative interface |
| | Bundler | Vite | 6.2.0 | Instant HMR development server |
| | Design System | Liquid Glass | Custom CSS | Frosted glassmorphism, tokenized themes, dark/light mode |
| | GIS Mapping | Leaflet & OSM | 1.9.4 | Real-time incident pins, cluster inspection, dispatch |
| | Icons | Lucide React | 1.16.0 | Operational action iconography |

---

## Quickstart & Local Setup

### Prerequisites

- **Python**: `3.12.x` (Recommended: Python 3.12. Do NOT use 3.14 due to binary package dependencies).
- **Node.js**: `18.x` or `20.x` LTS.
- **PostgreSQL**: PostgreSQL 14+ instance locally or a cloud database via Supabase.

---

### 1. Backend API & AI Engine

```powershell
# Navigate to backend directory
cd C:\PROJECTS\SwachhLens\backend

# Create and activate Python 3.12 virtual environment
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install pinned dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment variables
Copy-Item .env.example .env
# Edit .env with your PostgreSQL credentials and API keys

# Apply database migrations to head
alembic upgrade head

# Seed initial municipal teams and vehicle fleet
python scripts\seed_fleet.py

# Launch the FastAPI development server
python run_server.py
```
The API gateway will be live at `http://localhost:8000`. Interactive documentation is available at `http://localhost:8000/docs`.

---

### 2. Citizen Mobile PWA

```powershell
# Open a new terminal and navigate to citizen-mobile
cd C:\PROJECTS\SwachhLens\citizen-mobile

# Configure environment variables
Copy-Item .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000/api/v1
# Set VITE_USE_MOCK_API=false (to interact with real backend)

# Install npm dependencies
npm install

# Start development server
npm run dev
```
The Citizen Mobile PWA will be live at `http://localhost:5173`.

---

### 3. Municipal Command Dashboard

```powershell
# Open a new terminal and navigate to municipal-dashboard
cd C:\PROJECTS\SwachhLens\municipal-dashboard

# Configure environment variables
Copy-Item .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1

# Install npm dependencies
npm install

# Start development server
npm run dev
```
The Municipal Command Dashboard will be live at `http://localhost:3000` (or `http://localhost:5174`).

---

## Environment Variables Configuration

All configuration is managed via `.env` files. Ensure you copy the `.env.example` templates in each folder.

### Backend (`backend/.env`)

```env
# Application
APP_NAME="SwachhLens API"
APP_VERSION="0.1.0"
DEBUG=false
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173

# Database (PostgreSQL / Supabase async connection)
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/swachlens

# Security & Tokens
JWT_SECRET_KEY=generate_a_minimum_32_char_cryptographically_secure_random_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EMAIL_VERIFICATION_EXPIRE_HOURS=24
PASSWORD_RESET_EXPIRE_MINUTES=30

# Vision AI Engine (Groq)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.6-27b
GROQ_TIMEOUT=30

# Transactional Email (Brevo)
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=notifications@yourdomain.com
BREVO_SENDER_NAME=SwachhLens
FRONTEND_BASE_URL=http://localhost:3000
```

### Citizen Mobile (`citizen-mobile/.env`)

```env
# Backend REST Gateway URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Toggle backend connectivity vs offline standalone demo mode
VITE_USE_MOCK_API=false
```

### Municipal Dashboard (`municipal-dashboard/.env`)

```env
# Backend REST Gateway URL
VITE_API_URL=http://localhost:8000/api/v1

# Optional Google OAuth 2.0 Client ID for Municipal SSO
VITE_GOOGLE_CLIENT_ID=
```

---

## Verification & Automated Test Suite

SwachhLens maintains an automated testing harness across 13 test suites totaling 210 passing tests:

```powershell
# From the backend directory with active virtual environment:
pytest -v
```

### Test Suite Distribution (210 Passing Tests)

| Test Module | File | Tests | Validation Domain |
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
| **Total** | | **210** | **100% Passing** |

---

## Security, Privacy & Reliability

- **Fail-Safe Geocoding**: Geocoding requests to OpenStreetMap Nominatim enforce a 2-second timeout and custom User-Agent. Any exception or timeout falls back immediately to formatted coordinate notation (`{lat:.5f}°, {lon:.5f}°`), ensuring report submission never fails.
- **Zero Raw Secret Exposure**: All production tokens, API keys, and database passwords are isolated in `.env` files excluded by `.gitignore`.
- **Role-Based Access Control (RBAC)**: Fine-grained authorization guards sensitive municipal routes (`require_roles("municipal_officer", "admin")`); only authorized municipal personnel can dispatch crews or verify clearances.
- **Human-in-the-Loop Verification**: AI classifications act as decision support. Final site clearance verification remains in the hands of municipal supervisors using photographic before-and-after proof.

---

## Project Heritage

SwachhLens was crafted by an integrated engineering team:
- **Citizen Mobile PWA**: Built and designed by **Kavin** (`kavin/citizen-mobile`).
- **Municipal Command Dashboard**: Built and designed by **Nakul** (`nakul/municipal-dashboard`).
- **FastAPI Core, Vision AI Pipeline & Full-Stack Integration**: Architected and finalized by **Venky** (`venky/backend-ai`).

*The integrated codebase in this repository represents the finalized, production-ready source of truth.*
