import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Circle } from 'lucide-react';
import type { ReportStatus } from '../types/report';

interface TimelineProps {
  status: ReportStatus;
}

interface Step {
  id: string;
  labelKey: string;
  defaultLabel: string;
}

const STEPS: Step[] = [
  { id: 'submitted', labelKey: 'reportDetails.stepSubmitted', defaultLabel: 'Report Submitted' },
  { id: 'analyzed', labelKey: 'reportDetails.stepAnalyzed', defaultLabel: 'AI Analyzed' },
  { id: 'assigned', labelKey: 'reportDetails.stepAssigned', defaultLabel: 'Team Assigned' },
  { id: 'in_progress', labelKey: 'reportDetails.stepInProgress', defaultLabel: 'Cleanup In Progress' },
  { id: 'verified', labelKey: 'reportDetails.stepVerification', defaultLabel: 'Verification' },
];

export const Timeline: React.FC<TimelineProps> = ({ status }) => {
  const { t } = useTranslation();

  const getActiveIndex = (s: string): number => {
    switch (s.toLowerCase()) {
      case 'pending':
        return 0;
      case 'analyzing':
        return 1;
      case 'assigned':
        return 2;
      case 'in_progress':
        return 3;
      case 'completed':
      case 'verified':
        return 4;
      case 'duplicate':
        return 1;
      case 'escalated':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex(status);

  return (
    <div className="bg-white dark:bg-[#14221B] rounded-2xl p-4 border border-[#DCE7E1] dark:border-[#294037] shadow-card">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132] dark:text-[#39B77A] pb-3 border-b border-[#DCE7E1]/80 dark:border-[#294037] mb-4">
        {t('reportDetails.timelineTitle')}
      </h2>

      <div className="relative pl-6 space-y-6">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#DCE7E1] dark:bg-[#294037]" />

        {STEPS.map((step, index) => {
          const isDone = index < activeIndex || (index === 4 && (status === 'completed' || status === 'verified'));
          const isCurrent = index === activeIndex && status !== 'completed' && status !== 'verified';

          return (
            <div key={step.id} className="relative flex items-center gap-3">
              <div
                className={`absolute -left-[23px] w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? 'bg-[#168A5B] dark:bg-[#39B77A] border-[#168A5B] dark:border-[#39B77A] text-white dark:text-[#0D1712] shadow-xs'
                    : isCurrent
                    ? 'bg-white dark:bg-[#14221B] border-[#168A5B] dark:border-[#39B77A] text-[#168A5B] dark:text-[#39B77A] ring-4 ring-[#EAF6EF] dark:ring-[#1A2C23]'
                    : 'bg-white dark:bg-[#14221B] border-[#DCE7E1] dark:border-[#294037] text-[#64736A] dark:text-[#A9BBB1]'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-[#168A5B] dark:bg-[#39B77A] animate-pulse" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-transparent stroke-[1.5]" />
                )}
              </div>

              <div>
                <span
                  className={`text-xs block leading-tight ${
                    isDone || isCurrent
                      ? 'font-bold text-[#17211B] dark:text-[#F2F7F4]'
                      : 'text-[#64736A] dark:text-[#A9BBB1] font-medium'
                  }`}
                >
                  {t(step.labelKey, step.defaultLabel)}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-[#168A5B] dark:text-[#39B77A] font-semibold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>In progress</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
