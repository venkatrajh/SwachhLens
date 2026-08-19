import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { AIResultCard } from '../components/AIResultCard';
import { DecisionCard } from '../components/DecisionCard';
import { apiService } from '../services/api';
import type { Report } from '../types/report';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Home,
  ExternalLink,
} from 'lucide-react';

export const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      try {
        const sessionRaw = sessionStorage.getItem(`swachhlens_result_${id}`);
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw);
          setReport(parsed);
          triggerConfetti(parsed.duplicate);
        } else {
          const fetched = await apiService.getReport(id);
          setReport(fetched);
          triggerConfetti(fetched.duplicate);
        }
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const triggerConfetti = (isDuplicate?: boolean) => {
    if (!isDuplicate) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#168A5B', '#22A06B', '#EAF6EF', '#2E8B57'],
          disableForReducedMotion: true,
        });
      } catch {
        // Safe fallback
      }
    }
  };

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] text-xs text-[#64736A]">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] flex flex-col justify-between">
      <TopHeader title={t('result.reportSubmitted')} showBack={false} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1">
        {report.duplicate ? (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h2 className="text-sm font-bold">
                ⚠️ {t('result.duplicateTitle')}
              </h2>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {t('result.duplicateDesc')}
            </p>
            {report.linked_report_id && (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-900">
                  {t('result.existingReport')}: {report.linked_report_id}
                </span>
                <button
                  onClick={() => navigate(`/reports/${report.linked_report_id}`)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span>{t('result.viewExistingReport')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-[#EAF6EF] rounded-2xl border border-[#168A5B]/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#168A5B] text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#0F5132]">
                {t('result.newReportCreated')}
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold text-[#168A5B] px-2 py-0.5 rounded-md bg-white border border-[#168A5B]/20">
              {report.id}
            </span>
          </div>
        )}

        {report.image_url && (
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[16/9] border border-[#DCE7E1] shadow-card">
            <img
              src={report.image_url}
              alt="Reported Waste"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
              ID: {report.id}
            </div>
          </div>
        )}

        <AIResultCard report={report} />

        <DecisionCard report={report} />

        <div className="space-y-2.5 pt-2 pb-4">
          <button
            onClick={() => navigate(`/reports/${report.id}`)}
            className="w-full py-4 px-6 rounded-2xl bg-[#168A5B] hover:bg-[#13754D] active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            <span>{t('result.viewReportStatus')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 active:scale-[0.98] text-[#17211B] font-bold text-xs flex items-center justify-center gap-2 border border-[#DCE7E1] shadow-card transition-all"
          >
            <Home className="w-4 h-4 text-[#64736A]" />
            <span>{t('common.backToHome')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
