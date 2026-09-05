# SwachhLens — Municipal Command & Operations Dashboard

> An enterprise-grade command portal for municipal sanitation directors, ward supervisors, and dispatch controllers. Built with React 19, Leaflet GIS mapping, and a bespoke "Liquid Glass" design system.

---

## Table of Contents

- [Executive Overview](#executive-overview)
- [Command Modules & Workflows](#command-modules--workflows)
  - [1. Executive Cockpit (`Dashboard.jsx`)](#1-executive-cockpit-dashboardjsx)
  - [2. Interactive GIS Waste Map (`WasteMap.jsx`)](#2-interactive-gis-waste-map-wastemapjsx)
  - [3. Complaints Registry & Triage (`Complaints.jsx`)](#3-complaints-registry--triage-complaintsjsx)
  - [4. Field Operations Management (`Operations.jsx`)](#4-field-operations-management-operationsjsx)
  - [5. Site Clearance Verification Queue (`Verification.jsx`)](#5-site-clearance-verification-queue-verificationjsx)
  - [6. Analytics & SLA Reporting (`Analytics.jsx`)](#6-analytics--sla-reporting-analyticsjsx)
- [Design Architecture: Liquid Glass System](#design-architecture-liquid-glass-system)
- [Directory Layout](#directory-layout)
- [Prerequisites & Package Inventory](#prerequisites--package-inventory)
- [Environment Configuration](#environment-configuration)
- [Development & Build Commands](#development--build-commands)
- [API Integration & Adapter Resilience](#api-integration--adapter-resilience)
- [Role-Based Access & Dispatch Controls](#role-based-access--dispatch-controls)

---

## Executive Overview

The **SwachhLens Municipal Dashboard** transforms raw citizen reports into actionable operational dispatches. Municipal authorities can monitor city-wide waste incidents on a real-time GIS map, leverage AI decision recommendations to dispatch the appropriate sanitation team and vehicle, track field operations, and audit site clearances before closing incidents.

---

## Command Modules & Workflows

### 1. Executive Cockpit (`Dashboard.jsx`)
- **Real-Time KPIs**: Live counters for Total Complaints, Pending AI Triage, Active Dispatches, and SLA Compliance rate.
- **Urgent Incident Alerts**: Surface high-severity or biohazardous incidents requiring immediate attention.
- **Fleet Readiness**: Summary of available vs dispatched municipal sanitation crews and vehicles.

### 2. Interactive GIS Waste Map (`WasteMap.jsx`)
- **Keyless OpenStreetMap Integration**: Standard OSM raster tiles with zero watermarks or third-party API key restrictions.
- **Severity-Coded Pin Clustering**:
  - Critical / High Severity: Biohazardous waste, overflowing commercial dumps.
  - Medium Severity: Large residential piles, construction debris.
  - Low Severity: Minor street litter, isolated plastic bottles.
- **Quick Dispatch Drawer**: Clicking any map marker opens an incident card with full AI metrics and one-click dispatch actions.

### 3. Complaints Registry & Triage (`Complaints.jsx` & `ComplaintDetails.jsx`)
- **Multi-Parameter Search & Filtering**:
  - Filter by friendly complaint ID (e.g., `SL-2026-9E3019`).
  - Filter by status: `AI Analyzed` (awaiting team assignment), `Assigned`, `In Progress`, `Completed`, `Verified`.
  - Filter by waste category (Plastic, Organic, Hazardous, Construction, etc.) and priority.
- **AI Decision Support Breakdown**:
  - Inspects AI volume assessment (`small`, `medium`, `large`, `very_large`).
  - Displays normalized severity rating (`0.0 – 10.0`).
  - Suggests recommended team type (e.g., *Hazardous Response Team*, *Heavy Cleanup Crew*) and vehicle type (*Hazmat Truck*, *Dump Truck*).
- **One-Click Dispatch Modal**: Assigns an available sanitation team and vehicle with automated priority calculation.

### 4. Field Operations Management (`Operations.jsx`)
- **Dispatched Crew Tracking**: Monitors in-progress municipal crews across city zones.
- **Operational State Transitions**: Allows field supervisors to advance complaints from `assigned` → `in_progress` → `completed`.
- **Telemetry & Notes**: Tracks driver arrival times, crew notes, and completion states.

### 5. Site Clearance Verification Queue (`Verification.jsx`)
- **Human-in-the-Loop Quality Assurance**: Municipal supervisors review photographic proof before complaints are officially marked `verified`.
- **Side-by-Side Photographic Audit**: Displays the citizen's initial report photo next to the crew's post-cleanup clearance photo.
- **Supervisor Actions**:
  - **Verify & Close**: Confirms site clearance, sends notification to the citizen, and archives the incident.
  - **Request Re-cleanup**: Sends incident back to the field crew with specific re-work instructions.

### 6. Analytics & SLA Reporting (`Analytics.jsx`)
- **Waste Trend Charts**: Incident volume trends over 7-day, 30-day, and quarterly intervals.
- **Category Composition**: Breakdown of waste types across municipal zones.
- **SLA Compliance Gauges**: Percentage of complaints resolved within designated SLA windows.
- **Instant CSV Export**: One-click data export generating formatted CSV reports for municipal council briefings.

---

## Design Architecture: Liquid Glass System

The dashboard utilizes a custom design language titled **Liquid Glass**:
- **Frosted Glassmorphism**: Semi-transparent card backdrops with backdrop blur filters (`backdrop-filter: blur(16px)`).
- **Ambient Lighting**: Floating blurred gradient nodes (`AmbientObjects.jsx`) that create depth without impacting DOM performance.
- **Tokenized Themes**: CSS variables define surface colors, accent rings, and elevation shadows for seamless Light and Dark mode transitions (`src/styles/variables.css` and `src/styles/themes.css`).
- **High-Density Typography**: Clear, readable typography designed for multi-monitor command center displays.

---

## Directory Layout

```
municipal-dashboard/
├── public/
│   ├── favicon.ico
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx     # Route security wrapper
│   │   ├── layout/
│   │   │   ├── AmbientObjects.jsx     # Floating glowing background elements
│   │   │   ├── AppBackground.jsx      # Gradient mesh background
│   │   │   ├── DashboardLayout.jsx    # Primary shell with sidebar and top navbar
│   │   │   ├── FloatingNavbar.jsx     # Top navigational header
│   │   │   ├── PageContainer.jsx      # Standard page content container
│   │   │   └── Sidebar.jsx            # Main navigational sidebar
│   │   ├── map/
│   │   │   └── InteractiveWasteMap.jsx# Leaflet OpenStreetMap interactive GIS view
│   │   └── ui/
│   │       ├── Badge.jsx              # Status and priority badges
│   │       ├── Button.jsx             # Glassmorphic button components
│   │       ├── Card.jsx               # Frosted glass card container
│   │       ├── EmptyState.jsx         # Fallback empty states
│   │       ├── GlassImage.jsx         # Responsive image container with loading states
│   │       ├── Input.jsx              # Form input elements
│   │       ├── KPICard.jsx            # Statistical KPI metric card
│   │       ├── Modal.jsx              # Dispatch and confirmation modals
│   │       ├── ProgressBar.jsx        # SLA progress bars
│   │       ├── Select.jsx             # Custom select dropdowns
│   │       ├── Table.jsx              # Data table with sorting and filtering
│   │       └── Timeline.jsx           # Incident audit timeline
│   ├── context/
│   │   ├── AppContext.jsx             # Active reports, fleet state, and filters
│   │   ├── AuthContext.jsx            # Municipal officer authentication & session
│   │   └── ThemeContext.jsx           # Dark / Light theme state
│   ├── data/                          # Standalone fallback seed data
│   ├── pages/
│   │   ├── Analytics.jsx              # Charts, trends, and CSV data export
│   │   ├── ComplaintDetails.jsx       # Detailed report view & crew dispatch
│   │   ├── Complaints.jsx             # Searchable complaint registry
│   │   ├── Dashboard.jsx              # Command overview & KPI cards
│   │   ├── Landing.jsx                # Public landing page
│   │   ├── Login.jsx                  # Municipal officer login
│   │   ├── Operations.jsx             # Active field crew management
│   │   ├── Verification.jsx           # Before/after photographic audit queue
│   │   └── WasteMap.jsx               # Full-screen GIS waste map
│   ├── services/
│   │   ├── analyticsAdapter.js        # KPI and trend data adapter
│   │   ├── api.js                     # REST API client with auth interceptors
│   │   ├── authService.js             # Authentication service
│   │   └── reportsAdapter.js          # API report transformer and fallback provider
│   ├── styles/
│   │   ├── index.css                  # Core CSS reset and typography
│   │   ├── themes.css                 # Dark and light mode color variables
│   │   └── variables.css              # Liquid Glass design tokens
│   ├── utils/
│   │   └── reportUtils.js             # Formatting and status helpers
│   ├── App.jsx                        # Application routes definition
│   └── main.jsx                       # Application entry point
├── package.json                       # Dependencies & scripts
├── vite.config.js                     # Vite 6 configuration
└── README.md                          # This documentation file
```

---

## Prerequisites & Package Inventory

- **Node.js**: Version `18.x` or `20.x` LTS.
- **npm**: Version `9.x` or higher.

### Key Packages

| Package | Version | Purpose |
| :--- | :---: | :--- |
| `react` / `react-dom` | `19.0.0` | Declarative UI framework |
| `vite` | `6.2.0` | Ultra-fast frontend development server |
| `leaflet` | `1.9.4` | Open-source interactive map library |
| `lucide-react` | `1.16.0` | SVG icons for command actions |
| `@react-oauth/google` | `0.13.5` | Google Single Sign-On integration (optional) |
| `clsx` | `2.1.1` | Conditional className utility |

---

## Environment Configuration

Create a `.env` file in the `municipal-dashboard/` directory:

```powershell
Copy-Item .env.example .env
```

### Environment Variables

```env
# Backend REST Gateway URL (FastAPI backend)
VITE_API_URL=http://localhost:8000/api/v1

# Optional Google OAuth 2.0 Client ID for Municipal SSO
VITE_GOOGLE_CLIENT_ID=
```

---

## Development & Build Commands

```powershell
# 1. Navigate to municipal-dashboard
cd C:\PROJECTS\SwachhLens\municipal-dashboard

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

The dashboard will be live at `http://localhost:3000` (or `http://localhost:5174`).

### Available Scripts

- `npm run dev`: Launches Vite local dev server with HMR.
- `npm run build`: Bundles the application into production assets in `dist/`.
- `npm run preview`: Locally previews the production build from `dist/`.

---

## API Integration & Adapter Resilience

The dashboard communicates with the FastAPI backend through dedicated adapters:
- `src/services/reportsAdapter.js`: Fetches reports from `GET /api/v1/reports`, normalizes status fields (mapping backend `analyzing` to `"AI Analyzed"`), formats GPS coordinates, and provides fallback offline data if the backend is unreachable.
- `src/services/analyticsAdapter.js`: Aggregates live report statuses into summary metrics (total complaints, resolution rate, average response hours).

---

## Role-Based Access & Dispatch Controls

- **Municipal Officer Access**: Officers can view all complaints, dispatch teams and vehicles, and verify photographic clearance evidence.
- **Display ID Formatting**: All complaint references across tables, maps, and modals use the standard identifier format: `SL-2026-XXXXXX`.
- **Status Progression**:
  `AI Analyzed` ➜ `Assigned` ➜ `In Progress` ➜ `Completed` ➜ `Verified`.
