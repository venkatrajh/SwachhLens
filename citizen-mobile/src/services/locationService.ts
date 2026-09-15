import type { LocationData } from '../types/report';

/**
 * Service for acquiring device geolocation coordinates and formatting location displays.
 */
export const locationService = {
  /**
   * Request high-accuracy GPS coordinates from the browser's Geolocation API.
   *
   * @returns Promise resolving to a standardized LocationData object.
   * @throws GeolocationPositionError if permission is denied, position is unavailable, or request times out.
   * @throws Error if Geolocation API is not supported by the browser.
   */
  getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'current',
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            address: 'Detected GPS Location',
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  },

  /**
   * Format location data into a concise, human-readable coordinate or address string.
   *
   * @param loc - LocationData object containing coordinates, address, and source.
   * @returns Formatted string representation for civic display.
   */
  formatLocationLabel(loc: LocationData): string {
    if (loc.address) return loc.address;
    return `${loc.latitude.toFixed(4)}°N, ${loc.longitude.toFixed(4)}°E (${loc.source === 'map' ? 'Map Pin' : 'GPS'})`;
  },
};
