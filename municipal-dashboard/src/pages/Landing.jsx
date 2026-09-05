import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Sparkles,
  MapPin,
  Truck,
  CheckCircle2,
  BarChart3,
  Sun,
  Moon,
  Activity,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AppBackground } from '../components/layout/AppBackground';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  const workflowSteps = [
    { num: '01', title: 'REPORT', desc: 'Citizen geo-tagged complaint & visual capture' },
    { num: '02', title: 'ANALYZE', desc: 'AI visual classification & hazard triage' },
    { num: '03', title: 'PRIORITIZE', desc: 'Automated SLA & severity rating' },
    { num: '04', title: 'RESPOND', desc: 'Autonomous crew & vehicle dispatch' },
    { num: '05', title: 'VERIFY', desc: 'Before/after computer vision validation' }
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Spatial GIS Intelligence',
      desc: 'Live interactive mapping across municipal zones with automated cluster analysis and SLA countdowns.'
    },
    {
      icon: Sparkles,
      title: 'Deep Learning Visual Triage',
      desc: 'Computer vision algorithms categorize waste types, estimate volume weights, and score hazard levels.'
    },
    {
      icon: Truck,
      title: 'Autonomous Resource Allocation',
      desc: 'Intelligent fleet routing and sanitation crew assignment optimized for rapid municipal response.'
    },
    {
      icon: CheckCircle2,
      title: 'Computer Vision Verification',
      desc: 'Dual-image before and after clearance audit ensuring 100% site remediation before certification.'
    }
  ];

  return (
    <AppBackground>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* TOP FLOATING LIQUID GLASS NAVBAR */}
        <header style={{ padding: '16px 24px', position: 'relative', zIndex: 50 }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 24px',
              backgroundColor: 'var(--glass-navbar)',
              backdropFilter: 'var(--liquid-glass-lg)',
              WebkitBackdropFilter: 'var(--liquid-glass-lg)',
              border: '1px solid var(--glass-border-light)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-floating)',
              position: 'relative'
            }}
          >
            {/* Top Specular Edge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--glass-specular-edge)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
              }}
            />

            {/* Brand Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px var(--accent-glow)'
                }}
              >
                <Shield size={19} />
              </div>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                  SWACHHLENS
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '9px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    lineHeight: 1
                  }}
                >
                  Municipal Intelligence Platform
                </span>
              </div>
            </div>

            {/* Right Actions: Theme Toggle + Sign In */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Daylight Rose Light Mode" : "Switch to Midnight Purple Dark Mode"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--surface-secondary)',
                  backdropFilter: 'var(--liquid-glass-sm)',
                  border: '1px solid var(--glass-border)',
                  color: isDark ? '#FBBF24' : 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
                <span style={{ color: 'var(--text-primary)' }}>{isDark ? 'Daylight' : 'Midnight'}</span>
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                icon={ArrowRight}
                iconPosition="right"
              >
                SIGN IN
              </Button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <main style={{ flex: 1, padding: '40px 24px 60px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px 40px 20px',
              maxWidth: '850px',
              margin: '0 auto'
            }}
          >
            {/* Tag Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--accent-border)',
                backdropFilter: 'var(--liquid-glass-sm)',
                boxShadow: '0 0 16px var(--accent-glow)',
                marginBottom: '24px'
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                AI-Powered Municipal Waste Command Center
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: '20px'
              }}
            >
              Smarter Waste Management.
              <br />
              <span style={{ color: 'var(--accent-primary)' }}>Cleaner Cities.</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '680px',
                margin: '0 auto 36px auto'
              }}
            >
              SwachhLens bridges citizen reporting with automated AI triage, geospatial GIS dispatch,
              and computer vision verification to empower municipal authorities with real-time operational efficiency.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                icon={ArrowRight}
                iconPosition="right"
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                GET STARTED
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                AUTHORITY SIGN IN
              </Button>
            </div>
          </div>

          {/* WORKFLOW PIPELINE IN LEVEL 1 LIQUID GLASS */}
          <div style={{ marginTop: '30px' }}>
            <Card
              level="1"
              title="Autonomous Municipal Resolution Pipeline"
              subtitle="End-to-end incident lifecycle from geotagged capture to verified remediation"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}
              >
                {workflowSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--surface-secondary)',
                      backdropFilter: 'var(--liquid-glass-sm)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        STEP {step.num}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>●</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {step.title}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 4 PLATFORM CAPABILITY CARDS IN LEVEL 2 LIQUID GLASS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
              marginTop: '24px'
            }}
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card key={idx} level="2">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--accent-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      boxShadow: '0 0 14px var(--accent-glow)',
                      marginBottom: '14px'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {feat.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </main>

        {/* FOOTER */}
        <footer
          style={{
            padding: '24px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--glass-level-1)',
            backdropFilter: 'var(--liquid-glass-sm)'
          }}
        >
          © 2026 SwachhLens Municipal AI Platform • Greater Chennai Corporation Edition
        </footer>
      </div>
    </AppBackground>
  );
};
