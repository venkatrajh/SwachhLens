import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { LocationCard } from '../components/LocationCard';
import type { LocationData, SubmitReportPayload } from '../types/report';
import { Clock, Send, Sparkles } from 'lucide-react';

export const Preview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pendingPayload, setPendingPayload] = useState<SubmitReportPayload | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [description, setDescription] = useState<string>('');

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
      });
    } catch {
      navigate('/report');
    }
  }, [navigate]);

  const handleSubmit = () => {
    if (!pendingPayload) return;
    const finalPayload = {
      ...pendingPayload,
      description: description.trim() || undefined,
    };
    sessionStorage.setItem('swachhlens_pending_report', JSON.stringify(finalPayload));
    navigate('/analyzing');
  };

  if (!pendingPayload) return null;

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] flex flex-col justify-between">
      <TopHeader title="Review Report" showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border border-[#DCE7E1] shadow-card">
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
            <span className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
              GPS Location
            </span>
            <LocationCard location={location} />
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#DCE7E1] flex items-center justify-between text-xs shadow-card">
            <div className="flex items-center gap-2 text-[#64736A]">
              <Clock className="w-4 h-4 text-[#168A5B]" />
              <span className="font-semibold">{t('report.timestampAuto')}:</span>
            </div>
            <span className="font-mono text-[#17211B] font-bold text-[11px]">
              {new Date(pendingPayload.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
              Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder')}
              className="w-full p-3 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs resize-none"
            />
          </div>
        </div>

        <div className="pt-3 pb-2">
          <button
            onClick={handleSubmit}
            className="w-full py-4 px-6 rounded-2xl bg-[#168A5B] hover:bg-[#13754D] active:scale-[0.98] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>{t('report.submitReport')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
