import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Globe,
  Info,
  LogOut,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentLanguageDetails, openLanguageModal } = useLanguage();
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] flex flex-col">
      <TopHeader title={t('profile.title')} showBack={false} />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-4">
        {/* User Card */}
        <div className="p-4 bg-white rounded-3xl border border-[#DCE7E1] shadow-card flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0F5132] to-[#168A5B] text-white flex items-center justify-center text-xl font-extrabold shadow-md flex-shrink-0">
            {user?.name ? user.name.charAt(0) : 'K'}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-[#17211B] truncate">
              {user?.name || 'Kavin Kumar'}
            </h1>
            <div className="flex items-center gap-1 text-xs text-[#168A5B] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('profile.citizenAccount')}</span>
            </div>
            <p className="text-[11px] text-[#64736A] truncate mt-0.5">
              {user?.email || 'kavin@example.com'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-[#DCE7E1] shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64736A] font-semibold uppercase block">
                {t('profile.reportsSubmitted')}
              </span>
              <span className="text-lg font-black text-[#17211B]">
                {user?.reportsSubmitted || 12}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#DCE7E1] shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64736A] font-semibold uppercase block">
                {t('profile.issuesResolved')}
              </span>
              <span className="text-lg font-black text-[#168A5B]">
                {user?.issuesResolved || 8}
              </span>
            </div>
          </div>
        </div>

        {/* Civic Jurisdiction & Contact Details */}
        <div className="bg-white rounded-2xl p-4 border border-[#DCE7E1] shadow-card space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64736A] block mb-1">
            Registered Ward
          </span>

          <div className="flex items-center gap-2.5 text-xs text-[#17211B]">
            <MapPin className="w-4 h-4 text-[#168A5B]" />
            <span className="font-semibold">{user?.ward || 'Ward 117 - T. Nagar, Zone 10'}</span>
          </div>

          {user?.phone && (
            <div className="flex items-center gap-2.5 text-xs text-[#17211B] pt-1 border-t border-[#DCE7E1]/50">
              <Phone className="w-4 h-4 text-[#168A5B]" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        {/* Settings Menu */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#64736A] uppercase tracking-wider block">
            {t('profile.settings')}
          </span>

          <div className="bg-white rounded-2xl border border-[#DCE7E1] shadow-card divide-y divide-[#DCE7E1]/60 overflow-hidden">
            <button
              onClick={openLanguageModal}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] block">
                    {t('profile.language')}
                  </span>
                  <span className="text-[11px] text-[#64736A]">
                    {currentLanguageDetails.nativeName} ({currentLanguageDetails.name})
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A]" />
            </button>

            <button
              onClick={() => setShowAboutModal(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-[#64736A] flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] block">
                    {t('profile.about')}
                  </span>
                  <span className="text-[11px] text-[#64736A]">Version 1.0.0</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64736A]" />
            </button>

            <button
              onClick={handleSignOut}
              className="w-full p-3.5 flex items-center justify-between hover:bg-red-50 transition-colors text-left text-red-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">{t('profile.signOut')}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#EAF6EF]/60 rounded-xl border border-[#168A5B]/20 text-center">
          <span className="text-[11px] font-bold text-[#0F5132] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#168A5B]" />
            <span>{t('profile.demoMode')}</span>
          </span>
        </div>
      </div>

      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#DCE7E1] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#168A5B] text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-[#0F5132]">
              SwachhLens
            </h2>
            <p className="text-xs text-[#64736A] leading-relaxed">
              {t('profile.aboutDesc')}
            </p>
            <div className="p-3 bg-[#F7FAF8] rounded-xl text-left text-[11px] text-[#64736A] space-y-1">
              <div><strong>Role:</strong> Citizen Mobile PWA (kavin/citizen-mobile)</div>
              <div><strong>Engine:</strong> AI Triage & Civic Decision Support</div>
              <div><strong>Status:</strong> Hackathon Ready</div>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#168A5B] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
