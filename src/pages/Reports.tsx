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

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getMyReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
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
      const matchId = r.id.toLowerCase().includes(query);
      const matchType = r.waste_type.toLowerCase().includes(query);
      const matchDesc = r.description?.toLowerCase().includes(query) || false;
      return matchId || matchType || matchDesc;
    }

    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] flex flex-col">
      <TopHeader title={t('reportsList.title')} showBack={false} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, waste type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE7E1] text-xs text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs placeholder-[#64736A]/60"
          />
        </div>

        <div className="flex p-1 bg-stone-200/60 rounded-xl">
          {(['all', 'active', 'completed'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#168A5B] shadow-xs'
                  : 'text-[#64736A] hover:text-[#17211B]'
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
          <div className="py-12 text-center text-xs text-[#64736A] flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#168A5B]" />
            <span>{t('common.loading')}</span>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-[#DCE7E1] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#64736A] font-medium">
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
