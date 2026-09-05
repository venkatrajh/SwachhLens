import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { adaptReportsList } from '../services/reportsAdapter';
import {
  adaptDashboardKPIs,
  adaptWasteDistribution,
  adaptPriorityDistribution,
  adaptReportsOverTime,
  adaptRecyclablePercent,
  formatDurationSeconds,
} from '../services/analyticsAdapter';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [kpis, setKpis] = useState({
    totalReports: 0, pending: 0, highPriority: 0, critical: 0,
    inProgress: 0, completed: 0,
  });
  const [analyticsData, setAnalyticsData] = useState({
    reportsOverTime: [],
    wasteTypeDistribution: [],
    priorityDistribution: [],
    topHotspots: [],       // backend gap — no endpoint; always empty in Phase I
    responseSLA: null,     // replaced by real performance metrics
    performance: null,     // populated from /analytics/performance
    performanceLoading: false,
    performanceError: null,
  });
  const [teams, setTeams] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, isLoading, login, logout, authError } = useAuth();

  const loadData = async () => {
    try {
      const [reportsData, teamsData, vehiclesData] = await Promise.all([
        api.get('/reports'),
        api.get('/teams/?active_only=true'),
        api.get('/vehicles/?active_only=true')
      ]);
      const reportsList = reportsData.items || reportsData;
      const adapted = adaptReportsList(reportsList);
      setComplaints(adapted);
      setTeams(teamsData || []);
      setVehicles(vehiclesData || []);

      // Derive analytics from the already-fetched report list (no extra API call)
      setKpis(adaptDashboardKPIs(adapted));
      setAnalyticsData(prev => ({
        ...prev,
        reportsOverTime: adaptReportsOverTime(adapted),
        wasteTypeDistribution: adaptWasteDistribution(adapted),
        priorityDistribution: adaptPriorityDistribution(adapted),
        recyclablePercent: adaptRecyclablePercent(adapted),
      }));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  // Separately fetch performance metrics (requires DB aggregation, not derivable client-side)
  const loadPerformance = async () => {
    setAnalyticsData(prev => ({ ...prev, performanceLoading: true, performanceError: null }));
    try {
      const perf = await api.get('/analytics/performance');
      setAnalyticsData(prev => ({
        ...prev,
        performanceLoading: false,
        performance: {
          completedCount: perf.completed_report_count ?? 0,
          verifiedCount: perf.verified_report_count ?? 0,
          pendingResolution: perf.pending_resolution_count ?? 0,
          avgResolutionDisplay: formatDurationSeconds(perf.average_resolution_duration_seconds),
          avgVerificationDisplay: formatDurationSeconds(perf.average_verification_duration_seconds),
        },
      }));
    } catch (err) {
      console.error("Failed to load performance analytics:", err);
      setAnalyticsData(prev => ({
        ...prev,
        performanceLoading: false,
        performanceError: "Performance data temporarily unavailable.",
      }));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadPerformance();
    }
  }, [isAuthenticated]);

  const toggleNavbar = () => setIsNavbarCollapsed(prev => !prev);

  const assignTeam = async (complaintId, teamId) => {
    try {
      const current = complaints.find(c => c.id === complaintId);
      if (current && current.rawStatus === 'pending') {
        await api.post(`/reports/${complaintId}/status`, { new_status: 'analyzing', label: 'Triage initiated prior to team assignment' });
      }
      await api.post(`/reports/${complaintId}/assign`, { assigned_team_id: teamId });
      await loadData();
    } catch (err) {
      console.error("Failed to assign team:", err);
      throw err;
    }
  };

  const assignVehicle = async (complaintId, vehicleId) => {
    try {
      const current = complaints.find(c => c.id === complaintId);
      if (current && current.rawStatus === 'pending') {
        await api.post(`/reports/${complaintId}/status`, { new_status: 'analyzing', label: 'Triage initiated prior to vehicle assignment' });
      }
      await api.post(`/reports/${complaintId}/assign`, { assigned_vehicle_id: vehicleId });
      await loadData();
    } catch (err) {
      console.error("Failed to assign vehicle:", err);
      throw err;
    }
  };

  const updateStatus = async (complaintId, newStatus, label) => {
    try {
      await api.post(`/reports/${complaintId}/status`, { new_status: newStatus, label });
      await loadData();
    } catch (err) {
      console.error(`Failed to update status to ${newStatus}:`, err);
      throw err;
    }
  };

  const resolveReport = async (complaintId, afterImageUrl, resolutionNotes) => {
    try {
      await api.post(`/reports/${complaintId}/resolve`, {
        after_image_url: afterImageUrl,
        resolution_notes: resolutionNotes,
      });
      await loadData();
    } catch (err) {
      console.error("Failed to resolve report:", err);
      throw err;
    }
  };

  const verifyCleanup = async (complaintId) => {
    try {
      await api.post(`/reports/${complaintId}/status`, { new_status: "verified" });
      await loadData();
    } catch (err) {
      console.error("Failed to verify cleanup:", err);
      throw err;
    }
  };

  const getComplaintById = (id) => {
    return complaints.find(c => c.id.toLowerCase() === (id || '').toLowerCase());
  };

  return (
    <AppContext.Provider
      value={{
        complaints,
        teams,
        vehicles,
        kpis,
        analyticsData,
        isNavbarCollapsed,
        toggleNavbar,
        searchQuery,
        setSearchQuery,
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        authError,
        refreshData: loadData,
        assignTeam,
        assignVehicle,
        updateStatus,
        resolveReport,
        verifyCleanup,
        getComplaintById,
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
