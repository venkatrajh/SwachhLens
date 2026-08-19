import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Report } from '../types/report';
import { PriorityBadge } from './ui/PriorityBadge';
import { StatusBadge } from './ui/StatusBadge';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ReportCardProps {
  report: Report;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const navigate = useNavigate();

  const formattedDate = (() => {
    try {
      const d = new Date(report.timestamp);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return report.timestamp;
    }
  })();

  return (
    <div
      onClick={() => navigate(`/reports/${report.id}`)}
      className="bg-white dark:bg-[#14221B] rounded-2xl p-3.5 border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex gap-3 items-center group"
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F7FAF8] dark:bg-[#0D1712] flex-shrink-0 border border-[#DCE7E1]/80 dark:border-[#294037]">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt={report.waste_type}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#64736A] dark:text-[#A9BBB1]">
            <ImageIcon className="w-6 h-6 opacity-40" />
          </div>
        )}
        {report.duplicate && (
          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
            DUP
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-mono font-bold text-[#168A5B] dark:text-[#39B77A]">
            {report.id}
          </span>
          <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1]">{formattedDate}</span>
        </div>

        <h2 className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4] truncate leading-tight mb-1.5">
          {report.waste_type}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={report.priority} size="sm" showIcon={false} />
          <StatusBadge status={report.status} size="sm" />
        </div>

        {report.description && (
          <p className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] truncate mt-1.5">
            {report.description}
          </p>
        )}
      </div>

      <div className="text-[#64736A] dark:text-[#A9BBB1] group-hover:text-[#168A5B] dark:group-hover:text-[#39B77A] transition-colors pl-1">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
};
