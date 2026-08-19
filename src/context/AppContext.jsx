import React, { createContext, useContext, useState } from 'react';
import { INITIAL_COMPLAINTS, KPI_DATA, ANALYTICS_DATA } from '../data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [kpis, setKpis] = useState(KPI_DATA);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Consume real authentication from AuthContext as the single source of truth
  const { user, isAuthenticated, isLoading, login, logout, authError } = useAuth();

  const toggleNavbar = () => {
    setIsNavbarCollapsed(prev => !prev);
  };

  const assignTeam = (complaintId, teamName) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedSteps = c.timelineSteps.map(step =>
            step.label === "Team Assigned"
              ? { ...step, status: "completed", time: "Just now" }
              : step
          );
          return {
            ...c,
            assignedTeam: teamName,
            status: c.status === "Pending" ? "Assigned" : c.status,
            timelineSteps: updatedSteps
          };
        }
        return c;
      })
    );
  };

  const assignVehicle = (complaintId, vehicleName) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedSteps = c.timelineSteps.map(step =>
            step.label === "Vehicle Assigned"
              ? { ...step, status: "completed", time: "Just now" }
              : step
          );
          return {
            ...c,
            assignedVehicle: vehicleName,
            status: c.status === "Pending" ? "Assigned" : c.status,
            timelineSteps: updatedSteps
          };
        }
        return c;
      })
    );
  };

  const verifyCleanup = (complaintId) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedSteps = c.timelineSteps.map(step =>
            step.label === "Verification" || step.label === "Verified"
              ? { ...step, status: "completed", time: "Verified just now" }
              : step
          );
          return {
            ...c,
            verified: true,
            status: "Completed",
            progress: 100,
            cleanupCompleted: true,
            timelineSteps: updatedSteps
          };
        }
        return c;
      })
    );
  };

  const getComplaintById = (id) => {
    return complaints.find(c => c.id.toLowerCase() === (id || '').toLowerCase());
  };

  return (
    <AppContext.Provider
      value={{
        complaints,
        kpis,
        isNavbarCollapsed,
        toggleNavbar,
        searchQuery,
        setSearchQuery,
        // Real auth state forwarded from AuthContext
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        authError,
        assignTeam,
        assignVehicle,
        verifyCleanup,
        getComplaintById,
        analyticsData: ANALYTICS_DATA
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
