import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { apiService } from '../services/api';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, KeyRound, RotateCcw } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || '';
  const mode = searchParams.get('mode') || 'verify';
  const isReactivate = mode === 'reactivate';

  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleVerify = React.useCallback(async (tokenToVerify?: string, emailToVerify?: string) => {
    const activeToken = (tokenToVerify ?? token).trim();
    const activeEmail = (emailToVerify ?? email).trim();

    if (!activeToken) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      if (isReactivate) {
        const res = await apiService.reactivateAccount(activeEmail, activeToken);
        setSuccessMessage(res.message || 'Account reactivated successfully! You can now log in.');
      } else {
        const res = await apiService.verifyEmail(activeToken, activeEmail || undefined);
        setSuccessMessage(res.message || 'Email verified successfully! You can now log in.');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || (isReactivate ? 'Reactivation failed. Please check your code.' : 'Verification failed. Please try again.');
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  }, [token, email, isReactivate]);

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (queryToken && !successMessage) {
      const timer = setTimeout(() => {
        handleVerify(queryToken, queryEmail);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [queryToken, queryEmail, successMessage, handleVerify]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s+/g, '');
    setToken(val);
    setErrorMessage(null);
    if (val.length === 6 && /^[0-9]{6}$/.test(val) && email.trim()) {
      handleVerify(val, email);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setToken(pasted);
      setErrorMessage(null);
      if (pasted.length === 6 && email.trim()) {
        handleVerify(pasted, email);
      }
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive a new code.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      if (isReactivate) {
        const res = await apiService.requestReactivation(email.trim());
        setResendNotice(res.message || 'A new 6-digit reactivation code has been sent.');
      } else {
        const res = await apiService.resendVerification(email.trim());
        setResendNotice(res.message || 'A new 6-digit verification code has been sent.');
      }
      setCooldownSeconds(60);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to resend code.';
      setErrorMessage(detail);
    } finally {
      setIsResending(false);
    }
  };

  const [isEditingEmail, setIsEditingEmail] = useState(!queryEmail);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    // Clear any previous token and error if email is changed
    setToken('');
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#F7FAF8] dark:bg-[#0D1712]">
      <TopHeader showBack={true} />
      <NatureBackground />

      <div className="relative z-10 px-6 py-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Header Badge & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] text-xs font-bold border border-[#168A5B]/20 dark:border-[#39B77A]/30">
            {isReactivate ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Account Reactivation</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Email Verification</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#17211B] dark:text-[#F2F7F4] tracking-tight">
            {isReactivate ? 'Reactivate Your Account' : 'Verify Your Account'}
          </h1>
          <p className="text-xs font-medium text-[#64736A] dark:text-[#A9BBB1] max-w-xs mx-auto">
            {isReactivate
              ? 'We sent a 6-digit verification code to your email. Enter it below to restore and reactivate your account.'
              : 'We sent a 6-digit verification code to your email. Enter it below to activate your account.'}
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
                className="w-full py-2.5 px-3 rounded-xl bg-[#168A5B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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

        {/* Resend Notice (Keeps Form Visible) */}
        {resendNotice && !successMessage && (
          <div className="p-3.5 mb-5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p>{resendNotice}</p>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider">
                  Account Email
                </label>
                {email && !isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-[11px] font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                )}
                {isEditingEmail && queryEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(queryEmail);
                      setIsEditingEmail(false);
                      setToken('');
                    }}
                    className="text-[11px] font-semibold text-[#64736A] dark:text-[#A9BBB1] hover:underline cursor-pointer"
                  >
                    Reset to Registered Email
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="email"
                  required
                  readOnly={!isEditingEmail}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your registered email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none shadow-xs ${
                    !isEditingEmail
                      ? 'bg-stone-100 dark:bg-[#1A2C23]/60 border-[#DCE7E1] dark:border-[#294037] text-[#64736A] dark:text-[#A9BBB1] cursor-not-allowed'
                      : 'bg-white dark:bg-[#14221B] border-[#DCE7E1] dark:border-[#294037] focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={token}
                  onChange={handleTokenChange}
                  onPaste={handlePaste}
                  placeholder="Enter 6-digit verification code"
                  className="w-full pl-10 pr-4 py-3 text-center tracking-[0.25em] font-mono text-base font-bold rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-[#64736A] dark:placeholder:text-[#A9BBB1]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all cursor-pointer disabled:opacity-60"
            >
              <span>
                {isSubmitting
                  ? (isReactivate ? 'Reactivating...' : 'Verifying...')
                  : (isReactivate ? 'Reactivate Account' : 'Verify Account')}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Resend button with cooldown */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldownSeconds > 0 || !email.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168A5B] dark:text-[#39B77A] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
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
