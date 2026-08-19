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
    <div className="relative min-h-screen bg-[#F7FAF8] flex flex-col">
      <TopHeader
        title={t('common.language')}
        subtitle={t('common.selectLanguage')}
        showBack={true}
        showLanguageSelector={false}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="p-3.5 bg-[#EAF6EF] rounded-2xl border border-[#168A5B]/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#168A5B] text-white flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0F5132]">
                Multilingual Interface
              </h2>
              <p className="text-[11px] text-[#64736A]">
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
                      ? 'bg-white border-[#168A5B] shadow-md ring-2 ring-[#168A5B]/20'
                      : 'bg-white border-[#DCE7E1] shadow-card hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-[#17211B] block">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-[#64736A] font-medium">
                      {lang.name}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-[#168A5B] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#DCE7E1]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-floating active:scale-[0.98]"
          >
            <span>{t('common.save')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
