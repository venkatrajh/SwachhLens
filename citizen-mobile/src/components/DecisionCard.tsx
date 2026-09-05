import React from 'react';
import type { Report } from '../types/report';
import { useTranslation } from 'react-i18next';
import { Users, Truck, Compass, Recycle, AlertTriangle } from 'lucide-react';

interface DecisionCardProps {
  report: Report;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ report }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#14221B] rounded-2xl p-4 border border-[#DCE7E1] dark:border-[#294037] shadow-card space-y-3">
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#DCE7E1]/80 dark:border-[#294037]">
        <div className="w-7 h-7 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
          <Compass className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132] dark:text-[#39B77A]">
          {t('result.recommendedResponse')}
        </h2>
      </div>

      <div className="space-y-2.5">
        {report.recommended_team && (
          <div className="flex items-start gap-3 p-2.5 bg-[#F7FAF8] dark:bg-[#1A2C23] rounded-xl border border-[#DCE7E1]/60 dark:border-[#294037]">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64736A] dark:text-[#A9BBB1] block">
                {t('result.assignedTeam')}
              </span>
              <span className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4]">
                {report.recommended_team}
              </span>
            </div>
          </div>
        )}

        {report.recommended_vehicle && (
          <div className="flex items-start gap-3 p-2.5 bg-[#F7FAF8] dark:bg-[#1A2C23] rounded-xl border border-[#DCE7E1]/60 dark:border-[#294037]">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64736A] dark:text-[#A9BBB1] block">
                {t('result.vehicle')}
              </span>
              <span className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4]">
                {report.recommended_vehicle}
              </span>
            </div>
          </div>
        )}

        {report.recommended_action && (
          <div className="p-3 bg-[#EAF6EF]/60 dark:bg-[#1A2C23] rounded-xl border border-[#168A5B]/20 dark:border-[#39B77A]/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0F5132] dark:text-[#39B77A] block mb-0.5">
              {t('result.action')}
            </span>
            <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] leading-snug block">
              {report.recommended_action}
            </span>
          </div>
        )}

        {report.is_recyclable && (
          <div className="flex items-center gap-2 p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded-xl border border-teal-200 dark:border-teal-900/60 text-xs font-medium">
            <Recycle className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>{t('result.recyclingPartner')}</span>
          </div>
        )}

        {report.is_hazardous && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{t('result.urgentEscalation')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
