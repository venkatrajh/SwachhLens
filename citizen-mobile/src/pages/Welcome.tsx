import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Globe, ArrowRight, Sparkles, Mail } from 'lucide-react';
import { NatureBackground } from '../components/layout/NatureBackground';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguageDetails, openLanguageModal } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between p-6 bg-[#F7FAF8] dark:bg-[#0D1712] overflow-hidden">
      <NatureBackground />

      {/* Top Bar: Language Selector */}
      <div className="relative z-10 flex justify-end">
        <button
          onClick={openLanguageModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#14221B]/80 backdrop-blur-md text-[#0F5132] dark:text-[#39B77A] border border-[#168A5B]/25 dark:border-[#39B77A]/30 text-xs font-bold shadow-xs hover:bg-[#EAF6EF] dark:hover:bg-[#1A2C23] transition-all active:scale-95 cursor-pointer"
          aria-label="Select Language"
        >
          <Globe className="w-4 h-4 text-[#168A5B] dark:text-[#39B77A]" />
          <span>{currentLanguageDetails.nativeName}</span>
        </button>
      </div>

      {/* Hero Branding & Illustration */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6">
        {/* Civic Nature Logo Emblem */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0F5132] via-[#168A5B] to-[#22A06B] dark:from-[#168A5B] dark:via-[#0F5132] dark:to-[#0A3822] flex items-center justify-center text-white shadow-floating transform hover:scale-105 transition-transform">
            <ShieldCheck className="w-11 h-11 stroke-[2.2]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center border-2 border-white dark:border-[#14221B] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#0F5132] dark:text-[#39B77A] mb-1">
          SWACHH<span className="text-[#168A5B] dark:text-[#F2F7F4]">LENS</span>
        </h1>
        <p className="text-xs font-bold tracking-widest text-[#168A5B] dark:text-[#39B77A] uppercase mb-3">
          {t('common.cleanerCities')}
        </p>

        <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] max-w-[280px] leading-relaxed font-medium">
          {t('common.subheading')}
        </p>

        {/* Civic Tagline Badge */}
        <div className="mt-4 px-3 py-1.5 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] border border-[#168A5B]/20 dark:border-[#39B77A]/20 text-[11px] font-semibold text-[#0F5132] dark:text-[#39B77A]">
          {t('common.tagline')}
        </div>
      </div>

      {/* First-Class Modern Authentication Options */}
      <div className="relative z-10 space-y-3 w-full max-w-sm mx-auto">
        {/* Continue with Google */}
        <GoogleSignInButton text="Continue with Google" />

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#DCE7E1] dark:bg-[#294037]" />
          <span className="text-[10px] font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider">
            OR
          </span>
          <div className="flex-1 h-px bg-[#DCE7E1] dark:bg-[#294037]" />
        </div>

        {/* Continue with Email / Create Account */}
        <button
          onClick={handleGetStarted}
          className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-extrabold text-xs flex items-center justify-center gap-2 shadow-floating transition-all cursor-pointer"
        >
          <Mail className="w-4 h-4 stroke-[2.2]" />
          <span>Continue with Email / Create Account</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Email Sign In Link */}
        <div className="pt-1 text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};
