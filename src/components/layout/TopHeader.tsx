import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLanguageSelector?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showLanguageSelector = true,
}) => {
  const navigate = useNavigate();
  const { currentLanguageDetails, openLanguageModal } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-3 bg-white/85 backdrop-blur-md border-b border-[#DCE7E1]/80 flex items-center justify-between safe-top">
      <div className="flex items-center gap-2.5">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center active:scale-95 transition-transform border border-[#168A5B]/20"
            aria-label="Go Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#168A5B] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}

        <div>
          {title ? (
            <div>
              <h1 className="text-base font-bold text-[#17211B] leading-tight flex items-center gap-1.5">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#64736A] font-medium">{subtitle}</p>
              )}
            </div>
          ) : (
            <div>
              <span className="text-base font-extrabold tracking-tight text-[#0F5132]">
                SWACHH<span className="text-[#168A5B]">LENS</span>
              </span>
              <p className="text-[10px] text-[#64736A] font-semibold tracking-wider uppercase">
                AI Civic Response
              </p>
            </div>
          )}
        </div>
      </div>

      {showLanguageSelector && (
        <button
          onClick={openLanguageModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#EAF6EF] hover:bg-[#D4EDE0] text-[#0F5132] border border-[#168A5B]/25 text-xs font-semibold shadow-xs transition-all active:scale-95"
          aria-label="Select Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#168A5B]" />
          <span>{currentLanguageDetails.nativeName}</span>
        </button>
      )}
    </header>
  );
};
