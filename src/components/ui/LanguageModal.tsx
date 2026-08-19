import React from 'react';
import { Check, Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentLanguage,
    languages,
    changeLanguage,
    isLanguageModalOpen,
    closeLanguageModal,
  } = useLanguage();

  if (!isLanguageModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#14221B] rounded-3xl p-5 shadow-2xl border border-[#DCE7E1] dark:border-[#294037] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE7E1] dark:border-[#294037]">
          <div className="flex items-center gap-2 text-[#0F5132] dark:text-[#39B77A]">
            <Globe className="w-5 h-5 text-[#168A5B] dark:text-[#39B77A]" />
            <h2 className="text-base font-bold tracking-tight text-[#17211B] dark:text-[#F2F7F4]">
              {t('common.selectLanguage')}
            </h2>
          </div>
          <button
            onClick={closeLanguageModal}
            className="w-8 h-8 rounded-full bg-[#F7FAF8] dark:bg-[#1A2C23] hover:bg-[#EAF6EF] text-[#64736A] dark:text-[#A9BBB1] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#0F5132] dark:text-[#39B77A] font-bold border border-[#168A5B]/30 dark:border-[#39B77A]/30 shadow-xs'
                    : 'text-[#17211B] dark:text-[#F2F7F4] hover:bg-[#F7FAF8] dark:hover:bg-[#1A2C23]'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{lang.nativeName}</span>
                  <span className="text-xs text-[#64736A] dark:text-[#A9BBB1] font-normal">
                    {lang.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
