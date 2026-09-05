import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NatureBackground } from '../components/layout/NatureBackground';
import { apiService } from '../services/api';
import type { SubmitReportPayload } from '../types/report';
import { Check, Sparkles, Loader2, ShieldCheck } from 'lucide-react';

export const Analyzing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const hasSubmittedRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const processReport = async () => {
      const raw = sessionStorage.getItem('swachhlens_pending_report');
      if (!raw) {
        navigate('/report', { replace: true });
        return;
      }

      try {
        const payload: SubmitReportPayload = JSON.parse(raw);

        setStep(1);

        const stepTimer = setTimeout(() => {
          setStep(2);
        }, 600);

        const createdReport = await apiService.submitReport(payload);
        clearTimeout(stepTimer);

        setStep(3);
        sessionStorage.setItem(
          `swachhlens_result_${createdReport.id}`,
          JSON.stringify(createdReport)
        );
        sessionStorage.removeItem('swachhlens_pending_report');

        setTimeout(() => {
          navigate(`/result/${createdReport.id}`, { replace: true });
        }, 800);
      } catch (err: any) {
        console.error('Submission failed:', err);
        hasSubmittedRef.current = false;
        setError(err.message || 'Failed to analyze waste report');
      }
    };

    processReport();
  }, [navigate]);

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between p-6 overflow-hidden">
      <NatureBackground />

      <div className="relative z-10 flex flex-col items-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center shadow-xs border border-[#168A5B]/20 dark:border-[#39B77A]/20 mb-4 animate-pulse-subtle">
          <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h1 className="text-xl font-black text-[#0F5132] dark:text-[#39B77A] tracking-tight text-center">
          {t('analyzing.title')}
        </h1>
        <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] font-medium text-center mt-1 max-w-[260px]">
          {t('analyzing.aiSubtitle')}
        </p>
      </div>

      <div className="relative z-10 my-auto bg-white/95 dark:bg-[#14221B]/95 backdrop-blur-md rounded-3xl p-6 border border-[#DCE7E1] dark:border-[#294037] shadow-floating space-y-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step >= 1
                ? 'bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
            }`}
          >
            {step >= 1 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <span className="text-xs font-bold">1</span>
            )}
          </div>
          <div>
            <span
              className={`text-sm block ${
                step >= 1 ? 'font-bold text-[#17211B] dark:text-[#F2F7F4]' : 'text-[#64736A] dark:text-[#A9BBB1]'
              }`}
            >
              {t('analyzing.step1')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step > 2
                ? 'bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] shadow-xs'
                : step === 2
                ? 'bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] ring-4 ring-[#EAF6EF] dark:ring-[#1A2C23]'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
            }`}
          >
            {step > 2 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : step === 2 ? (
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
            ) : (
              <span className="text-xs font-bold">2</span>
            )}
          </div>
          <div>
            <span
              className={`text-sm block ${
                step >= 2 ? 'font-bold text-[#17211B] dark:text-[#F2F7F4]' : 'text-[#64736A] dark:text-[#A9BBB1]'
              }`}
            >
              {t('analyzing.step2')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step === 3
                ? 'bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
            }`}
          >
            {step === 3 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <span className="text-xs font-bold">3</span>
            )}
          </div>
          <div>
            <span
              className={`text-sm block ${
                step === 3 ? 'font-bold text-[#17211B] dark:text-[#F2F7F4]' : 'text-[#64736A] dark:text-[#A9BBB1]'
              }`}
            >
              {t('analyzing.step3')}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900/60 text-xs text-center space-y-2">
          <p>{error}</p>
          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      <div className="relative z-10 text-center pb-2">
        <span className="text-[11px] font-semibold text-[#64736A] dark:text-[#A9BBB1] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#168A5B] dark:text-[#39B77A]" />
          <span>SwachhLens Civic Decision Engine</span>
        </span>
      </div>
    </div>
  );
};
