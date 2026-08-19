import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';
import { AppBackground } from '../layout/AppBackground';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <AppBackground>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(255, 255, 255, 0.15)',
              animation: 'pulseSubtle 1.5s infinite ease-in-out'
            }}
          >
            <Shield size={22} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.04em' }}>
              Initializing Command Session...
            </span>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
