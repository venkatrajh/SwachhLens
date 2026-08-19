import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ambient Municipal Scene
 * High-definition architectural vector silhouettes representing the municipal waste management ecosystem.
 * Dynamically reacts to the active theme:
 * - Dark Mode:  Midnight Charcoal / Graphite body with PURPLE rim lighting (#A78BFA)
 * - Light Mode: Soft Gray / Graphite body with ROSE rim lighting (#F43F5E)
 */

// 1. Municipal Waste Compactor Truck (Semi-realistic Isometric Silhouette)
const MunicipalTruck = ({ style = {}, isForeground = false }) => (
  <svg
    viewBox="0 0 380 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      width: '420px',
      height: '220px',
      filter: isForeground ? 'drop-shadow(0 8px 24px var(--ambient-object-shadow)) blur(1px)' : 'drop-shadow(0 8px 30px var(--ambient-object-shadow)) blur(3px)',
      ...style
    }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="truckBodyDynamic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--obj-fill)" />
        <stop offset="60%" stopColor="var(--obj-fill-subtle)" />
        <stop offset="100%" stopColor="var(--obj-fill)" />
      </linearGradient>
      <linearGradient id="themeRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--ambient-object-light)" stopOpacity="0.9" />
        <stop offset="70%" stopColor="var(--ambient-object-light)" stopOpacity="0.4" />
        <stop offset="100%" stopColor="var(--ambient-object-light)" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Cabin Structure */}
    <path
      d="M245 60 H310 L345 110 V155 H245 V60 Z"
      fill="url(#truckBodyDynamic)"
      stroke="var(--obj-stroke)"
      strokeWidth="1.8"
    />
    {/* Windshield Glass */}
    <path
      d="M285 70 H308 L334 105 H285 V70 Z"
      fill="var(--accent-subtle)"
      stroke="var(--ambient-object-light)"
      strokeWidth="1.2"
    />
    {/* Cabin Door & Handle */}
    <rect x="254" y="80" width="24" height="42" rx="3" fill="none" stroke="var(--obj-stroke)" strokeWidth="1.2" />
    <line x1="258" y1="102" x2="266" y2="102" stroke="var(--ambient-object-light)" strokeWidth="1.5" />

    {/* Compactor Container Body */}
    <path
      d="M35 50 H240 V155 H35 L20 125 V75 L35 50 Z"
      fill="url(#truckBodyDynamic)"
      stroke="var(--obj-stroke)"
      strokeWidth="1.8"
    />
    {/* Hydraulic Compactor Ribs */}
    <path d="M85 55 V150" stroke="var(--obj-stroke)" strokeWidth="1.5" strokeDasharray="6 4" />
    <path d="M135 55 V150" stroke="var(--obj-stroke)" strokeWidth="1.5" strokeDasharray="6 4" />
    <path d="M185 55 V150" stroke="var(--obj-stroke)" strokeWidth="1.5" strokeDasharray="6 4" />

    {/* Dynamic Theme Rim Light Accents */}
    <path
      d="M25 50 H240 L310 60 L345 110"
      stroke="url(#themeRimGrad)"
      strokeWidth="2.5"
    />

    {/* Heavy Chassis Frame */}
    <rect x="20" y="152" width="335" height="10" rx="2" fill="var(--obj-stroke)" opacity="0.6" />

    {/* Heavy Duty Wheels */}
    <g transform="translate(75, 160)">
      <circle cx="0" cy="0" r="26" fill="var(--bg-secondary)" stroke="var(--obj-stroke)" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="14" fill="none" stroke="var(--ambient-object-light)" strokeWidth="2" strokeOpacity="0.85" />
      <circle cx="0" cy="0" r="5" fill="var(--obj-stroke)" />
    </g>
    <g transform="translate(185, 160)">
      <circle cx="0" cy="0" r="26" fill="var(--bg-secondary)" stroke="var(--obj-stroke)" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="14" fill="none" stroke="var(--ambient-object-light)" strokeWidth="2" strokeOpacity="0.85" />
      <circle cx="0" cy="0" r="5" fill="var(--obj-stroke)" />
    </g>
    <g transform="translate(295, 160)">
      <circle cx="0" cy="0" r="26" fill="var(--bg-secondary)" stroke="var(--obj-stroke)" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="14" fill="none" stroke="var(--ambient-object-light)" strokeWidth="2" strokeOpacity="0.85" />
      <circle cx="0" cy="0" r="5" fill="var(--obj-stroke)" />
    </g>

    {/* SwachhLens Municipal Leaf Emblem */}
    <circle cx="135" cy="100" r="18" fill="none" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.75" />
    <path d="M135 90 C145 95 145 108 135 110 C125 108 125 95 135 90 Z" fill="var(--accent-subtle)" stroke="var(--ambient-object-light)" strokeWidth="1.2" />
  </svg>
);

