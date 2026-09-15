import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { LocationPicker } from '../components/common/LocationPicker';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ward, setWard] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(name, email, password, ward || undefined);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Registration failed. Email might already be in use.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#F7FAF8] dark:bg-[#0D1712]">
      <TopHeader showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-6 py-4 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center space-y-1 mb-5">
          <h1 className="text-2xl font-black text-[#17211B] dark:text-[#F2F7F4] tracking-tight">Create Account</h1>
          <p className="text-xs font-medium text-[#64736A] dark:text-[#A9BBB1]">
            Join the citizen civic movement today.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2 border border-red-200 dark:border-red-900/60">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Google Sign-in */}
        <div className="mb-4">
          <GoogleSignInButton text="Sign up with Google" onError={(msg) => setError(msg)} />
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-[#DCE7E1] dark:bg-[#294037]" />
            <span className="text-[11px] font-semibold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider">
              Or register with email
            </span>
            <div className="flex-1 h-px bg-[#DCE7E1] dark:bg-[#294037]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 min-h-[44px] py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
              {t('common.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 min-h-[44px] py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
              {t('common.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
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

          {/* Hierarchical Ward Cascading Picker */}
          <div>
            <LocationPicker
              value={ward}
              onChange={(selectedWard) => setWard(selectedWard)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-xs flex items-center justify-center gap-2 shadow-floating transition-all mt-2 cursor-pointer"
          >
            <span>{isLoading ? t('common.loading') : t('common.createAccount')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
          <span>{t('common.alreadyHaveAccount')} </span>
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
