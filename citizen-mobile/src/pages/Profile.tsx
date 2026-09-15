import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import {
  Globe,
  Sun,
  Moon,
  Laptop,
  Bell,
  Lock,
  Trash2,
  Shield,
  FileText,
  FileCheck,
  Info,
  LogOut,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentLanguageDetails, openLanguageModal } = useLanguage();
  const { theme } = useTheme();

  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [stats, setStats] = useState<{ submitted: number; resolved: number }>({
    submitted: user?.reports_submitted ?? user?.reportsSubmitted ?? 0,
    resolved: user?.issues_resolved ?? user?.issuesResolved ?? 0,
  });

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const reports = await apiService.getMyReports();
        if (isMounted) {
          const submitted = reports.length;
          const resolved = reports.filter(
            (r) => r.status === 'completed' || r.status === 'verified'
          ).length;
          setStats({ submitted, resolved });
        }
      } catch (err) {
        console.error('Failed to load profile report stats:', err);
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiService.deleteAccount();
      setShowDeleteModal(false);
      logout();
      navigate('/welcome', { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to delete account. Please try again.';
      setDeleteError(detail);
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col pb-16">
      <TopHeader title={t('profile.title', 'Profile & Settings')} showBack={false} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-4">
        {/* Profile Header (Section 3 & 14) */}
        <div className="p-4 bg-white dark:bg-[#14221B] rounded-3xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0F5132] to-[#168A5B] dark:from-[#168A5B] dark:to-[#39B77A] text-white flex items-center justify-center text-xl font-extrabold shadow-md flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-[#17211B] dark:text-[#F2F7F4] truncate">
                {user?.name || t('profile.unnamed', 'Citizen')}
              </h1>
              <div className="flex items-center gap-1 text-xs text-[#168A5B] dark:text-[#39B77A] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('profile.citizenAccount', 'Citizen Account')}</span>
              </div>
              <p className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] truncate mt-0.5">
                {user?.email || t('profile.noEmail', 'No email on file')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile/edit')}
            className="px-3 py-1.5 rounded-xl bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#0F5132] dark:text-[#39B77A] border border-[#168A5B]/30 text-xs font-bold active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
          >
            {t('profile.edit', 'View')}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1] font-semibold uppercase block">
                {t('profile.reportsSubmitted')}
              </span>
              <span className="text-lg font-black text-[#17211B] dark:text-[#F2F7F4]">
                {stats.submitted}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1] font-semibold uppercase block">
                {t('profile.issuesResolved')}
              </span>
              <span className="text-lg font-black text-[#168A5B] dark:text-[#39B77A]">
                {stats.resolved}
              </span>
            </div>
          </div>
        </div>

        {/* 1. ACCOUNT SECTION (Section 3 & 14) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block px-1">
            {t('settings.account', 'Account')}
          </span>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card divide-y divide-[#DCE7E1]/60 dark:divide-[#294037]/60 overflow-hidden">
            <button
              onClick={() => navigate('/profile/edit')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                  {t('profile.editProfile', 'Edit Profile')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>

            <button
              onClick={() => navigate('/profile/change-password')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#1A2C23] text-[#64736A] dark:text-[#A9BBB1] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                  {t('settings.changePassword', 'Change Password')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>

            <button
              onClick={() => {
                setDeleteError(null);
                setShowDeleteModal(true);
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">
                  {t('settings.deleteAccount', 'Delete Account')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. PREFERENCES SECTION (Section 3 & 14) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block px-1">
            {t('settings.preferences', 'Preferences')}
          </span>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card divide-y divide-[#DCE7E1]/60 dark:divide-[#294037]/60 overflow-hidden">
            {/* Language */}
            <button
              onClick={openLanguageModal}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('profile.language', 'Language')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1]">
                    {currentLanguageDetails.nativeName} ({currentLanguageDetails.name})
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>

            {/* Appearance (Theme) */}
            <button
              onClick={() => navigate('/settings/appearance')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4" />
                  ) : theme === 'light' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('settings.appearance', 'Appearance')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] capitalize">
                    {theme === 'system' ? 'System Preference' : `${theme} mode`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>

            {/* Notifications Shortcut */}
            <button
              onClick={() => navigate('/settings/notifications')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('settings.notifications', 'Notifications')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1]">
                    Status updates & alerts
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>
          </div>
        </div>

        {/* 3. SECURITY & PRIVACY SECTION (Section 3 & 14) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block px-1">
            {t('settings.securityPrivacy', 'Security & Privacy')}
          </span>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card divide-y divide-[#DCE7E1]/60 dark:divide-[#294037]/60 overflow-hidden">
            <button
              onClick={() => navigate('/security-privacy')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                  {t('settings.securityOverview', 'Security & Privacy')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>

            <button
              onClick={() => navigate('/privacy-policy')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#1A2C23] text-[#64736A] dark:text-[#A9BBB1] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                  {t('legal.privacyPolicy', 'Privacy Policy')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>

            <button
              onClick={() => navigate('/terms-of-service')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#1A2C23] text-[#64736A] dark:text-[#A9BBB1] flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                  {t('legal.termsOfService', 'Terms of Service')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>
          </div>
        </div>

        {/* 4. ABOUT & SUPPORT (Section 3 & 14) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block px-1">
            {t('settings.legal', 'About & Legal')}
          </span>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card divide-y divide-[#DCE7E1]/60 dark:divide-[#294037]/60 overflow-hidden">
            <button
              onClick={() => setShowAboutModal(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1A2C23] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('profile.about', 'About SwachhLens')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1]">
                    Version 2.0 (Build 2026.1)
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
            </button>
          </div>
        </div>

        {/* 5. SIGN OUT ACTION (Section 14) */}
        <div className="pt-2">
          <button
            onClick={handleSignOut}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#14221B] border border-red-200 dark:border-red-900/60 shadow-card hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-center text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('profile.signOut', 'Sign Out')}</span>
          </button>
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
        >
          <div className="bg-white dark:bg-[#14221B] rounded-3xl p-6 max-w-sm w-full border border-[#DCE7E1] dark:border-[#294037] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-[#0F5132] dark:text-[#39B77A]">
              SwachhLens
            </h2>
            <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] leading-relaxed">
              {t('profile.aboutDesc')}
            </p>
            <div className="p-3 bg-[#F7FAF8] dark:bg-[#0D1712] rounded-xl text-left text-[11px] text-[#64736A] dark:text-[#A9BBB1] space-y-1 border border-[#DCE7E1] dark:border-[#294037]">
              <div><strong>Role:</strong> Citizen Mobile PWA</div>
              <div><strong>Version:</strong> 2.0 (Build 2026.1)</div>
              <div><strong>Tagline:</strong> "Report. Understand. Prioritize. Respond. Verify."</div>
              <div><strong>Engine:</strong> AI Civic Decision Support System</div>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Destructive Delete Account Modal (CHANGE-010) */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
        >
          <div className="bg-white dark:bg-[#14221B] rounded-3xl p-6 max-w-sm w-full border border-red-200 dark:border-red-900/60 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-base font-extrabold text-red-600 dark:text-red-400">
                {t('settings.deleteAccountTitle', 'Delete Account Permanently')}
              </h2>
              <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] leading-relaxed">
                {t(
                  'settings.deleteAccountWarning',
                  'Deleting your account is permanent. Your profile, active sessions, and credentials will be deactivated immediately.'
                )}
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-medium text-center">
                {deleteError}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting Account...' : t('settings.confirmDelete', 'Confirm Delete Account')}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-[#1A2C23] hover:bg-stone-200 dark:hover:bg-[#253d30] text-[#17211B] dark:text-[#F2F7F4] text-xs font-bold cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
