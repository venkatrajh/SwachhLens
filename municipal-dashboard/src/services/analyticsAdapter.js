/**
 * analyticsAdapter.js
 *
 * Derives dashboard KPI values and analytics charts data from the
 * real complaints array (already fetched from GET /api/v1/reports).
 * All functions are pure — no API calls.
 */

const PRIORITY_COLORS = {
  critical: 'var(--priority-critical)',
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)',
};

/** Flat KPI values for Dashboard / Operations pages. */
export function adaptDashboardKPIs(complaints) {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    return { totalReports: 0, pending: 0, highPriority: 0, critical: 0, inProgress: 0, completed: 0 };
  }
  return {
    totalReports: complaints.length,
    pending: complaints.filter(c => ['pending', 'analyzing'].includes(c.rawStatus)).length,
    highPriority: complaints.filter(c => c.rawPriority === 'high').length,
    critical: complaints.filter(c => c.rawPriority === 'critical').length,
    inProgress: complaints.filter(c => ['assigned', 'in_progress'].includes(c.rawStatus)).length,
    completed: complaints.filter(c => ['completed', 'verified'].includes(c.rawStatus)).length,
  };
}

/** Waste-type distribution: [{ type, count, percent }] */
export function adaptWasteDistribution(complaints) {
  if (!Array.isArray(complaints) || complaints.length === 0) return [];
  const counts = {};
  for (const c of complaints) {
    const t = c.wasteType || 'Unknown';
    counts[t] = (counts[t] || 0) + 1;
  }
  const total = complaints.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }));
}

/** Priority distribution: [{ priority, count, color }] */
export function adaptPriorityDistribution(complaints) {
  const ORDER = ['critical', 'high', 'medium', 'low'];
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  if (Array.isArray(complaints)) {
    for (const c of complaints) {
      const p = c.rawPriority || 'medium';
      if (p in counts) counts[p]++;
    }
  }
  return ORDER.map(p => ({
    priority: p.charAt(0).toUpperCase() + p.slice(1),
    count: counts[p],
    color: PRIORITY_COLORS[p],
  }));
}

/** Reports-over-time for last 7 days: [{ day, reports, resolved }] */
export function adaptReportsOverTime(complaints) {
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ dateStr: d.toISOString().slice(0, 10), day: DAY_NAMES[d.getDay()], reports: 0, resolved: 0 });
  }
  if (Array.isArray(complaints)) {
    for (const c of complaints) {
      if (!c.reportedAtRaw) continue;
      const dateStr = new Date(c.reportedAtRaw).toISOString().slice(0, 10);
      const bucket = days.find(d => d.dateStr === dateStr);
      if (!bucket) continue;
      bucket.reports += 1;
      if (['completed', 'verified'].includes(c.rawStatus)) bucket.resolved += 1;
    }
  }
  return days;
}

/** Format duration in seconds to human-readable string. */
export function formatDurationSeconds(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '\u2014';
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/**
 * Recyclable waste percentage — uses the authoritative backend boolean
 * `is_recyclable` (exposed as `isRecyclable` by reportsAdapter.js).
 * Returns an integer 0-100, or null when there are no reports.
 * Denominator: total reports (complaints.length).
 */
export function adaptRecyclablePercent(complaints) {
  if (!Array.isArray(complaints) || complaints.length === 0) return null;
  const recyclableCount = complaints.filter(c => c.isRecyclable === true).length;
  return Math.round((recyclableCount / complaints.length) * 100);
}
