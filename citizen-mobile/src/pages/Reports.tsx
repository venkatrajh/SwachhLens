import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { ReportCard } from '../components/ReportCard';
import { apiService } from '../services/api';
import type { Report } from '../types/report';
import { FileText, RefreshCw, Search } from 'lucide-react';

type FilterTab = 'all' | 'active' | 'completed';

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getMyReports();
      setReports(data);
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      setError(
        err.response?.data?.detail || 'Failed to retrieve reports from server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const isCompleted =
      r.status.toLowerCase() === 'completed' ||
      r.status.toLowerCase() === 'verified';
    if (activeTab === 'active' && isCompleted) return false;
    if (activeTab === 'completed' && !isCompleted) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(query) || (r.display_id && r.display_id.toLowerCase().includes(query));
      const matchType = (r.waste_type || '').toLowerCase().includes(query);
      const matchDesc = r.description?.toLowerCase().includes(query) || false;
      return matchId || matchType || matchDesc;
    }

    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col">
      <TopHeader title={t('reportsList.title', 'MY REPORTS')} showBack={false} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, waste type..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs placeholder-[#64736A]/60 dark:placeholder-[#A9BBB1]/60"
            />
          </div>
          <button
            type="button"
            onClick={fetchReports}
            disabled={isLoading}
            aria-label="Refresh reports list"
            title="Refresh reports"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center shadow-xs active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 text-xs flex items-center justify-between">
            <span className="truncate">{error}</span>
            <button
              onClick={fetchReports}
              className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[11px] ml-2 flex-shrink-0"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        <div className="flex p-1 bg-stone-200/60 dark:bg-[#1A2C23] rounded-xl">
          {(['all', 'active', 'completed'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#14221B] text-[#168A5B] dark:text-[#39B77A] shadow-xs'
                  : 'text-[#64736A] dark:text-[#A9BBB1] hover:text-[#17211B] dark:hover:text-[#F2F7F4]'
              }`}
            >
              {tab === 'all'
                ? t('reportsList.filterAll')
                : tab === 'active'
                ? t('reportsList.filterActive')
                : t('reportsList.filterCompleted')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#64736A] dark:text-[#A9BBB1] flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#168A5B] dark:text-[#39B77A]" />
            <span>{t('common.loading')}</span>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center bg-white dark:bg-[#14221B] rounded-2xl border border-dashed border-[#DCE7E1] dark:border-[#294037] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] font-medium">
              {activeTab === 'active'
                ? t('reportsList.emptyActive')
                : activeTab === 'completed'
                ? t('reportsList.emptyCompleted')
                : t('reportsList.emptyAll')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