// 2. Street Sanitation Sweeper Vehicle
const StreetSweeper = ({ style = {} }) => (
  <svg
    viewBox="0 0 320 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '340px', height: '190px', filter: 'drop-shadow(0 6px 20px var(--ambient-object-shadow)) blur(2px)', ...style }}
    aria-hidden="true"
  >
    {/* Cabin & Sweeper Body */}
    <path d="M190 60 H250 L275 100 V140 H190 V60 Z" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.6" />
    <path d="M40 70 H185 V140 H40 L25 115 V85 Z" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.6" />
    {/* Rotary Brush Mechanism */}
    <circle cx="270" cy="148" r="16" fill="var(--accent-subtle)" stroke="var(--ambient-object-light)" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="270" y1="132" x2="270" y2="164" stroke="var(--ambient-object-light)" strokeWidth="1.5" />
    {/* Wheels */}
    <circle cx="90" cy="144" r="20" fill="var(--bg-secondary)" stroke="var(--obj-stroke)" strokeWidth="2" />
    <circle cx="210" cy="144" r="20" fill="var(--bg-secondary)" stroke="var(--obj-stroke)" strokeWidth="2" />
    <path d="M35 70 H185 L250 60" stroke="var(--ambient-object-light)" strokeWidth="2" strokeOpacity="0.85" />
  </svg>
);

// 3. Smart Waste Bin with Sensor Telemetry
const SmartWasteBin = ({ style = {}, isForeground = false }) => (
  <svg
    viewBox="0 0 180 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      width: '200px',
      height: '260px',
      filter: isForeground ? 'drop-shadow(0 6px 20px var(--ambient-object-shadow)) blur(1px)' : 'drop-shadow(0 8px 24px var(--ambient-object-shadow)) blur(2px)',
      ...style
    }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bin3DDynamic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--obj-fill)" />
        <stop offset="100%" stopColor="var(--obj-fill-subtle)" />
      </linearGradient>
    </defs>
    {/* Sensor Beacon / Solar Cap */}
    <ellipse cx="90" cy="35" rx="14" ry="7" fill="var(--accent-subtle)" stroke="var(--ambient-object-light)" strokeWidth="1.8" />
    <line x1="90" y1="28" x2="90" y2="18" stroke="var(--ambient-object-light)" strokeWidth="2" />
    <circle cx="90" cy="16" r="3.5" fill="var(--ambient-object-light)" />

    {/* Solar Lid Contour */}
    <path
      d="M35 50 L90 35 L145 50 L90 65 Z"
      fill="url(#bin3DDynamic)"
      stroke="var(--ambient-object-light)"
      strokeWidth="1.8"
    />

    {/* Tapered Container Body */}
    <path
      d="M40 60 L50 200 L130 200 L140 60 Z"
      fill="url(#bin3DDynamic)"
      stroke="var(--obj-stroke)"
      strokeWidth="1.8"
    />

    {/* Ultrasonic Fill-Level Lines */}
    <path d="M54 110 H126" stroke="var(--ambient-object-light)" strokeWidth="1.8" strokeDasharray="4 3" />
    <path d="M57 140 H123" stroke="var(--ambient-object-light)" strokeWidth="1.8" strokeOpacity="0.7" strokeDasharray="4 3" />
    <path d="M60 170 H120" stroke="var(--ambient-object-light)" strokeWidth="1.8" strokeOpacity="0.4" strokeDasharray="4 3" />

    {/* Front Sensor Screen Display */}
    <rect x="75" y="75" width="30" height="18" rx="3" fill="var(--bg-secondary)" stroke="var(--ambient-object-light)" strokeWidth="1.2" />
    <text x="90" y="88" fill="var(--ambient-object-light)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">84%</text>

    {/* Recycling Emblem */}
    <g transform="translate(90, 125) scale(0.6)">
      <path d="M0 -18 L15 8 H-15 Z" fill="none" stroke="var(--obj-stroke)" strokeWidth="2.5" />
    </g>
  </svg>
);

