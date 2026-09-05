import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Info, ArrowLeft } from 'lucide-react';

export const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const name = user?.name || '';
  const email = user?.email || '';
  const phone = user?.phone || '';
  const ward = user?.ward || '';

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('profile.editProfile', 'Profile Details')}
        subtitle="Citizen Information"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Avatar circle */}
          <div className="flex flex-col items-center py-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0F5132] to-[#168A5B] dark:from-[#168A5B] dark:to-[#39B77A] text-white flex items-center justify-center text-2xl font-extrabold shadow-md mb-2">
              {name ? name.charAt(0).toUpperCase() : 'C'}
            </div>
            <span className="text-xs font-bold text-[#168A5B] dark:text-[#39B77A]">
              Citizen Account
            </span>
          </div>

          {/* Read-Only Notice Banner */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Read-Only Profile
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                Editing profile details isn't available yet in this version. This information is read-only.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="text"
                  disabled
                  value={name || 'Citizen'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#1A2C23]/60 border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] cursor-not-allowed opacity-80 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('common.email', 'Email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="email"
                  disabled
                  value={email || 'No email on file'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#1A2C23]/60 border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] cursor-not-allowed opacity-80 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('profile.phone', 'Phone Number')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="tel"
                  disabled
                  value={phone || 'Not provided'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#1A2C23]/60 border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] cursor-not-allowed opacity-80 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('profile.ward', 'Ward / Locality')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="text"
                  disabled
                  value={ward || 'Default Ward Zone'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#1A2C23]/60 border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] cursor-not-allowed opacity-80 shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back', 'Back to Profile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
