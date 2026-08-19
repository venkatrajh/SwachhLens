import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { BottomNav } from './components/layout/BottomNav';
import { LanguageModal } from './components/ui/LanguageModal';

// Pages
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { ReportWaste } from './pages/ReportWaste';
import { CameraPage } from './pages/Camera';
import { Preview } from './pages/Preview';
import { Analyzing } from './pages/Analyzing';
import { Result } from './pages/Result';
import { Reports } from './pages/Reports';
import { ReportDetails } from './pages/ReportDetails';
import { Profile } from './pages/Profile';
import { LanguageSettings } from './pages/LanguageSettings';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <LanguageModal />
          <MobileContainer>
            <Routes>
              {/* Onboarding & Authentication */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Citizen Main Application Flow */}
              <Route path="/home" element={<Home />} />
              <Route path="/report" element={<ReportWaste />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/analyzing" element={<Analyzing />} />
              <Route path="/result/:id" element={<Result />} />

              {/* Reports & Tracking */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetails />} />

              {/* Profile & Settings */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/language" element={<LanguageSettings />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNav />
          </MobileContainer>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
