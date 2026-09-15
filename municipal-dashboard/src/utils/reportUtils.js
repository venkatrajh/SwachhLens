// municipal-dashboard/src/utils/reportUtils.js

/**
 * Format raw UUID and created date into human-friendly format: SL-2026-9E3019
 */
export function formatReportId(id, dateStr) {
  if (!id) return 'SL-2026-UNKNOWN';
  if (typeof id === 'string' && id.startsWith('SL-')) return id;

  let year = 2026;
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getFullYear())) {
        year = d.getFullYear();
      }
    } catch {
      // fallback
    }
  }

  const cleanHex = String(id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  return `SL-${year}-${cleanHex || '000000'}`;
}



/**
 * Format location with address fallback to GPS coordinates.
 * NEVER returns 'Location not provided' if coordinates exist.
 */
export function formatLocation(addressLabel, latitude, longitude) {
  if (addressLabel && addressLabel.trim() && !addressLabel.toLowerCase().includes('not provided')) {
    return addressLabel.trim();
  }
  if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
    return `${Number(latitude).toFixed(5)}°, ${Number(longitude).toFixed(5)}°`;
  }
  return 'Location pending';
}
