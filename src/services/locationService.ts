import type { LocationData } from '../types/report';

export const locationService = {
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
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
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

  getMockLocation(): LocationData {
    return {
      latitude: 13.0827 + (Math.random() - 0.5) * 0.01,
      longitude: 80.2707 + (Math.random() - 0.5) * 0.01,
      accuracy: 15,
      timestamp: Date.now(),
    };
  },
};
