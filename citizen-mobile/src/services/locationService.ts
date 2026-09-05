import type { LocationData } from '../types/report';

export const locationService = {
  /**
   * Request real browser GPS coordinates
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
   * Approximate human-readable locality name for civic display
   */
  formatLocationLabel(loc: LocationData): string {
    if (loc.address) return loc.address;
    return `${loc.latitude.toFixed(4)}°N, ${loc.longitude.toFixed(4)}°E (${loc.source === 'map' ? 'Map Pin' : 'GPS'})`;
  },
};
