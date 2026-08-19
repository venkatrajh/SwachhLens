import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { ReportCard } from '../components/ReportCard';
import { apiService } from '../services/api';
import type { Report } from '../types/report';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  FileText,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const reports = await apiService.getMyReports();
        setRecentReports(reports.slice(0, 3));
      } catch (err) {
        console.error('Failed to load recent reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col">
      <TopHeader />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-4">
        {/* Citizen Greeting Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#64736A] dark:text-[#A9BBB1] font-semibold">
              <span>{t('home.greeting')}</span>
              <span className="text-[#17211B] dark:text-[#F2F7F4] font-bold">
                {user?.name?.split(' ')[0] || 'Citizen'}
              </span>
            </div>
            <h1 className="text-lg font-black text-[#17211B] dark:text-[#F2F7F4] tracking-tight">
              {t('common.helpKeepCityClean')}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] border border-[#168A5B]/30 dark:border-[#39B77A]/30 flex items-center justify-center text-[#168A5B] dark:text-[#39B77A] font-extrabold text-sm shadow-xs">
            {user?.name ? user.name.charAt(0) : 'K'}
          </div>
        </div>

        {/* PRIMARY HERO CTA: "REPORT WASTE" */}
        <div
          onClick={() => navigate('/report')}
          className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#0F5132] via-[#168A5B] to-[#22A06B] dark:from-[#168A5B] dark:via-[#0F5132] dark:to-[#0A3822] text-white shadow-floating cursor-pointer active:scale-[0.98] transition-all group"
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10 blur-lg" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-wider uppercase">
                <Sparkles className="w-3 h-3" />
                <span>AI Powered</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight leading-tight">
                {t('home.heroTitle')}
              </h2>
              <p className="text-xs text-white/90 font-medium">
                {t('home.heroSubtitle')}
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white text-[#168A5B] flex items-center justify-center shadow-lg group-hover:scale-105 group-active:scale-95 transition-transform flex-shrink-0">
              <Camera className="w-7 h-7 stroke-[2.2]" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white/95">
            <span>Photo / Video + Instant AI Triage</span>
            <div className="flex items-center gap-1">
              <span>Start</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Citizen Quick Stats Pill */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1] font-semibold uppercase block">
                {t('profile.reportsSubmitted')}
              </span>
              <span className="text-base font-extrabold text-[#17211B] dark:text-[#F2F7F4]">
                {user?.reportsSubmitted || 12}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1] font-semibold uppercase block">
                {t('profile.issuesResolved')}
              </span>
              <span className="text-base font-extrabold text-[#168A5B] dark:text-[#39B77A]">
                {user?.issuesResolved || 8}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider">
            {t('home.quickActions')}
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('/reports')}
              className="p-3 bg-white dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23] flex items-center gap-2.5 text-left transition-all active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block leading-tight">
                  {t('home.myReports')}
                </span>
                <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1]">Track status</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="p-3 bg-white dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23] flex items-center gap-2.5 text-left transition-all active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block leading-tight">
                  {t('home.nearbyIssues')}
                </span>
                <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1]">In your ward</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider">
              {t('home.recentReports')}
            </h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline"
            >
              {t('home.viewAll')}
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
              {t('common.loading')}
            </div>
          ) : recentReports.length > 0 ? (
            <div className="space-y-2.5">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-[#14221B] rounded-2xl border border-dashed border-[#DCE7E1] dark:border-[#294037] text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
              {t('home.noReports')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
