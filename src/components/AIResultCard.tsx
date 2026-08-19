import React from 'react';
import type { Report } from '../types/report';
import { PriorityBadge } from './ui/PriorityBadge';
import { useTranslation } from 'react-i18next';
import { Sparkles, Gauge, Box, Percent } from 'lucide-react';

interface AIResultCardProps {
  report: Report;
}

export const AIResultCard: React.FC<AIResultCardProps> = ({ report }) => {
  const { t } = useTranslation();

  const volumeKey = `volume.${report.volume}`;
  const volumeLabel = t(volumeKey, report.volume);

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#DCE7E1] shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-[#DCE7E1]/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132]">
            {t('result.aiAnalysis')}
          </h2>
        </div>
        <PriorityBadge priority={report.priority} size="md" />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3.5">
        <div className="col-span-2 p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7E1]/60">
          <span className="text-[11px] font-semibold text-[#64736A] uppercase tracking-wider block mb-0.5">
            {t('result.wasteType')}
          </span>
          <span className="text-base font-bold text-[#17211B]">
            {report.waste_type}
          </span>
        </div>

        <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7E1]/60">
          <div className="flex items-center gap-1.5 text-[#64736A] mb-1">
            <Box className="w-3.5 h-3.5 text-[#168A5B]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {t('result.volume')}
            </span>
          </div>
          <span className="text-sm font-bold text-[#17211B] capitalize">
            {volumeLabel}
          </span>
        </div>

        <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7E1]/60">
          <div className="flex items-center gap-1.5 text-[#64736A] mb-1">
            <Gauge className="w-3.5 h-3.5 text-[#E56B2F]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {t('result.severity')}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-[#17211B]">
              {report.severity_score}
            </span>
            <span className="text-xs text-[#64736A] font-medium">/ 10</span>
          </div>
        </div>

        {report.confidence !== undefined && (
          <div className="col-span-2 flex items-center justify-between px-3 py-2 bg-[#EAF6EF]/50 rounded-xl border border-[#168A5B]/15">
            <div className="flex items-center gap-1.5 text-xs text-[#0F5132] font-semibold">
              <Percent className="w-3.5 h-3.5 text-[#168A5B]" />
              <span>{t('result.confidence')}</span>
            </div>
            <span className="text-xs font-extrabold text-[#168A5B]">
              {Math.round(report.confidence * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
