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

/**
 * Resolves local/relative media URLs (e.g. /media/...) to full backend URLs.
 * Preserves external http(s) and data URI strings untouched.
 */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/media/')) {
    return `http://localhost:8000${trimmed}`;
  }
  if (trimmed.startsWith('media/')) {
    return `http://localhost:8000/${trimmed}`;
  }
  return trimmed;
}

