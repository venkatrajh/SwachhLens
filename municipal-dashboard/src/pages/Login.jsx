import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, Lock, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AppBackground } from '../components/layout/AppBackground';

export const Login = () => {
  const [email, setEmail] = useState('commissioner.zone5@chennaicorporation.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your municipal authority email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage('Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const workflowSteps = [
    { num: '01', title: 'REPORT', desc: 'Citizen geo-tagged complaint' },
    { num: '02', title: 'ANALYZE', desc: 'AI visual & volume triage' },
    { num: '03', title: 'PRIORITIZE', desc: 'Severity rating & SLA assignment' },
    { num: '04', title: 'RESPOND', desc: 'Autonomous crew & asset dispatch' },
    { num: '05', title: 'VERIFY', desc: 'Before/after computer vision validation' }
  ];

  return (
    <AppBackground>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          position: 'relative'
        }}
      >
        {/* Floating Top Corner Theme Toggle on Login Page */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Daylight Rose Light Mode" : "Switch to Midnight Purple Dark Mode"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--glass-surface)',
              backdropFilter: 'var(--glass-blur-md)',
              border: '1px solid var(--glass-border)',
              color: isDark ? '#FBBF24' : 'var(--accent-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span style={{ color: 'var(--text-primary)' }}>{isDark ? 'Daylight' : 'Midnight'}</span>
          </button>
        </div>

        {/* LEFT SIDE: Brand & Product Introduction */}
        <div
          style={{
            flex: '1 1 500px',
            padding: '56px 64px',
            backgroundColor: 'var(--glass-level-1)',
            backdropFilter: 'var(--liquid-glass-lg)',
            WebkitBackdropFilter: 'var(--liquid-glass-lg)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
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
              <Shield size={20} />
            </div>
            <div>
              <span style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                SWACHHLENS
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                Municipal Intelligence Platform
              </span>
            </div>
          </div>

          {/* Core Value Proposition */}
          <div style={{ margin: '48px 0' }}>
            <h1
              style={{
                fontSize: '38px',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: '18px'
              }}
            >
              Smarter Waste Management.
              <br />
              Cleaner Cities.
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '480px',
                marginBottom: '40px'
              }}
            >
              An AI-powered municipal command center that helps city authorities identify,
              prioritize, and deploy waste remediation faster.
            </p>

            {/* Workflow Pipeline */}
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                Autonomous Resolution Pipeline
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {workflowSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {step.num}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', minWidth: '85px', letterSpacing: '0.04em' }}>
                      {step.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {step.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 SwachhLens Municipal AI • Greater Chennai Corporation Edition
          </div>
        </div>

        {/* RIGHT SIDE: Floating Glass Login Card */}
        <div
          style={{
            flex: '1 1 450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            position: 'relative',
            zIndex: 2
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              backgroundColor: 'var(--glass-level-3)',
              backdropFilter: 'var(--liquid-glass-xl)',
              WebkitBackdropFilter: 'var(--liquid-glass-xl)',
              padding: '40px 36px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--glass-border-light)',
              boxShadow: 'var(--shadow-xl), inset 0 1px 0 var(--glass-highlight)',
              position: 'relative',
              overflow: 'hidden'
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
                background: 'var(--glass-specular-edge)'
              }}
            />
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Authority Login • Municipal Command Center
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--priority-critical-bg)',
                  border: '1px solid var(--priority-critical-border)',
                  color: 'var(--priority-critical)',
                  fontSize: '12px',
                  marginBottom: '18px'
                }}
              >
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input
                label="Official Municipal Email"
                type="email"
                placeholder="commissioner.zone5@chennaicorporation.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset instructions sent to registered municipal officer email.');
                    }}
                    style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                icon={ArrowRight}
                iconPosition="right"
                style={{ width: '100%', marginTop: '6px' }}
              >
                SIGN IN
              </Button>
            </form>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '22px 0',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                OR
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* Google Sign-In Button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGoogleSignInClick}
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path
                  fill="currentColor"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="currentColor"
                  fillOpacity="0.8"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="currentColor"
                  fillOpacity="0.6"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="currentColor"
                  fillOpacity="0.9"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '22px',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}
            >
              <Lock size={12} />
              <span>🔒 Secure Authority Access</span>
            </div>
          </div>
        </div>
      </div>
    </AppBackground>
  );
};
