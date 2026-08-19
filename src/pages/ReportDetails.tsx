import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AIResultCard } from '../components/AIResultCard';
import { DecisionCard } from '../components/DecisionCard';
import { Timeline } from '../components/Timeline';
import { VerificationCard } from '../components/VerificationCard';
import { LocationCard } from '../components/LocationCard';
import { apiService } from '../services/api';
import type { Report } from '../types/report';
import { Clock, ChevronLeft, AlertTriangle } from 'lucide-react';

export const ReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      try {
        const data = await apiService.getReport(id);
        setReport(data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] dark:bg-[#0D1712] text-xs text-[#64736A] dark:text-[#A9BBB1]">
        {t('common.loading')}
      </div>
    );
  }

  const isResolved =
    report.status.toLowerCase() === 'completed' ||
    report.status.toLowerCase() === 'verified';

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col pb-12">
      <TopHeader
        title={report.id}
        subtitle={report.waste_type}
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-4">
        {/* Main Photo Card */}
        {report.image_url && (
          <div className="relative rounded-3xl overflow-hidden bg-black aspect-[16/10] border border-[#DCE7E1] dark:border-[#294037] shadow-card">
            <img
              src={report.image_url}
              alt={report.waste_type}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <PriorityBadge priority={report.priority} size="md" />
              <StatusBadge status={report.status} size="md" />
            </div>
            {report.duplicate && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Linked Duplicate</span>
              </div>
            )}
          </div>
        )}

        {/* Location & Metadata Bar */}
        <div className="space-y-2">
          <LocationCard
            location={{
              latitude: report.latitude,
              longitude: report.longitude,
              source: 'current',
            }}
          />

          <div className="p-3 bg-white dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#64736A] dark:text-[#A9BBB1]">
              <Clock className="w-4 h-4 text-[#168A5B] dark:text-[#39B77A]" />
              <span className="font-semibold">{t('report.timestampAuto')}:</span>
            </div>
            <span className="font-mono text-[#17211B] dark:text-[#F2F7F4] font-bold text-[11px]">
              {new Date(report.timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          {report.description && (
            <div className="p-3.5 bg-white dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037] shadow-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64736A] dark:text-[#A9BBB1] block mb-1">
                Citizen Note
              </span>
              <p className="text-xs text-[#17211B] dark:text-[#F2F7F4] leading-relaxed">
                {report.description}
              </p>
            </div>
          )}
        </div>

        {/* 5-Stage Civic Resolution Timeline */}
        <Timeline status={report.status} />

        {/* Before / After Cleanup Verification Card */}
        {isResolved && (
          <VerificationCard
            beforeImage={report.before_image_url || report.image_url}
            afterImage={report.after_image_url}
            verifiedAt={report.verified_at}
          />
        )}

        {/* AI Analysis Breakdown */}
        <AIResultCard report={report} />

        {/* Recommended Municipal Response */}
        <DecisionCard report={report} />

        {/* Back to Reports Action Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/reports')}
            className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-[#14221B] hover:bg-stone-50 dark:hover:bg-[#1A2C23] active:scale-[0.98] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs flex items-center justify-center gap-2 border border-[#DCE7E1] dark:border-[#294037] shadow-card transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('common.backToReports')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
