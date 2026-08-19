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
    <div className="bg-white rounded-2xl p-4 border border-[#DCE7E1] shadow-card space-y-3">
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#DCE7E1]/80">
        <div className="w-7 h-7 rounded-lg bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center">
          <Compass className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132]">
          {t('result.recommendedResponse')}
        </h2>
      </div>

      <div className="space-y-2.5">
        {report.recommended_team && (
          <div className="flex items-start gap-3 p-2.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7E1]/60">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64736A] block">
                {t('result.assignedTeam')}
              </span>
              <span className="text-sm font-bold text-[#17211B]">
                {report.recommended_team}
              </span>
            </div>
          </div>
        )}

        {report.recommended_vehicle && (
          <div className="flex items-start gap-3 p-2.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7E1]/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64736A] block">
                {t('result.vehicle')}
              </span>
              <span className="text-sm font-bold text-[#17211B]">
                {report.recommended_vehicle}
              </span>
            </div>
          </div>
        )}

        {report.recommended_action && (
          <div className="p-3 bg-[#EAF6EF]/60 rounded-xl border border-[#168A5B]/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0F5132] block mb-0.5">
              {t('result.action')}
            </span>
            <span className="text-xs font-bold text-[#17211B] leading-snug block">
              {report.recommended_action}
            </span>
          </div>
        )}

        {report.is_recyclable && (
          <div className="flex items-center gap-2 p-2.5 bg-teal-50 text-teal-800 rounded-xl border border-teal-200 text-xs font-medium">
            <Recycle className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{t('result.recyclingPartner')}</span>
          </div>
        )}

        {report.is_hazardous && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{t('result.urgentEscalation')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