// 4. Urban Skyline & Architectural Towers
const CitySkyline = ({ style = {} }) => (
  <svg
    viewBox="0 0 600 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '700px', height: '280px', filter: 'drop-shadow(0 10px 30px var(--ambient-object-shadow)) blur(4px)', ...style }}
    aria-hidden="true"
  >
    {/* Towers & Grid Infrastructure */}
    <rect x="30" y="80" width="70" height="160" rx="2" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.5" />
    <rect x="115" y="45" width="85" height="195" rx="2" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.5" />
    <line x1="157" y1="45" x2="157" y2="15" stroke="var(--ambient-object-light)" strokeWidth="2" />
    <circle cx="157" cy="13" r="3" fill="var(--ambient-object-light)" />

    <rect x="215" y="100" width="65" height="140" rx="2" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.5" />
    
    <rect x="295" y="30" width="95" height="210" rx="2" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.5" />
    <line x1="342" y1="30" x2="342" y2="5" stroke="var(--ambient-object-light)" strokeWidth="2" />
    <circle cx="342" cy="4" r="3.5" fill="var(--ambient-object-light)" />

    <rect x="405" y="70" width="75" height="170" rx="2" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.5" />
    <rect x="495" y="115" width="85" height="125" rx="2" fill="var(--obj-fill)" stroke="var(--obj-stroke)" strokeWidth="1.5" />

    {/* Lit Windows Data Matrix */}
    <line x1="130" y1="70" x2="185" y2="70" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.6" />
    <line x1="130" y1="95" x2="185" y2="95" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.6" />
    <line x1="130" y1="120" x2="185" y2="120" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.6" />

    <line x1="315" y1="60" x2="370" y2="60" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.6" />
    <line x1="315" y1="85" x2="370" y2="85" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.6" />
    <line x1="315" y1="110" x2="370" y2="110" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.6" />

    {/* Roofline Theme Glow Edge */}
    <path
      d="M30 80 H115 V45 H200 V100 H280 V30 H390 V70 H480 V115 H580"
      stroke="var(--ambient-object-light)"
      strokeWidth="2"
      strokeOpacity="0.75"
    />
  </svg>
);

// 5. Road Intersections & Location Pin Waypoints
const GeospatialRoadways = ({ style = {} }) => (
  <svg
    viewBox="0 0 420 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '460px', height: '300px', filter: 'drop-shadow(0 6px 20px var(--ambient-object-shadow)) blur(2px)', ...style }}
    aria-hidden="true"
  >
    <path
      d="M30 220 C140 180 180 100 360 40"
      stroke="var(--ambient-object-light)"
      strokeWidth="2.5"
      strokeOpacity="0.75"
      strokeDasharray="8 5"
    />
    <path
      d="M50 40 C120 120 220 180 390 230"
      stroke="var(--obj-stroke)"
      strokeWidth="2"
      strokeOpacity="0.5"
    />

    {/* Location Pin Waypoints */}
    <g transform="translate(195, 110)">
      <circle cx="0" cy="0" r="18" fill="var(--accent-subtle)" stroke="var(--ambient-object-light)" strokeWidth="2" />
      <circle cx="0" cy="0" r="7" fill="var(--ambient-object-light)" />
      <circle cx="0" cy="0" r="28" fill="none" stroke="var(--ambient-object-light)" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="3 3" />
    </g>

    <g transform="translate(245, 195)">
      <circle cx="0" cy="0" r="15" fill="var(--priority-critical-bg)" stroke="var(--priority-critical)" strokeWidth="2" />
      <circle cx="0" cy="0" r="6" fill="var(--priority-critical)" />
    </g>
  </svg>
);

