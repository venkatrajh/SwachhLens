import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, ArrowLeft, Mail, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AppBackground } from '../components/layout/AppBackground';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your municipal email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppBackground>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative'
        }}
      >
        {/* Floating Theme Toggle */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
          <button
            onClick={toggleTheme}
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
              cursor: 'pointer'
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span style={{ color: 'var(--text-primary)' }}>{isDark ? 'Daylight' : 'Midnight'}</span>
          </button>
        </div>

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
            zIndex: 2
          }}
        >
          {/* Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Shield size={18} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              SWACHHLENS
            </span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Authority Account Recovery
            </p>
          </div>

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

          {isSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  If an account with that email exists, a password-reset link has been sent to your inbox.
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                icon={ArrowLeft}
                iconPosition="left"
                style={{ width: '100%' }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input
                label="Registered Municipal Email"
                type="email"
                placeholder="Enter official municipal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                icon={ArrowRight}
                iconPosition="right"
                style={{ width: '100%', marginTop: '6px' }}
              >
                {isSubmitting ? 'SENDING LINK...' : 'SEND RESET LINK'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  ← Back to Authority Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppBackground>
  );
};
