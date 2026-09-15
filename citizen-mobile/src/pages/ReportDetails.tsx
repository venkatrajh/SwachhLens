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
import { Clock, ChevronLeft, AlertTriangle, ExternalLink, Camera } from 'lucide-react';
import { formatReportId, resolveImageUrl } from '../utils/reportUtils';

export const ReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      try {
        const data = await apiService.getReport(id);
        setReport(data);
      } catch (err: any) {
        console.error('Failed to load report:', err);
        setError(err.response?.status === 404 ? 'Report not found or has been removed.' : 'Failed to load report details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] dark:bg-[#0D1712] text-xs text-[#64736A] dark:text-[#A9BBB1]">
        {t('common.loading')}
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAF8] dark:bg-[#0D1712] text-center p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#17211B] dark:text-[#F2F7F4]">{error || 'Report Unavailable'}</h2>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white font-semibold shadow-md">
          Go Back
        </button>
      </div>
    );
  }

  const isResolved =
    report.status.toLowerCase() === 'completed' ||
    report.status.toLowerCase() === 'verified';

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col pb-12">
      <TopHeader
        title={report.display_id || formatReportId(report.id, report.created_at || report.reported_at || report.timestamp)}
        subtitle={report.waste_type || 'Waste Report'}
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-4">
        {/* Prominent Duplicate Banner */}
        {report.duplicate && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {t('result.duplicateTitle', 'Duplicate Report Linked')}
              </h2>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {t(
                'result.duplicateDesc',
                'This report was identified as a duplicate of an existing incident and linked for municipal tracking.'
              )}
            </p>
            {report.linked_report_id && (
              <div className="pt-2 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/60">
                <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200 truncate max-w-[180px]">
                  Original: {report.linked_report_id.slice(0, 8)}...
                </span>
                <button
                  onClick={() => navigate(`/reports/${report.linked_report_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform shadow-xs"
                >
                  <span>{t('result.viewExistingReport', 'View Original Issue')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Photo Card */}
        {report.image_url && !imageError ? (
          <div className="relative rounded-3xl overflow-hidden bg-black/90 aspect-[16/10] border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center justify-center">
            <img
              src={resolveImageUrl(report.image_url)}
              alt={report.waste_type || 'Reported Waste'}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              <PriorityBadge priority={report.priority} size="md" />
              <StatusBadge status={report.status} size="md" />
            </div>
            {report.duplicate && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1 z-10">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Linked Duplicate</span>
              </div>
            )}
          </div>
        ) : report.image_url && imageError ? (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#EAF4EF] to-[#D5EADF] dark:from-[#132B20] dark:to-[#0D1C15] aspect-[16/10] border border-[#DCE7E1] dark:border-[#294037] shadow-card flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#168A5B]/10 dark:bg-[#39B77A]/20 flex items-center justify-center text-[#168A5B] dark:text-[#39B77A] mb-2">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4] capitalize">
              {report.waste_type?.replace(/_/g, ' ') || 'Civic Incident Photo'}
            </span>
            <span className="text-xs text-[#64736A] dark:text-[#A9BBB1] mt-1">
              Visual evidence archived on SwachhLens AI Gateway
            </span>
            <div className="absolute top-3 left-3 flex gap-2">
              <PriorityBadge priority={report.priority} size="md" />
              <StatusBadge status={report.status} size="md" />
            </div>
          </div>
        ) : null}

        {/* Location & Metadata Bar */}
        <div className="space-y-2">
          <LocationCard
            location={{
              latitude: report.latitude,
              longitude: report.longitude,
              address: report.address_label,
              source: 'current',
            }}
          />

          <div className="p-3 bg-white dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#64736A] dark:text-[#A9BBB1]">
              <Clock className="w-4 h-4 text-[#168A5B] dark:text-[#39B77A]" />
              <span className="font-semibold">{t('report.timestampAuto')}:</span>
            </div>
            <span className="font-mono text-[#17211B] dark:text-[#F2F7F4] font-bold text-[11px]">
              {(() => {
                const dateStr = report.created_at || report.reported_at || report.timestamp;
                if (!dateStr) return 'N/A';
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return 'N/A';
                return d.toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
              })()}
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
            beforeImage={resolveImageUrl(report.before_image_url || report.image_url)}
            afterImage={resolveImageUrl(report.after_image_url) || undefined}
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