export const AmbientObjects = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  return (
    <div
      className="ambient-municipal-scene"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Soft Ambient Volumetric Lighting Reflections (Purple in Dark / Rose in Light) */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '8%',
          width: '720px',
          height: '720px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(0,0,0,0) 68%)',
          filter: 'blur(90px)',
          opacity: 0.9,
          transition: 'background var(--transition-normal)'
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '6%',
          width: '780px',
          height: '780px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(100px)',
          opacity: 0.8,
          transition: 'background var(--transition-normal)'
        }}
      />

      {/* Atmospheric Spatial Matrix Coordinates */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.045,
          backgroundImage: `
            radial-gradient(var(--text-primary) 1.5px, transparent 1.5px),
            linear-gradient(to right, var(--text-primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px, 108px 108px, 108px 108px'
        }}
      />

      {/* PAGE-SPECIFIC MUNICIPAL OBJECTS (Consuming dynamic theme variables) */}
      
      {/* 1. Login Page */}
      {path.includes('/login') && (
        <>
          <CitySkyline style={{ position: 'absolute', bottom: '0%', left: '-2%', opacity: 0.85 }} />
          <MunicipalTruck isForeground style={{ position: 'absolute', bottom: '6%', left: '20%', opacity: 0.95 }} />
          <SmartWasteBin isForeground style={{ position: 'absolute', top: '14%', right: '10%', opacity: 0.9 }} />
          <GeospatialRoadways style={{ position: 'absolute', top: '4%', left: '8%', opacity: 0.8 }} />
        </>
      )}

      {/* 2. Dashboard */}
      {path.includes('/dashboard') && (
        <>
          <SmartWasteBin isForeground style={{ position: 'absolute', top: '10%', right: '5%', opacity: 0.9 }} />
          <MunicipalTruck isForeground style={{ position: 'absolute', bottom: '2%', right: '14%', opacity: 0.92 }} />
          <CitySkyline style={{ position: 'absolute', bottom: '0%', left: '16%', opacity: 0.8 }} />
          <GeospatialRoadways style={{ position: 'absolute', top: '22%', left: '16%', opacity: 0.85 }} />
        </>
      )}

      {/* 3. Complaints & Complaint Details */}
      {path.includes('/complaints') && (
        <>
          <GeospatialRoadways style={{ position: 'absolute', top: '12%', right: '6%', opacity: 0.9 }} />
          <SmartWasteBin isForeground style={{ position: 'absolute', bottom: '6%', left: '18%', opacity: 0.92 }} />
          <MunicipalTruck style={{ position: 'absolute', bottom: '4%', right: '10%', opacity: 0.85 }} />
        </>
      )}

      {/* 4. Waste Map */}
      {path.includes('/map') && (
        <>
          <GeospatialRoadways style={{ position: 'absolute', top: '8%', right: '12%', opacity: 0.95 }} />
          <MunicipalTruck isForeground style={{ position: 'absolute', bottom: '3%', left: '16%', opacity: 0.9 }} />
          <CitySkyline style={{ position: 'absolute', bottom: '0%', right: '0%', opacity: 0.8 }} />
        </>
      )}

      {/* 5. Operations Hub */}
      {path.includes('/operations') && (
        <>
          <MunicipalTruck isForeground style={{ position: 'absolute', top: '12%', right: '6%', opacity: 0.95 }} />
          <StreetSweeper style={{ position: 'absolute', bottom: '5%', left: '20%', transform: 'scaleX(-1)', opacity: 0.9 }} />
          <GeospatialRoadways style={{ position: 'absolute', top: '26%', left: '18%', opacity: 0.85 }} />
        </>
      )}

      {/* 6. Analytics */}
      {path.includes('/analytics') && (
        <>
          <SmartWasteBin isForeground style={{ position: 'absolute', top: '10%', right: '8%', opacity: 0.9 }} />
          <CitySkyline style={{ position: 'absolute', bottom: '2%', left: '16%', opacity: 0.85 }} />
          <GeospatialRoadways style={{ position: 'absolute', bottom: '12%', right: '12%', opacity: 0.85 }} />
        </>
      )}

      {/* 7. Verification */}
      {path.includes('/verification') && (
        <>
          <SmartWasteBin isForeground style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.92 }} />
          <StreetSweeper style={{ position: 'absolute', bottom: '5%', left: '18%', opacity: 0.9 }} />
          <MunicipalTruck style={{ position: 'absolute', bottom: '6%', right: '12%', opacity: 0.85 }} />
        </>
      )}
    </div>
  );
};
