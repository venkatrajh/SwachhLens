import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import type { LocationData } from '../types/report';

interface LocationCardProps {
  location: LocationData | null;
  error?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  error,
  isLoading = false,
  onRetry,
}) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 space-y-2.5">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
            {t('report.locationErrorTitle')}
          </h2>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          {t('report.locationErrorDesc')}
        </p>
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
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-[#EAF6EF] rounded-xl border border-[#168A5B]/20">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#168A5B] text-white flex items-center justify-center shadow-xs">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#0F5132] block">
            {isLoading ? t('report.locationDetecting') : `✓ ${t('report.locationCaptured')}`}
          </span>
          {location && (
            <span className="text-[10px] text-[#64736A] font-mono">
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </span>
          )}
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-[#168A5B] hover:text-[#0F5132] px-2 py-1"
          aria-label="Refresh Location"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};
