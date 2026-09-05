# SwachhLens — Citizen Mobile Progressive Web Application

> A mobile-first Progressive Web Application (PWA) enabling everyday citizens to report civic waste within seconds, inspect instant AI classification metrics, and track transparent municipal cleanup resolution.

---

## Table of Contents

- [Overview & User Experience](#overview--user-experience)
- [Key Features](#key-features)
  - [Mobile-First PWA Architecture](#mobile-first-pwa-architecture)
  - [Camera Capture & Photo Handling](#camera-capture--photo-handling)
  - [Keyless Leaflet Map & Geolocation](#keyless-leaflet-map--geolocation)
  - [AI Classification & Severity Display](#ai-classification--severity-display)
  - [Civic Lifecycle Timeline](#civic-lifecycle-timeline)
  - [Site Clearance Verification & Confetti](#site-clearance-verification--confetti)
  - [Multilingual Localization (9 Languages)](#multilingual-localization-9-languages)
- [Directory Structure](#directory-structure)
- [Prerequisites & Dependencies](#prerequisites--dependencies)
- [Environment Configuration](#environment-configuration)
- [Installation & Development Scripts](#installation--development-scripts)
- [Production Build & PWA Validation](#production-build--pwa-validation)
- [Component Specifications & Design Patterns](#component-specifications--design-patterns)

---

## Overview & User Experience

The SwachhLens Citizen Mobile application puts civic responsibility into citizens' hands with zero friction. Whether walking down a neighborhood street or commuting, citizens can snap a photo of accumulated debris, verify their location on a map, and submit the complaint in three clicks.

The application delivers immediate transparency: the citizen watches the AI classify the waste, assign a severity rating, and follows the incident step-by-step through dispatch, field cleanup, and final verified clearance.

---

## Key Features

### Mobile-First PWA Architecture
- **PWA Service Worker**: Configured via `vite-plugin-pwa` with offline caching of static assets and app shell.
- **Installable**: Supports "Add to Home Screen" on iOS Safari and Android Chrome for an app-native experience.
- **Responsive Frame**: Uses `MobileContainer.tsx` to render a native smartphone viewport on desktop displays while occupying the full viewport on mobile devices.

### Camera Capture & Photo Handling
- **Hardware Integration** (`src/pages/Camera.tsx`): Integrates with device cameras via native MediaStream API, offering front/rear camera toggling, flash simulation, and photo capture.
- **Gallery Upload**: Fallback option allowing users to select pre-captured photos from their device photo library.
- **Real-Time Preview**: Immediate preview screen with retake and submit actions.

### Keyless Leaflet Map & Geolocation
- **Interactive Location Picker** (`src/components/MapLocationPicker.tsx`):
  - Standard OpenStreetMap raster tile layer (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
  - **Zero Watermarks / No API Key Required**: Operates entirely keyless with standard OpenStreetMap availability.
  - GPS hardware auto-detection via `navigator.geolocation` with pinpoint draggable marker for manual location tuning.
  - Reverse geocoded address display reflecting street and neighborhood names.

### AI Classification & Severity Display
- **AI Result Card** (`src/components/AIResultCard.tsx`):
  - Displays detected waste category (e.g., Plastic, Organic, Construction, Biohazard).
  - Estimated volume level (`small`, `medium`, `large`, `very_large`).
  - **Normalized Severity Score**: Automatically normalizes backend raw scores (`0.0 – 100.0`) to a clean `0.0 – 10.0` decimal display (e.g., `6.5 / 10`) with color-coded severity tiers (Low, Medium, High, Critical).
  - **Accurate Status Mapping**: Reports in the backend `analyzing` state are accurately rendered as `"AI Analyzed"` / awaiting team assignment to prevent citizen confusion.

### Civic Lifecycle Timeline
- **Step-by-Step Tracker** (`src/components/Timeline.tsx`):
  - Visually maps the critical stages of civic resolution:
    1. **Submitted**: Complaint recorded with timestamp and GPS.
    2. **AI Analyzed**: Multimodal AI triaged volume and severity.
    3. **Team Assigned**: Sanitation crew and vehicle dispatched.
    4. **In Progress**: Crew actively working on site.
    5. **Verified**: Municipal supervisor approved photographic proof of clearance.

### Site Clearance Verification & Confetti
- **Clearance Evidence** (`src/components/VerificationCard.tsx`):
  - Presents side-by-side photographic proof comparing the initial report image with the verified post-cleanup image.
  - Celebratory confetti animation (`canvas-confetti`) when viewing a successfully cleared site.

### Multilingual Localization (9 Languages)
- Powered by `i18next` and `react-i18next` (`src/i18n/locales/`):
  - English (`en`)
  - Hindi (`hi` — हिन्दी)
  - Tamil (`ta` — தமிழ்)
  - Telugu (`te` — తెలుగు)
  - Kannada (`kn` — ಕನ್ನಡ)
  - Malayalam (`ml` — മലയാളം)
  - Marathi (`mr` — मराठी)
  - Bengali (`bn` — বাংলা)
  - Gujarati (`gu` — ગુજરાતી)
- Dynamic in-app language switcher modal without requiring a page refresh.

---

## Directory Structure

```
citizen-mobile/
├── public/
│   ├── favicon.ico
│   ├── manifest.json                  # PWA Web App Manifest
│   └── pwa-icon.png
├── src/
│   ├── assets/                        # Hero images and branding assets
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx          # Mobile navigation bar (Home, Report, History, Profile)
│   │   │   ├── MobileContainer.tsx    # Responsive smartphone chassis wrapper
│   │   │   ├── NatureBackground.tsx   # Ambient civic-themed backdrop
│   │   │   ├── ProtectedRoute.tsx     # Authentication guard
│   │   │   └── TopHeader.tsx          # App header with language selector
│   │   ├── ui/
│   │   │   ├── LanguageModal.tsx      # Language selector modal dialog
│   │   │   ├── PriorityBadge.tsx      # Low / Med / High / Critical badges
│   │   │   └── StatusBadge.tsx        # Dynamic report state badges
│   │   ├── AIResultCard.tsx           # AI metrics & normalized 0-10 severity
│   │   ├── DecisionCard.tsx           # AI recommendation summary
│   │   ├── LocationCard.tsx           # GPS coordinates and address display
│   │   ├── MapLocationPicker.tsx      # Leaflet OpenStreetMap coordinate selector
│   │   ├── ReportCard.tsx             # List view card for citizen reports
│   │   ├── Timeline.tsx               # Progress timeline component
│   │   └── VerificationCard.tsx       # Before/after cleanup image comparison
│   ├── config/
│   │   └── config.ts                  # API base URL and runtime flags
│   ├── context/
│   │   ├── AuthContext.tsx            # User session, login, signup, token storage
│   │   ├── LanguageContext.tsx        # i18n locale switching and persistence
│   │   └── ThemeContext.tsx           # Dark mode / Light mode toggle
│   ├── i18n/
│   │   ├── locales/                   # Translations: en, hi, ta, te, kn, ml, mr, bn, gu
│   │   └── index.ts                   # i18next initialization
│   ├── pages/
│   │   ├── Camera.tsx                 # Hardware camera capture view
│   │   ├── Home.tsx                   # Citizen dashboard with quick report button
│   │   ├── Login.tsx                  # Citizen login form
│   │   ├── Register.tsx               # Citizen registration form
│   │   ├── ReportWaste.tsx            # Main report submission workflow
│   │   ├── Preview.tsx                # Image confirmation & location review
│   │   ├── Analyzing.tsx              # Animated AI processing view
│   │   ├── Result.tsx                 # Post-submission AI verdict page
│   │   ├── Reports.tsx                # List of user's submitted reports
│   │   ├── ReportDetails.tsx          # Comprehensive incident details & timeline
│   │   ├── Notifications.tsx          # Civic update alert notifications
│   │   └── Profile.tsx                # User account settings & language choices
│   ├── services/
│   │   ├── api.ts                     # Axios REST client with bearer token interceptors
│   │   ├── cameraService.ts           # MediaDevices API wrapper
│   │   ├── locationService.ts         # Geolocation & reverse geocoding client
│   │   └── notificationService.ts     # In-app notification polling
│   ├── types/
│   │   ├── api.ts                     # REST response contracts
│   │   ├── report.ts                  # Report, status history, and AI triage types
│   │   └── user.ts                    # User session and role types
│   ├── utils/
│   │   └── reportUtils.ts             # Display ID generator & severity normalizer
│   ├── App.tsx                        # React Router v7 routes definition
│   ├── index.css                      # Tailwind CSS v4 directives
│   └── main.tsx                       # Root React DOM bootstrap
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript compiler configuration
├── vite.config.ts                     # Vite 8 & vite-plugin-pwa configuration
└── README.md                          # This documentation file
```

---

## Prerequisites & Dependencies

- **Node.js**: Version `18.x` or `20.x` LTS.
- **npm**: Version `9.x` or higher.
- **Modern Browser**: Chrome, Edge, Safari, or Firefox with Geolocation and Camera permissions enabled.

### Core Package Versions

| Package | Version | Purpose |
| :--- | :---: | :--- |
| `react` / `react-dom` | `19.2.8` | Next-generation React library |
| `vite` | `8.2.0` | Ultra-fast development server and build tool |
| `tailwindcss` | `4.3.3` | Utility-first styling engine |
| `typescript` | `~6.0.2` | Typed language layer |
| `react-router-dom` | `7.18.2` | Client-side routing |
| `leaflet` | `1.9.4` | Open-source mobile-friendly interactive maps |
| `i18next` | `26.3.6` | Internationalization framework |
| `vite-plugin-pwa` | `1.3.0` | Zero-config PWA plugin for Vite |
| `lucide-react` | `1.32.0` | Modern SVG iconography |
| `canvas-confetti` | `1.9.4` | Canvas confetti particle animation |

---

## Environment Configuration

Create a `.env` file in the `citizen-mobile/` directory:

```powershell
Copy-Item .env.example .env
```

### Environment Variables

```env
# Backend REST Gateway URL (FastAPI backend)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Set to false to interact with the live backend API.
# Set to true for standalone offline demo mode with mock data.
VITE_USE_MOCK_API=false
```

---

## Installation & Development Scripts

```powershell
# 1. Navigate to citizen-mobile
cd C:\PROJECTS\SwachhLens\citizen-mobile

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

The application will start at `http://localhost:5173`.

### Available Scripts

- `npm run dev`: Starts Vite local development server with Hot Module Replacement (HMR).
- `npm run build`: Runs TypeScript project reference typecheck (`tsc -b`) followed by optimized production bundle creation (`vite build`).
- `npm run lint`: Fast linting using `oxlint`.
- `npm run preview`: Locally previews the production build output from `dist/`.

---

## Production Build & PWA Validation

To generate an optimized production bundle:

```powershell
npm run build
```

This generates:
- Bundled, minified JavaScript and CSS in `dist/`.
- Optimized PWA manifest (`dist/manifest.webmanifest`).
- Compiled Service Worker (`dist/sw.js`) for asset caching.

---

## Component Specifications & Design Patterns

### 1. Friendly Report ID Presentation
Reports carry a system UUID in the database, but are displayed to citizens in a human-friendly format:
```
SL-2026-9E3019
```
Formatted via `formatFriendlyId(report.display_id || report.id)` in `src/utils/reportUtils.ts`.

### 2. Normalized Severity Score (0.0 to 10.0)
The backend AI evaluates waste on a continuous `0.0 – 100.0` scale. `AIResultCard.tsx` automatically normalizes scores to a single-decimal 10-point scale:
- `score > 10 ? (score / 10).toFixed(1) : score.toFixed(1)`
- Result: Clean presentation such as `6.5 / 10`.

### 3. "AI Analyzed" Status Display
When a report is processed by the AI pipeline, its backend status is `analyzing`. In the citizen UI, `StatusBadge.tsx` renders this state as:
- **Badge Text**: `"AI Analyzed"`
- **Subtext**: `"Analysis complete — awaiting municipal team assignment"`
This conveys that AI processing has finished and the incident is ready for crew assignment.
