import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Check, ChevronLeft, Sparkles } from 'lucide-react';
import type { LocationData } from '../types/report';
import { locationService } from '../services/locationService';

interface MapLocationPickerProps {
  initialLocation?: LocationData | null;
  onConfirm: (location: LocationData) => void;
  onCancel: () => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialLocation,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const defaultLat = initialLocation?.latitude || 13.0827;
  const defaultLng = initialLocation?.longitude || 80.2707;

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });

  const [addressLabel, setAddressLabel] = useState<string>(
    initialLocation?.address || 'Pinned Location'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create custom SVG pin icon
    const customPinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #168A5B; color: white; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(22,138,91,0.4); border: 3px solid white;">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style="width: 12px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; margin-top: -2px;"></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    });

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 16,
      zoomControl: false,
    });

    // Standard OpenStreetMap tiles (no API key required, reliable, water-mark free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Draggable Marker
    const marker = L.marker([defaultLat, defaultLng], {
      icon: customPinIcon,
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCurrentCoords({ lat: pos.lat, lng: pos.lng });
      setAddressLabel('Selected on Map');
      setGpsError(null);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      setAddressLabel('Selected on Map');
      setGpsError(null);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger invalidation on layout render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      const gpsLoc = await locationService.getCurrentLocation();
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([gpsLoc.latitude, gpsLoc.longitude], 17);
        markerRef.current.setLatLng([gpsLoc.latitude, gpsLoc.longitude]);
        setCurrentCoords({ lat: gpsLoc.latitude, lng: gpsLoc.longitude });
        setAddressLabel('Detected GPS Location');
      }
    } catch (err) {
      console.warn('GPS location request failed:', err);
      setGpsError('Unable to detect GPS location. Please drag the pin on the map to set your location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = () => {
    const finalLocation: LocationData = {
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      source: 'map',
      address: addressLabel,
      timestamp: Date.now(),
    };
    onConfirm(finalLocation);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between max-w-[440px] mx-auto animate-in fade-in duration-200">
      {/* Map Header */}
      <header className="px-4 py-3 bg-white/90 dark:bg-[#14221B]/90 backdrop-blur-md border-b border-[#DCE7E1] dark:border-[#294037] flex items-center justify-between z-10 safe-top">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4]">
              {t('location.selectOnMap', 'Select on Map')}
            </h1>
            <p className="text-[10px] text-[#64736A] dark:text-[#A9BBB1]">
              Pan or drag the pin to the waste spot
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#0F5132] dark:text-[#39B77A] border border-[#168A5B]/30 text-xs font-semibold active:scale-95 transition-transform"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>GPS</span>
        </button>
      </header>

      {gpsError && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium z-10 flex items-center justify-between">
          <span>{gpsError}</span>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="ml-2 font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map Viewport */}
      <div className="relative flex-1 w-full bg-[#e5e3df]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating guidance helper */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#14221B]/95 backdrop-blur-md shadow-md border border-[#DCE7E1] dark:border-[#294037] text-[11px] font-bold text-[#0F5132] dark:text-[#39B77A] flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tap or drag marker to set exact location</span>
        </div>
      </div>

      {/* Confirmation Bottom Card */}
      <div className="p-4 bg-white dark:bg-[#14221B] border-t border-[#DCE7E1] dark:border-[#294037] space-y-3 z-10 safe-bottom shadow-2xl">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F7FAF8] dark:bg-[#1A2C23] border border-[#DCE7E1] dark:border-[#294037]">
          <div className="w-8 h-8 rounded-lg bg-[#168A5B] text-white flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-[#64736A] dark:text-[#A9BBB1] block">
              Selected Waste Location
            </span>
            <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] truncate block">
              {currentCoords.lat.toFixed(5)}°N, {currentCoords.lng.toFixed(5)}°E
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F7FAF8] dark:bg-[#1A2C23] text-[#64736A] dark:text-[#A9BBB1] text-xs font-bold border border-[#DCE7E1] dark:border-[#294037]"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-3 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-floating active:scale-95 transition-transform"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('location.confirmLocation', 'Use This Location')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
