import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ArrowRight } from 'lucide-react';

export const LanguageSettings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, languages, changeLanguage } = useLanguage();

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col">
      <TopHeader
        title={t('common.language')}
        subtitle={t('common.selectLanguage')}
        showBack={true}
        showLanguageSelector={false}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="p-3.5 bg-[#EAF6EF] dark:bg-[#1A2C23] rounded-2xl border border-[#168A5B]/20 dark:border-[#39B77A]/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0F5132] dark:text-[#39B77A]">
                Multilingual Interface
              </h2>
              <p className="text-[11px] text-[#64736A] dark:text-[#A9BBB1]">
                Choose your preferred regional Indian language.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-[#14221B] border-[#168A5B] dark:border-[#39B77A] shadow-md ring-2 ring-[#168A5B]/20 dark:ring-[#39B77A]/20'
                      : 'bg-white dark:bg-[#14221B] border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-[#64736A] dark:text-[#A9BBB1] font-medium">
                      {lang.name}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#DCE7E1] dark:border-[#294037]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] text-white dark:text-[#0D1712] font-bold text-xs flex items-center justify-center gap-2 shadow-floating active:scale-[0.98]"
          >
            <span>{t('common.save')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
