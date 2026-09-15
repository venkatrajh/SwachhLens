import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || '';
      if (detail.toLowerCase().includes('deactivated')) {
        // Direct land on dedicated Reactivate Account page with prefilled email
        navigate(`/reactivate?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      if (err?.response?.status === 403 || detail.toLowerCase().includes('not verified')) {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      setError(detail || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#F7FAF8] dark:bg-[#0D1712]">
      <TopHeader showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-6 py-4 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Title */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] text-xs font-bold mb-3 border border-[#168A5B]/20 dark:border-[#39B77A]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </div>
          <h1 className="text-2xl font-black text-[#17211B] dark:text-[#F2F7F4] leading-tight">
            {t('common.welcomeBack')}
          </h1>
          <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] font-medium mt-1">
            {t('common.helpKeepCityClean')}
          </p>
        </div>

        {/* Dynamic Alert Banner */}
        {error && (
          <div
            className={`p-3.5 mb-4 rounded-2xl ${
              error.toLowerCase().includes('deactivated')
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400'
            } text-xs font-semibold space-y-2.5 shadow-xs`}
          >
            <div className="flex items-center gap-2">
              {error.toLowerCase().includes('deactivated') ? (
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <p>{error}</p>
            </div>
            {error.toLowerCase().includes('deactivated') && (
              <button
                type="button"
                onClick={() => navigate(`/reactivate?email=${encodeURIComponent(email.trim())}`)}
                className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-95 text-white dark:text-[#0D1712] font-bold text-xs shadow-floating flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Go to Reactivate Account Page</span>
              </button>
            )}
          </div>
        )}

        {/* Google Sign-in */}
        <div className="mb-4">
          <GoogleSignInButton text="Continue with Google" onError={(msg) => setError(msg)} />
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-[#DCE7E1] dark:bg-[#294037]" />
            <span className="text-[11px] font-semibold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="flex-1 h-px bg-[#DCE7E1] dark:bg-[#294037]" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1.5">
              {t('common.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 min-h-[44px] py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider">
                {t('common.password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#168A5B] dark:text-[#39B77A] hover:underline min-h-[44px] flex items-center"
              >
                {t('common.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 min-h-[44px] py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[#64736A] dark:text-[#A9BBB1] hover:text-[#168A5B] dark:hover:text-[#39B77A] min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-xs flex items-center justify-center gap-2 shadow-floating transition-all cursor-pointer disabled:opacity-60"
          >
            <span>{isLoading ? t('common.loading') : t('common.signIn')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Links section */}
        <div className="mt-5 space-y-2 text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
          <div>
            <span>{t('common.dontHaveAccount')} </span>
            <Link
              to="/register"
              className="font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline"
            >
              {t('common.createAccount')}
            </Link>
          </div>
          <div>
            <span>Account deactivated? </span>
            <Link
              to={`/reactivate${email.trim() ? '?email=' + encodeURIComponent(email.trim()) : ''}`}
              className="font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reactivate Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
