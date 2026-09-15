import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { apiService } from '../services/api';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiService.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unable to request password reset.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#F7FAF8] dark:bg-[#0D1712]">
      <TopHeader showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-6 py-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] text-xs font-bold border border-[#168A5B]/20 dark:border-[#39B77A]/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Password Recovery</span>
          </div>
          <h1 className="text-2xl font-black text-[#17211B] dark:text-[#F2F7F4] tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs font-medium text-[#64736A] dark:text-[#A9BBB1] max-w-xs mx-auto">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p>
                If an account with that email exists, a password-reset link has been sent. Please check your inbox.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#168A5B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all"
            >
              <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
          <span>Remember your password? </span>
          <Link to="/login" className="font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
