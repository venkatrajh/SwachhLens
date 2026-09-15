import React from 'react';
import type { Report } from '../types/report';
import { PriorityBadge } from './ui/PriorityBadge';
import { useTranslation } from 'react-i18next';
import { Sparkles, Gauge, Box, Percent, Clock, AlertTriangle, Recycle } from 'lucide-react';

interface AIResultCardProps {
  report: Report;
}

export const AIResultCard: React.FC<AIResultCardProps> = ({ report }) => {
  const { t } = useTranslation();

  // Check if genuine AI analysis data is available
  const hasAiData = Boolean(
    report.status !== 'pending' &&
    (report.waste_type || (report.severity_score !== undefined && report.severity_score !== null))
  );

  if (!hasAiData) {
    return (
      <div className="bg-white dark:bg-[#14221B] rounded-2xl p-4 border border-[#DCE7E1] dark:border-[#294037] shadow-card space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE7E1]/80 dark:border-[#294037]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132] dark:text-[#39B77A]">
              {t('result.aiAnalysis', 'AI Analysis')}
            </h2>
          </div>
          <PriorityBadge priority={report.priority || 'medium'} size="md" />
        </div>

        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-left space-y-1.5">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
            {t('result.aiPendingTitle', 'AI Analysis Pending')}
          </span>
          <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] leading-relaxed">
            {t(
              'result.aiPendingDesc',
              'Your report has been saved successfully and is awaiting automated triage or municipal review.'
            )}
          </p>
        </div>
      </div>
    );
  }

  const volumeKey = `volume.${report.volume_level || 'small'}`;
  const volumeLabel = report.volume_level ? t(volumeKey, report.volume_level) : null;

  const displaySeverity = (() => {
    const raw = report.severity_score;
    if (raw === undefined || raw === null || isNaN(Number(raw))) return null;
    const num = Number(raw);
    const normalized = num > 10 ? num / 10 : num;
    return (Math.round(normalized * 10) / 10).toFixed(1);
  })();

  return (
    <div className="bg-white dark:bg-[#14221B] rounded-2xl p-4 border border-[#DCE7E1] dark:border-[#294037] shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCE7E1]/80 dark:border-[#294037]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132] dark:text-[#39B77A]">
            {t('result.aiAnalysis', 'AI Analysis')}
          </h2>
        </div>
        <PriorityBadge priority={report.priority} size="md" />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3.5">
        {report.waste_type && (
          <div className="col-span-2 p-3 bg-[#F7FAF8] dark:bg-[#1A2C23] rounded-xl border border-[#DCE7E1]/60 dark:border-[#294037]">
            <span className="text-[11px] font-semibold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block mb-0.5">
              {t('result.wasteType', 'Waste Type')}
            </span>
            <span className="text-base font-bold text-[#17211B] dark:text-[#F2F7F4]">
              {report.waste_type}
            </span>
          </div>
        )}

        {volumeLabel && (
          <div className="p-3 bg-[#F7FAF8] dark:bg-[#1A2C23] rounded-xl border border-[#DCE7E1]/60 dark:border-[#294037]">
            <div className="flex items-center gap-1.5 text-[#64736A] dark:text-[#A9BBB1] mb-1">
              <Box className="w-3.5 h-3.5 text-[#168A5B] dark:text-[#39B77A]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {t('result.volume', 'Volume')}
              </span>
            </div>
            <span className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4] capitalize">
              {volumeLabel}
            </span>
          </div>
        )}

        {displaySeverity !== null && (
          <div className="p-3 bg-[#F7FAF8] dark:bg-[#1A2C23] rounded-xl border border-[#DCE7E1]/60 dark:border-[#294037]">
            <div className="flex items-center gap-1.5 text-[#64736A] dark:text-[#A9BBB1] mb-1">
              <Gauge className="w-3.5 h-3.5 text-[#E56B2F]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {t('result.severity', 'Severity')}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-[#17211B] dark:text-[#F2F7F4]">
                {displaySeverity}
              </span>
              <span className="text-xs text-[#64736A] dark:text-[#A9BBB1] font-medium">/ 10</span>
            </div>
          </div>
        )}

        {report.confidence !== undefined && report.confidence !== null && report.confidence > 0 && (
          <div className="col-span-2 flex items-center justify-between px-3 py-2 bg-[#EAF6EF]/50 dark:bg-[#1A2C23] rounded-xl border border-[#168A5B]/15 dark:border-[#39B77A]/20">
            <div className="flex items-center gap-1.5 text-xs text-[#0F5132] dark:text-[#39B77A] font-semibold">
              <Percent className="w-3.5 h-3.5 text-[#168A5B] dark:text-[#39B77A]" />
              <span>{t('result.confidence', 'Confidence')}</span>
            </div>
            <span className="text-xs font-extrabold text-[#168A5B] dark:text-[#39B77A]">
              {Math.round(report.confidence * 100)}%
            </span>
          </div>
        )}

        {report.is_hazardous && (
          <div className="col-span-2 flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{t('result.urgentEscalation', 'Urgent Escalation Required')}</span>
          </div>
        )}

        {report.is_recyclable && (
          <div className="col-span-2 flex items-center gap-2 p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded-xl border border-teal-200 dark:border-teal-900/60 text-xs font-medium">
            <Recycle className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>{t('result.recyclingPartner', 'Recycling Partner Recommended')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
