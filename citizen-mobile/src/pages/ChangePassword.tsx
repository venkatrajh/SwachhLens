import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { Info, ArrowLeft } from 'lucide-react';

export const ChangePassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('settings.changePassword', 'Change Password')}
        subtitle="Security Settings"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-6 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Password Change Unavailable
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                Changing your password isn't available yet in this version. Please use "Forgot password" from the login screen instead.
              </p>
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
