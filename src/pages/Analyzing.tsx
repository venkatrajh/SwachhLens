import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    let isMounted = true;

    const processReport = async () => {
      const raw = sessionStorage.getItem('swachhlens_pending_report');
      if (!raw) {
        navigate('/report');
        return;
      }

      try {
        const payload: SubmitReportPayload = JSON.parse(raw);

        setStep(1);

        setTimeout(() => {
          if (isMounted) setStep(2);
        }, 600);

        const createdReport = await apiService.submitReport(payload);

        if (isMounted) {
          setStep(3);
          sessionStorage.setItem(
            `swachhlens_result_${createdReport.id}`,
            JSON.stringify(createdReport)
          );
          sessionStorage.removeItem('swachhlens_pending_report');

          setTimeout(() => {
            if (isMounted) {
              navigate(`/result/${createdReport.id}`, { replace: true });
            }
          }, 800);
        }
      } catch (err: any) {
        console.error('Submission failed:', err);
        if (isMounted) {
          setError(err.message || 'Failed to analyze waste report');
        }
      }
    };

    processReport();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] flex flex-col justify-between p-6 overflow-hidden">
      <NatureBackground />

      <div className="relative z-10 flex flex-col items-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center shadow-xs border border-[#168A5B]/20 mb-4 animate-pulse-subtle">
          <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h1 className="text-xl font-black text-[#0F5132] tracking-tight text-center">
          {t('analyzing.title')}
        </h1>
        <p className="text-xs text-[#64736A] font-medium text-center mt-1 max-w-[260px]">
          {t('analyzing.aiSubtitle')}
        </p>
      </div>

      <div className="relative z-10 my-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-[#DCE7E1] shadow-floating space-y-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step >= 1
                ? 'bg-[#168A5B] text-white shadow-xs'
                : 'bg-stone-100 text-stone-400'
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
                step >= 1 ? 'font-bold text-[#17211B]' : 'text-[#64736A]'
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
                ? 'bg-[#168A5B] text-white shadow-xs'
                : step === 2
                ? 'bg-[#EAF6EF] text-[#168A5B] ring-4 ring-[#EAF6EF]'
                : 'bg-stone-100 text-stone-400'
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
                step >= 2 ? 'font-bold text-[#17211B]' : 'text-[#64736A]'
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
                ? 'bg-[#168A5B] text-white shadow-xs'
                : 'bg-stone-100 text-stone-400'
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
                step === 3 ? 'font-bold text-[#17211B]' : 'text-[#64736A]'
              }`}
            >
              {t('analyzing.step3')}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative z-10 p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs text-center space-y-2">
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
        <span className="text-[11px] font-semibold text-[#64736A] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#168A5B]" />
          <span>SwachhLens Civic Decision Engine</span>
        </span>
      </div>
    </div>
  );
};
