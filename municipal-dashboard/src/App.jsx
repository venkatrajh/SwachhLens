import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Complaints } from './pages/Complaints';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { WasteMap } from './pages/WasteMap';
import { Operations } from './pages/Operations';
import { Analytics } from './pages/Analytics';
import { Verification } from './pages/Verification';

// Auth Entrance Route handler for / and /login:
// Shows the split-screen Login page if unauthenticated, redirects to /dashboard if logged in
const AuthEntranceRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AuthEntranceRoute />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<AuthEntranceRoute />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes (Require Valid Authentication Session) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/complaints/:id" element={<ComplaintDetails />} />
                  <Route path="/map" element={<WasteMap />} />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/verification" element={<Verification />} />
                </Route>
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
