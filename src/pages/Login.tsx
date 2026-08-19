import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('kavin@example.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#F7FAF8]">
      <TopHeader showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-6 py-4 flex-1 flex flex-col justify-center">
        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF6EF] text-[#168A5B] text-xs font-bold mb-3 border border-[#168A5B]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </div>
          <h1 className="text-2xl font-black text-[#17211B] leading-tight">
            {t('common.welcomeBack')}
          </h1>
          <p className="text-xs text-[#64736A] font-medium mt-1">
            {t('common.helpKeepCityClean')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block mb-1.5">
              {t('common.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider">
                {t('common.password')}
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-[#168A5B] hover:underline"
              >
                {t('common.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            <span>{isLoading ? t('common.loading') : t('common.signIn')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DCE7E1]" />
          </div>
          <span className="relative bg-[#F7FAF8] px-3 text-[11px] font-bold text-[#64736A] uppercase">
            {t('common.or')}
          </span>
        </div>

        {/* Google OAuth Abstraction */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 active:scale-[0.98] text-[#17211B] font-bold text-xs flex items-center justify-center gap-3 border border-[#DCE7E1] shadow-card transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{t('common.continueWithGoogle')}</span>
        </button>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-[#64736A]">
          <span>{t('common.dontHaveAccount')} </span>
          <Link
            to="/register"
            className="font-bold text-[#168A5B] hover:underline"
          >
            {t('common.createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};
