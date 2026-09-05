import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertCircle, RefreshCw, Map, Navigation } from 'lucide-react';
import type { LocationData } from '../types/report';

interface LocationCardProps {
  location: LocationData | null;
  error?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onSelectOnMap?: () => void;
  onUseCurrentLocation?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  error,
  isLoading = false,
  onRetry,
  onSelectOnMap,
  onUseCurrentLocation,
}) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2.5">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            {t('report.locationErrorTitle')}
          </h2>
        </div>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          {t('report.locationErrorDesc')}
        </p>
        <div className="flex gap-2 pt-1">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('report.enableLocation')}</span>
            </button>
          )}
          {onSelectOnMap && (
            <button
              type="button"
              onClick={onSelectOnMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#14221B] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t('location.selectOnMap', 'Select on Map')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const isMapSource = location?.source === 'map';

  return (
    <div className="bg-[#EAF6EF] dark:bg-[#1A2C23] rounded-2xl p-3.5 border border-[#168A5B]/20 dark:border-[#39B77A]/20 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center shadow-xs flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#0F5132] dark:text-[#F2F7F4] block">
                {isLoading
                  ? t('report.locationDetecting')
                  : isMapSource
                  ? `✓ ${t('location.locationSelected', 'Location selected on map')}`
                  : `✓ ${t('report.locationCaptured')}`}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-white/70 dark:bg-[#14221B] text-[#168A5B] dark:text-[#39B77A] border border-[#168A5B]/20">
                {isMapSource ? 'Map Pin' : 'GPS'}
              </span>
            </div>
            {location && (
              <div className="mt-0.5">
                {location.address && (
                  <span className="text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] block leading-snug">
                    {location.address}
                  </span>
                )}
                <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] font-mono block">
                  {location.latitude.toFixed(5)}°, {location.longitude.toFixed(5)}°
                </span>
              </div>
            )}
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-[#168A5B] dark:text-[#39B77A] hover:opacity-80 p-1"
            aria-label="Refresh Location"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Dual action buttons: Use Current Location / Select on Map (Section 2) */}
      {(onSelectOnMap || onUseCurrentLocation) && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#168A5B]/15 dark:border-[#39B77A]/15">
          {onUseCurrentLocation && (
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                !isMapSource
                  ? 'bg-[#168A5B] text-white shadow-xs'
                  : 'bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] border border-[#DCE7E1] dark:border-[#294037]'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>{t('location.useCurrentLocation', 'Current Location')}</span>
            </button>
          )}

          {onSelectOnMap && (
            <button
              type="button"
              onClick={onSelectOnMap}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isMapSource
                  ? 'bg-[#168A5B] text-white shadow-xs'
                  : 'bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] border border-[#DCE7E1] dark:border-[#294037]'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>{t('location.selectOnMap', 'Select on Map')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
