// municipal-dashboard/src/services/reportsAdapter.js
import { formatReportId, formatLocation } from '../utils/reportUtils';

/**
 * Formats a date string into "YYYY-MM-DD hh:mm A" format
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Pending';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Pending';
  
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hh = String(hours).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  
  return `${yyyy}-${MM}-${dd} ${hh}:${mm} ${ampm}`;
};

/**
 * Formats time into "hh:mm A" format
 */
const formatTime = (dateString) => {
  if (!dateString) return 'Pending';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Pending';
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  
  return `${hh}:${mm} ${ampm}`;
};

const STATUS_TITLES = {
  pending: "Report Submitted",
  analyzing: "Incident Triage & AI Analysis",
  assigned: "Crew & Equipment Assigned",
  in_progress: "Field Cleanup In Progress",
  completed: "Cleanup Evidence Submitted",
  verified: "Site Clearance Verified & Certified",
  escalated: "Escalated to Commissioner",
  duplicate: "Marked as Duplicate Incident"
};

/**
 * Adapts real backend status history entries into timeline steps.
 * Truthfully represents actual historical events with real recorded timestamps.
 */
export const adaptTimelineHistory = (historyItems = [], report = {}) => {
  if (Array.isArray(historyItems) && historyItems.length > 0) {
    return historyItems.map((item) => {
      const defaultTitle = STATUS_TITLES[item.status] || (item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')) : "Status Update");
      const hasCustomDetail = item.label && item.label !== defaultTitle && item.label !== item.status;

      return {
        label: defaultTitle,
        description: hasCustomDetail ? item.label : undefined,
        time: formatDate(item.occurred_at),
        status: "completed",
        rawStatus: item.status,
        occurredAt: item.occurred_at
      };
    });
  }

  // Graceful fallback when history is empty: single truthful initial reported event if report dates exist
  const reportedDate = report?.reported_at || report?.created_at || report?.reportedAtRaw;
  if (reportedDate) {
    return [{
      label: "Report Submitted",
      description: report.description ? `Citizen report: "${report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}"` : "Incident reported by citizen",
      time: formatDate(reportedDate),
      status: "completed",
      rawStatus: report.status || "pending",
      occurredAt: reportedDate
    }];
  }

  return [];
};

/**
 * Maps a single backend report to the frontend Dashboard schema
 */
export const adaptReport = (backendReport) => {
  const displayId = backendReport.display_id || formatReportId(backendReport.id, backendReport.created_at || backendReport.reported_at);
  const locationText = formatLocation(backendReport.address_label, backendReport.latitude, backendReport.longitude);
  const afterImg = backendReport.after_image_url || null;

  return {
    id: backendReport.id,
    displayId,
    wasteType: backendReport.waste_type || "Unknown Waste",
    location: locationText,
    latitude: backendReport.latitude,
    longitude: backendReport.longitude,
    description: backendReport.description || "No description provided.",
    severity: backendReport.severity_score !== undefined && backendReport.severity_score !== null
      ? (backendReport.severity_score > 10
          ? Math.round((backendReport.severity_score / 10) * 10) / 10
          : Math.round(backendReport.severity_score * 10) / 10)
      : 0,
    priority: (backendReport.priority || 'MEDIUM').toUpperCase(),
    confidence: backendReport.confidence ? Math.round(backendReport.confidence * 100) : 0,
    volume: `${backendReport.volume_level || 'Unknown'} (~${backendReport.estimated_weight_kg || 0} kg)`,
    
    // Status label for UI (consistently display 'AI Analyzed' for backend analyzing state)
    status: (backendReport.status === 'analyzing')
      ? 'AI Analyzed'
      : (backendReport.status || 'pending').charAt(0).toUpperCase() + (backendReport.status || 'pending').slice(1).replace('_', ' '),
    
    reportedAt: formatDate(backendReport.reported_at || backendReport.created_at),
    // Raw ISO timestamp for client-side grouping / analytics
    reportedAtRaw: backendReport.reported_at || backendReport.created_at || null,
    // Raw backend status for analytics filtering (lowercase, e.g. "pending", "in_progress")
    rawStatus: backendReport.status || 'pending',
    // Raw backend priority (lowercase, e.g. "high", "critical")
    rawPriority: backendReport.priority || 'medium',
    
    recommendedTeam: backendReport.recommended_team || "Pending AI Analysis",
    recommendedVehicle: backendReport.recommended_vehicle || "Pending AI Analysis",
    recommendedAction: backendReport.recommended_action || "Awaiting action plan.",
    
    // Map the actual UUIDs so the UI dropdowns can re-select them automatically after a page load
    assignedTeam: backendReport.assigned_team_id || null,
    assignedVehicle: backendReport.assigned_vehicle_id || null,
    
    progress: backendReport.progress || 0,
    cleanupCompleted: backendReport.status === 'completed',
    verified: !!backendReport.verified_at,
    isRecyclable: !!backendReport.is_recyclable,
    
    beforeImage: backendReport.before_image_url || backendReport.image_url || null,
    afterImage: afterImg,
    
    timelineSteps: adaptTimelineHistory(backendReport.history || [], backendReport)
  };
};

/**
 * Maps complaint status and history to an 8-stage operational resolution timeline.
 * Stages: Reported -> AI Analysed -> Team Assigned -> Vehicle Assigned -> In Progress -> Cleanup Completed -> Verification -> Resolved
 */
export const buildOperationalTimeline = (complaint = {}, history = []) => {
  const rawStatus = (complaint.rawStatus || complaint.status || 'pending').toLowerCase();
  const hasTeam = Boolean(complaint.assignedTeam);
  const hasVehicle = Boolean(complaint.assignedVehicle);
  const hasAfterImage = Boolean(complaint.afterImage || complaint.after_image_url);
  const isVerified = rawStatus === 'verified' || complaint.verified;
  const isCompleted = rawStatus === 'completed' || isVerified || hasAfterImage;
  const isInProgress = rawStatus === 'in_progress';
  const isAssigned = rawStatus === 'assigned' || (hasTeam && hasVehicle);
  const isAnalyzed = rawStatus !== 'pending' || Boolean(complaint.wasteType && complaint.wasteType !== 'Unknown Waste');

  const findHistoryTime = (targetStatus) => {
    if (!Array.isArray(history)) return null;
    const match = history.find(h => (h.status || '').toLowerCase() === targetStatus.toLowerCase());
    return match ? formatTime(match.occurred_at) : null;
  };

  const reportedTime = formatTime(complaint.reportedAtRaw || complaint.reported_at || complaint.created_at);

  const stages = [
    { key: 'reported', label: 'Reported', time: reportedTime || findHistoryTime('pending') },
    { key: 'ai_analysed', label: 'AI Analysed', time: findHistoryTime('analyzing') },
    { key: 'team_assigned', label: 'Team Assigned', time: hasTeam ? (findHistoryTime('assigned') || 'Assigned') : null },
    { key: 'vehicle_assigned', label: 'Vehicle Assigned', time: hasVehicle ? (findHistoryTime('assigned') || 'Assigned') : null },
    { key: 'in_progress', label: 'In Progress', time: findHistoryTime('in_progress') },
    { key: 'cleanup_completed', label: 'Cleanup Completed', time: findHistoryTime('completed') },
    { key: 'verification', label: 'Verification', time: findHistoryTime('verified') },
    { key: 'resolved', label: 'Resolved', time: isVerified ? (findHistoryTime('verified') || 'Done') : null }
  ];

  let activeIndex = 0;
  if (isVerified) {
    activeIndex = 7;
  } else if (rawStatus === 'completed') {
    activeIndex = 6;
  } else if (isInProgress) {
    activeIndex = 4;
  } else if (hasTeam && hasVehicle) {
    activeIndex = 4;
  } else if (hasTeam) {
    activeIndex = 3;
  } else if (isAnalyzed || rawStatus === 'analyzing') {
    activeIndex = 2;
  } else {
    activeIndex = 1;
  }

  return stages.map((stage, idx) => {
    let status = 'pending';
    if (isVerified) {
      status = 'completed';
    } else if (idx < activeIndex) {
      status = 'completed';
    } else if (idx === activeIndex) {
      status = 'current';
    } else {
      status = 'pending';
    }
    return {
      label: stage.label,
      time: stage.time,
      status
    };
  });
};

/**
 * Maps a list of backend reports to the frontend Dashboard schema
 */
export const adaptReportsList = (backendReports) => {
  if (!Array.isArray(backendReports)) return [];
  return backendReports.map(adaptReport);
};
