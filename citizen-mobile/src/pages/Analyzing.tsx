import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NatureBackground } from '../components/layout/NatureBackground';
import { apiService } from '../services/api';
import type { Report, SubmitReportPayload } from '../types/report';
import { Check, Sparkles, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export const Analyzing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Step 1: Submitting to server
  // Step 2: Running AI triage / verification
  // Step 3: Finalizing result
  const [step, setStep] = useState<number>(1);
  const [stepLabel, setStepLabel] = useState<string>('Submitting report...');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const processReport = async () => {
    const raw = sessionStorage.getItem('swachhlens_pending_report');
    if (!raw) {
      navigate('/report', { replace: true });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStep(1);
    setStepLabel(t('analyzing.step1', 'Report evidence uploaded ✓'));

    try {
      const payload: SubmitReportPayload = JSON.parse(raw);

      // Transition to Step 2: Processing with backend decision pipeline
      setStep(2);
      setStepLabel(t('analyzing.step2', 'AI analyzing waste & severity...'));

      // Real synchronous submission to POST /api/v1/reports
      const report: Report = await apiService.submitReport(payload);

      if (!isMountedRef.current) return;

      // Final Step 3: Transition to results based directly on backend response
      setStep(3);
      if (report.status === 'duplicate') {
        setStepLabel(t('result.duplicateTitle', 'Similar report already exists'));
      } else if (report.status === 'pending') {
        setStepLabel(t('result.aiPendingTitle', 'AI Analysis Pending'));
      } else {
        setStepLabel(t('analyzing.step3', 'Decision generated ✓'));
      }

      // Store in sessionStorage as navigation resilience fallback
      sessionStorage.setItem(`swachhlens_result_${report.id}`, JSON.stringify(report));
      sessionStorage.removeItem('swachhlens_pending_report');

      // Brief visual confirmation before route transition
      await sleep(500);
      if (isMountedRef.current) {
        navigate(`/result/${report.id}`, { replace: true });
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      if (isMountedRef.current) {
        setIsSubmitting(false);
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          'Failed to submit waste report. Please check your connection and try again.';
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    processReport();

    return () => {
      isMountedRef.current = false;
    };
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
        {/* Step 1 */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step > 1
                ? 'bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] shadow-xs'
                : step === 1 && !error
                ? 'bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] ring-4 ring-[#EAF6EF] dark:ring-[#1A2C23]'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
            }`}
          >
            {step > 1 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : step === 1 && !error ? (
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
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
              {t('analyzing.step1', 'Evidence Uploaded')}
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step > 2
                ? 'bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] shadow-xs'
                : step === 2 && !error
                ? 'bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] ring-4 ring-[#EAF6EF] dark:ring-[#1A2C23]'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
            }`}
          >
            {step > 2 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : step === 2 && !error ? (
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
              {t('analyzing.step2', 'AI Analysis & Triage')}
            </span>
          </div>
        </div>

        {/* Step 3 */}
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
              {step === 3 ? stepLabel : t('analyzing.step3', 'Decision Generated')}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900/60 text-xs text-center space-y-3 shadow-md">
          <div className="flex items-center justify-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Submission Failed</span>
          </div>
          <p className="text-[11px] leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => navigate('/report')}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#14221B] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Report</span>
            </button>
            <button
              onClick={processReport}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold active:scale-95 transition-transform"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
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
