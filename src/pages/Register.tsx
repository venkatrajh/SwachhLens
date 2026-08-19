import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, ArrowRight, MapPin } from 'lucide-react';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ward, setWard] = useState('Ward 117 - Central Zone');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password);
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
        <div className="mb-5">
          <h1 className="text-2xl font-black text-[#17211B] leading-tight">
            {t('common.createAccount')}
          </h1>
          <p className="text-xs text-[#64736A] font-medium mt-1">
            Join thousands of active citizens keeping our community clean.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kavin Kumar"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block mb-1">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block mb-1">
              {t('common.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block mb-1">
              Ward / Locality
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A]" />
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all mt-2"
          >
            <span>{isLoading ? t('common.loading') : t('common.createAccount')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#64736A]">
          <span>{t('common.alreadyHaveAccount')} </span>
          <Link
            to="/login"
            className="font-bold text-[#168A5B] hover:underline"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};
