import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  RefreshCw,
} from 'lucide-react';
import { formatReportId } from '../utils/reportUtils';

export const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const confettiTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchResult = async () => {
      if (!id) {
        navigate('/home', { replace: true });
        return;
      }

      // Fast initial render from temporary session storage to eliminate blank screen
      const sessionRaw = sessionStorage.getItem(`swachhlens_result_${id}`);
      if (sessionRaw) {
        try {
          const cached = JSON.parse(sessionRaw);
          if (isMounted) {
            setReport(cached);
            setIsLoading(false);
            if (!cached.duplicate && cached.status !== 'pending' && !confettiTriggeredRef.current) {
              confettiTriggeredRef.current = true;
              triggerConfetti();
            }
          }
        } catch {
          // ignore cache parse error
        }
      }

      // Fresh backend fetch takes precedence (prevents stale AI/status data)
      try {
        const freshReport = await apiService.getReport(id);
        if (isMounted) {
          setReport(freshReport);
          sessionStorage.setItem(`swachhlens_result_${id}`, JSON.stringify(freshReport));

          // Trigger confetti if fresh report is verified non-duplicate and non-pending
          if (!freshReport.duplicate && freshReport.status !== 'pending' && !confettiTriggeredRef.current) {
            confettiTriggeredRef.current = true;
            triggerConfetti();
          }
        }
      } catch (err: any) {
        console.error('Failed to load fresh result:', err);
        if (isMounted && !sessionRaw) {
          setError(
            err.response?.status === 404
              ? 'Report not found or has been removed.'
              : 'Failed to retrieve report data from server.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const triggerConfetti = () => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAF8] dark:bg-[#0D1712] text-xs text-[#64736A] dark:text-[#A9BBB1] gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#168A5B] dark:text-[#39B77A]" />
        <span>{t('common.loading', 'Loading report result...')}</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAF8] dark:bg-[#0D1712] text-center p-6 space-y-4">
        <h2 className="text-base font-bold text-[#17211B] dark:text-[#F2F7F4]">
          {error || 'Report Unavailable'}
        </h2>
        <button
          onClick={() => navigate('/home')}
          className="px-5 py-2.5 rounded-full bg-[#168A5B] text-white font-semibold text-xs shadow-md active:scale-95 transition-transform"
        >
          {t('common.backToHome', 'Back to Home')}
        </button>
      </div>
    );
  }

  const reportIdentifier =
    report.display_id || formatReportId(report.id, report.created_at || report.reported_at);

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between pb-6">
      <TopHeader title={t('result.reportSubmitted', 'REPORT SUBMITTED')} showBack={false} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1">
        {report.duplicate ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <h2 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                ⚠️ {t('result.duplicateTitle', 'Similar report already exists')}
              </h2>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {t(
                'result.duplicateDesc',
                'A report for this location and waste type was recently registered. Your submission has been linked to the existing issue.'
              )}
            </p>
            {report.linked_report_id && (
              <div className="pt-2 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/60">
                <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200 truncate max-w-[180px]">
                  {t('result.existingReport', 'Primary Issue')}: {report.linked_report_id.slice(0, 8)}...
                </span>
                <button
                  onClick={() => navigate(`/reports/${report.linked_report_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform shadow-xs"
                >
                  <span>{t('result.viewExistingReport', 'View Original')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : report.status === 'pending' ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-xs font-bold">Report Saved — AI Analysis Queued</span>
            </div>
            <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] leading-relaxed">
              Your report was successfully received. Automated triage is queued and will be verified by municipal staff.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-[#EAF6EF] dark:bg-[#1A2C23] rounded-2xl border border-[#168A5B]/30 dark:border-[#39B77A]/30 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#0F5132] dark:text-[#F2F7F4]">
                {t('result.newReportCreated', 'New report created')}
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold text-[#168A5B] dark:text-[#39B77A] px-2.5 py-0.5 rounded-md bg-white dark:bg-[#14221B] border border-[#168A5B]/20 dark:border-[#39B77A]/20">
              {reportIdentifier}
            </span>
          </div>
        )}

        {report.image_url && (
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-850 aspect-[16/9] border border-[#DCE7E1] dark:border-[#294037] shadow-card">
            <img
              src={report.image_url}
              alt="Reported Waste"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
              {reportIdentifier}
            </div>
          </div>
        )}

        <AIResultCard report={report} />

        <DecisionCard report={report} />

        <div className="space-y-2.5 pt-2 pb-4">
          <button
            onClick={() => navigate(`/reports/${report.id}`)}
            className="w-full py-4 px-6 rounded-2xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-extrabold text-sm flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            <span>{t('result.viewReportStatus', 'VIEW REPORT STATUS')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#14221B] hover:bg-stone-50 dark:hover:bg-[#1A2C23] active:scale-[0.98] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs flex items-center justify-center gap-2 border border-[#DCE7E1] dark:border-[#294037] shadow-card transition-all"
          >
            <Home className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            <span>{t('common.backToHome', 'Back to Home')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
