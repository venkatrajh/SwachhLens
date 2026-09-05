/**
 * Format raw UUID and created date into human-friendly format: SL-2026-9E3019
 */
export function formatReportId(id?: string | null, dateStr?: string | Date | null): string {
  if (!id) return 'SL-2026-UNKNOWN';
  if (id.startsWith('SL-')) return id;

  let year = 2026;
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getFullYear())) {
        year = d.getFullYear();
      }
    } catch {
      // fallback to 2026
    }
  }

  const cleanHex = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  return `SL-${year}-${cleanHex || '000000'}`;
}

/**
 * Return deterministic cleanup image path for a waste category and report ID
 */
export function getCleanupImage(wasteType?: string | null, _reportId?: string | null): string {
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
export function formatLocation(
  addressLabel?: string | null,
  latitude?: number | null,
  longitude?: number | null
): { primary: string; secondary: string } {
  if (addressLabel && addressLabel.trim() && !addressLabel.includes('not provided')) {
    return {
      primary: addressLabel.trim(),
      secondary: latitude != null && longitude != null
        ? `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`
        : '',
    };
  }
  if (latitude != null && longitude != null) {
    return {
      primary: `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`,
      secondary: 'GPS Coordinates',
    };
  }
  return {
    primary: 'Location pending',
    secondary: '',
  };
}
