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
 * Return deterministic cleanup image path for a waste category and report ID
 */
export function getCleanupImage(wasteType, reportId) {
  const norm = (wasteType || '').toLowerCase();

  if (norm.includes('construct') || norm.includes('debris') || norm.includes('rubble') || norm.includes('c&d')) {
    return '/images/cleanup/construction_after_01.jpg';
  }
  if (norm.includes('organ') || norm.includes('wet') || norm.includes('bio') || norm.includes('food') || norm.includes('vegetable')) {
    return '/images/cleanup/organic_after_01.jpg';
  }
  if (norm.includes('plastic') || norm.includes('bottle') || norm.includes('poly')) {
    return '/images/cleanup/plastic_after_01.jpg';
  }
  if (norm.includes('hazard') || norm.includes('e-waste') || norm.includes('electronic') || norm.includes('chem') || norm.includes('medic') || norm.includes('battery')) {
    return '/images/cleanup/hazardous_after_01.jpg';
  }
  if (norm.includes('house') || norm.includes('domest') || norm.includes('resident')) {
    return '/images/cleanup/household_after_01.jpg';
  }
  return '/images/cleanup/mixed_after_01.jpg';
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
