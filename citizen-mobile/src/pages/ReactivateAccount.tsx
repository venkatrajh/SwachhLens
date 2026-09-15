import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { apiService } from '../services/api';
import { Mail, ArrowRight, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

export const ReactivateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(queryEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiService.requestReactivation(targetEmail);
      navigate(`/verify-email?email=${encodeURIComponent(targetEmail)}&mode=reactivate`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unable to send reactivation code.';
      // If code was already sent recently (cooldown active), proceed directly to verification screen
      if (detail.toLowerCase().includes('wait') || detail.toLowerCase().includes('cooldown') || detail.toLowerCase().includes('already')) {
        navigate(`/verify-email?email=${encodeURIComponent(targetEmail)}&mode=reactivate`);
        return;
      }
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
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] text-xs font-bold border border-[#168A5B]/20 dark:border-[#39B77A]/30">
            <RotateCcw className="w-4 h-4" />
            <span>Account Recovery</span>
          </div>
          <h1 className="text-2xl font-black text-[#17211B] dark:text-[#F2F7F4] tracking-tight">
            Reactivate Account
          </h1>
          <p className="text-xs font-medium text-[#64736A] dark:text-[#A9BBB1] max-w-xs mx-auto">
            Enter your registered email address below. We'll send you a 6-digit verification code to restore and reactivate your account.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Reactivation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your registered email address"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send Reactivation Code</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
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
