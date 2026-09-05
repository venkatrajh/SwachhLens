import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { LocationCard } from '../components/LocationCard';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { locationService } from '../services/locationService';
import type { LocationData, SubmitReportPayload } from '../types/report';
import { Clock, Send, Sparkles, Loader2 } from 'lucide-react';

export const Preview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pendingPayload, setPendingPayload] = useState<SubmitReportPayload | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('swachhlens_pending_report');
    if (!raw) {
      navigate('/report');
      return;
    }
    try {
      const payload: SubmitReportPayload = JSON.parse(raw);
      setPendingPayload(payload);
      setDescription(payload.description || '');
      setLocation({
        latitude: payload.latitude,
        longitude: payload.longitude,
        source: 'current',
      });
    } catch {
      navigate('/report');
    }
  }, [navigate]);

  const handleConfirmMapLocation = (chosenLoc: LocationData) => {
    setLocation(chosenLoc);
    setIsMapPickerOpen(false);
    setLocationError(null);
  };

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      console.warn('Geolocation failed:', err);
      setLocationError('Unable to detect GPS location. Please select location on map.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!pendingPayload) return;
    if (!location) {
      setLocationError('Location is required before submitting.');
      return;
    }
    setIsSubmitting(true);
    const finalPayload = {
      ...pendingPayload,
      latitude: location.latitude,
      longitude: location.longitude,
      description: description.trim() || undefined,
    };
    sessionStorage.setItem('swachhlens_pending_report', JSON.stringify(finalPayload));
    navigate('/analyzing');
  };

  if (!pendingPayload) return null;

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader title="Review Report" showBack={true} />
      <NatureBackground />

      {/* Map Location Picker Overlay */}
      {isMapPickerOpen && (
        <MapLocationPicker
          initialLocation={location}
          onConfirm={handleConfirmMapLocation}
          onCancel={() => setIsMapPickerOpen(false)}
        />
      )}

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border border-[#DCE7E1] dark:border-[#294037] shadow-card">
            {pendingPayload.image ? (
              <img
                src={typeof pendingPayload.image === 'string' ? pendingPayload.image : ''}
                alt="Captured Waste"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                Video attached
              </div>
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#22A06B]" />
              <span>Ready for AI analysis</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block">
              {t('location.title', 'Report Location')}
            </span>
            <LocationCard
              location={location}
              error={locationError}
              isLoading={isDetectingLocation}
              onRetry={handleUseCurrentLocation}
              onSelectOnMap={() => setIsMapPickerOpen(true)}
              onUseCurrentLocation={handleUseCurrentLocation}
            />
          </div>

          <div className="p-3 bg-white dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037] flex items-center justify-between text-xs shadow-card">
            <div className="flex items-center gap-2 text-[#64736A] dark:text-[#A9BBB1]">
              <Clock className="w-4 h-4 text-[#168A5B] dark:text-[#39B77A]" />
              <span className="font-semibold">{t('report.timestampAuto')}:</span>
            </div>
            <span className="font-mono text-[#17211B] dark:text-[#F2F7F4] font-bold text-[11px]">
              {new Date(pendingPayload.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block">
              Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder')}
              className="w-full p-3 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs resize-none"
            />
          </div>
        </div>

        <div className="pt-3 pb-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white dark:text-[#0D1712] font-extrabold text-base flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
                <span>{t('common.submitting', 'Submitting...')}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 stroke-[2.5]" />
                <span>{t('report.submitReport')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
