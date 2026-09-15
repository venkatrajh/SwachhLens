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
  adaptBackendSummaryKPIs,
  adaptBackendWasteDistribution,
  adaptBackendPriorityDistribution,
  adaptBackendTrends,
} from '../services/analyticsAdapter';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [kpis, setKpis] = useState({
    totalReports: 0, pending: 0, highPriority: 0, critical: 0,
    inProgress: 0, completed: 0,
  });
  const [analyticsDateRange, setAnalyticsDateRange] = useState('all');
  const [hotspots, setHotspots] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    reportsOverTime: [],
    wasteTypeDistribution: [],
    priorityDistribution: [],
    topHotspots: [],
    hotspots: [],
    responseSLA: null,
    performance: null,
    performanceLoading: false,
    performanceError: null,
    recyclablePercent: null,
    totalReports: 0,
    loading: false,
    error: null,
  });
  const [teams, setTeams] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, isLoading, login, logout, authError } = useAuth();

  const getDateParams = (range) => {
    if (!range || range === 'all') return { startDate: null, endDate: null };
    const now = new Date();
    let start = new Date(now);
    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      start.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      start.setDate(now.getDate() - 30);
    }
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const loadAnalytics = async (range = analyticsDateRange) => {
    setAnalyticsDateRange(range);
    setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));

    const { startDate, endDate } = getDateParams(range);
    const q = [];
    if (startDate) q.push(`start_date=${encodeURIComponent(startDate)}`);
    if (endDate) q.push(`end_date=${encodeURIComponent(endDate)}`);
    const qs = q.length ? `?${q.join('&')}` : '';
    const trendQs = q.length ? `?${q.join('&')}&interval=day` : '?interval=day';
    const hotspotQs = q.length ? `?${q.join('&')}&radius_meters=250.0&min_reports=2` : '?radius_meters=250.0&min_reports=2';

    try {
      const [summaryRes, trendsRes, perfRes, hotspotsRes] = await Promise.allSettled([
        api.get(`/analytics/summary${qs}`),
        api.get(`/analytics/trends${trendQs}`),
        api.get(`/analytics/performance${qs}`),
        api.get(`/analytics/hotspots${hotspotQs}`),
      ]);

      let backendSummary = null;
      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        backendSummary = summaryRes.value;
        const summaryKPIs = adaptBackendSummaryKPIs(backendSummary);
        if (summaryKPIs && range === 'all') {
          // Keep dashboard KPIs synchronized with full database intake
          setKpis(summaryKPIs);
        }
      }

      let backendTrends = null;
      if (trendsRes.status === 'fulfilled' && trendsRes.value) {
        backendTrends = trendsRes.value;
      }

      let backendPerf = null;
      if (perfRes.status === 'fulfilled' && perfRes.value) {
        const perf = perfRes.value;
        backendPerf = {
          completedCount: perf.completed_report_count ?? 0,
          verifiedCount: perf.verified_report_count ?? 0,
          pendingResolution: perf.pending_resolution_count ?? 0,
          avgResolutionDisplay: formatDurationSeconds(perf.average_resolution_duration_seconds),
          avgVerificationDisplay: formatDurationSeconds(perf.average_verification_duration_seconds),
        };
      }

      let detectedHotspots = [];
      if (hotspotsRes.status === 'fulfilled' && hotspotsRes.value) {
        detectedHotspots = hotspotsRes.value.hotspots || [];
      }
      setHotspots(detectedHotspots);

      setAnalyticsData(prev => ({
        ...prev,
        loading: false,
        reportsOverTime: backendTrends ? adaptBackendTrends(backendTrends) : prev.reportsOverTime,
        wasteTypeDistribution: backendSummary ? adaptBackendWasteDistribution(backendSummary) : prev.wasteTypeDistribution,
        priorityDistribution: backendSummary ? adaptBackendPriorityDistribution(backendSummary) : prev.priorityDistribution,
        recyclablePercent: (backendSummary && backendSummary.total_reports > 0)
          ? Math.round(((backendSummary.recyclable_count || 0) / backendSummary.total_reports) * 100)
          : prev.recyclablePercent,
        totalReports: backendSummary ? backendSummary.total_reports : prev.totalReports,
        hotspots: detectedHotspots,
        topHotspots: detectedHotspots,
        performance: backendPerf || prev.performance,
        performanceLoading: false,
        performanceError: null,
      }));
    } catch (err) {
      console.error("Failed to load analytics suite:", err);
      setAnalyticsData(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load complete analytics suite.",
      }));
    }
  };

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

      // Derive fallback analytics from the report list if backend analytics haven't loaded yet
      setKpis(prev => prev.totalReports === 0 ? adaptDashboardKPIs(adapted) : prev);
      setAnalyticsData(prev => ({
        ...prev,
        reportsOverTime: prev.reportsOverTime.length === 0 ? adaptReportsOverTime(adapted) : prev.reportsOverTime,
        wasteTypeDistribution: prev.wasteTypeDistribution.length === 0 ? adaptWasteDistribution(adapted) : prev.wasteTypeDistribution,
        priorityDistribution: prev.priorityDistribution.length === 0 ? adaptPriorityDistribution(adapted) : prev.priorityDistribution,
        recyclablePercent: prev.recyclablePercent === null ? adaptRecyclablePercent(adapted) : prev.recyclablePercent,
      }));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadAnalytics('all');
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
      await api.post(`/reports/${complaintId}/status`, { new_status: "verified", label: "Cleanup officially verified and certified" });
      await loadData();
    } catch (err) {
      console.error("Failed to verify cleanup:", err);
      throw err;
    }
  };

  const rejectCleanup = async (complaintId, reason) => {
    try {
      const label = reason ? `Evidence rejected: ${reason}` : 'Evidence rejected: Re-cleanup requested';
      await api.post(`/reports/${complaintId}/status`, { new_status: "in_progress", label });
      await loadData();
    } catch (err) {
      console.error("Failed to reject cleanup:", err);
      throw err;
    }
  };

  const getComplaintById = (id) => {
    return complaints.find(c => c.id.toLowerCase() === (id || '').toLowerCase());
  };

  const getReportHistory = async (complaintId) => {
    try {
      const res = await api.get(`/reports/${complaintId}/history`);
      return res.data || [];
    } catch (err) {
      console.warn(`Failed to fetch history for ${complaintId}:`, err);
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        complaints,
        teams,
        vehicles,
        kpis,
        analyticsData,
        analyticsDateRange,
        loadAnalytics,
        hotspots,
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
        rejectCleanup,
        getComplaintById,
        getReportHistory,
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
