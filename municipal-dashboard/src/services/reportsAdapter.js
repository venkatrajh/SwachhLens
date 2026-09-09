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

/**
 * Synthesizes a timeline based on the current status
 */
const synthesizeTimeline = (report) => {
  const reportedTime = formatTime(report.reported_at || report.created_at);
  const status = report.status || 'pending';
  
  const steps = [
    { label: "Reported", time: reportedTime, status: "completed" },
    { label: "AI Analyzed", time: reportedTime, status: "completed" }
  ];

  if (['assigned', 'in_progress', 'completed', 'verified'].includes(status)) {
    steps.push({ label: "Team Assigned", time: "Completed", status: "completed" });
    steps.push({ label: "Vehicle Assigned", time: "Completed", status: "completed" });
  } else {
    steps.push({ label: "Team Assigned", time: "Pending", status: status === 'analyzing' || status === 'pending' ? 'current' : 'upcoming' });
    steps.push({ label: "Vehicle Assigned", time: "Pending", status: "upcoming" });
  }

  if (['in_progress', 'completed', 'verified'].includes(status)) {
    steps.push({ label: "In Progress", time: "Started", status: "completed" });
  } else {
    steps.push({ label: "In Progress", time: "Pending", status: status === 'assigned' ? 'current' : 'upcoming' });
  }

  if (['completed', 'verified'].includes(status)) {
    steps.push({ label: "Cleanup Completed", time: formatTime(report.updated_at), status: "completed" });
    steps.push({ label: "Verification", time: status === 'verified' || report.verified_at ? formatTime(report.verified_at) : "Pending", status: status === 'verified' || report.verified_at ? "completed" : "current" });
    steps.push({ label: "Verified", time: status === 'verified' || report.verified_at ? formatTime(report.verified_at) : "Pending", status: status === 'verified' || report.verified_at ? "completed" : "upcoming" });
  } else {
    steps.push({ label: "Cleanup Completed", time: "Pending", status: status === 'in_progress' ? 'current' : 'upcoming' });
    steps.push({ label: "Verification", time: "Pending", status: "upcoming" });
    steps.push({ label: "Verified", time: "Pending", status: "upcoming" });
  }

  return steps;
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
    
    beforeImage: backendReport.before_image_url || backendReport.image_url || "/images/placeholder.jpg",
    afterImage: afterImg,
    
    timelineSteps: synthesizeTimeline(backendReport)
  };
};

/**
 * Maps a list of backend reports to the frontend Dashboard schema
 */
export const adaptReportsList = (backendReports) => {
  if (!Array.isArray(backendReports)) return [];
  return backendReports.map(adaptReport);
};
