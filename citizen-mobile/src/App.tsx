import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { BottomNav } from './components/layout/BottomNav';
import { LanguageModal } from './components/ui/LanguageModal';

// Pages
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Home } from './pages/Home';
import { ReportWaste } from './pages/ReportWaste';
import { CameraPage } from './pages/Camera';
import { Preview } from './pages/Preview';
import { Analyzing } from './pages/Analyzing';
import { Result } from './pages/Result';
import { Reports } from './pages/Reports';
import { ReportDetails } from './pages/ReportDetails';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { ChangePassword } from './pages/ChangePassword';
import { Notifications } from './pages/Notifications';
import { AppearanceSettings } from './pages/AppearanceSettings';
import { SecurityPrivacy } from './pages/SecurityPrivacy';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { LanguageSettings } from './pages/LanguageSettings';

import { ProtectedRoute } from './components/layout/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <LanguageModal />
            <MobileContainer>
              <Routes>
                {/* Onboarding & Authentication */}
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Citizen Application Flow */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/report" element={<ReportWaste />} />
                  <Route path="/camera" element={<CameraPage />} />
                  <Route path="/preview" element={<Preview />} />
                  <Route path="/analyzing" element={<Analyzing />} />
                  <Route path="/result/:id" element={<Result />} />

                  {/* Reports & Tracking */}
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/:id" element={<ReportDetails />} />

                  {/* Profile & Settings Sub-screens */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/profile/change-password" element={<ChangePassword />} />
                  <Route path="/settings/appearance" element={<AppearanceSettings />} />
                  <Route path="/settings/notifications" element={<Notifications />} />
                  <Route path="/settings/language" element={<LanguageSettings />} />
                  <Route path="/security-privacy" element={<SecurityPrivacy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BottomNav />
            </MobileContainer>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
