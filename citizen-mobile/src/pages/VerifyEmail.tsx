import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { apiService } from '../services/api';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (queryToken && !successMessage) {
      handleVerify(queryToken, queryEmail);
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleVerify = async (tokenToVerify?: string, emailToVerify?: string) => {
    const activeToken = (tokenToVerify ?? token).trim();
    const activeEmail = (emailToVerify ?? email).trim();

    if (!activeToken) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiService.verifyEmail(activeToken, activeEmail || undefined);
      setSuccessMessage(res.message || 'Email verified successfully! You can now log in.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Verification failed. Please try again.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive a new code.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await apiService.resendVerification(email.trim());
      setSuccessMessage(res.message || 'A new verification code has been sent.');
      setCooldownSeconds(60);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to resend code.';
      setErrorMessage(detail);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#F7FAF8] dark:bg-[#0D1712]">
      <TopHeader showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-6 py-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Header Badge & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] text-xs font-bold border border-[#168A5B]/20 dark:border-[#39B77A]/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Email Verification</span>
          </div>
          <h1 className="text-2xl font-black text-[#17211B] dark:text-[#F2F7F4] tracking-tight">
            Verify Your Account
          </h1>
          <p className="text-xs font-medium text-[#64736A] dark:text-[#A9BBB1] max-w-xs mx-auto">
            We sent a 6-digit verification code to your email. Enter it below to activate your account.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 mb-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p>{successMessage}</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#168A5B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Verification Form */}
        {!successMessage && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
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
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={64}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 text-center tracking-[0.3em] font-mono text-lg font-bold rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Verify Account'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Resend button with cooldown */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldownSeconds > 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168A5B] dark:text-[#39B77A] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {cooldownSeconds > 0
                    ? `Resend code in ${cooldownSeconds}s`
                    : isResending
                    ? 'Sending new code...'
                    : 'Resend Verification Code'}
                </span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
          <span>Back to </span>
          <Link to="/login" className="font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
