import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../../config/config';
import { AlertCircle, Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  text?: string;
  onError?: (err: string) => void;
  disabled?: boolean;
  className?: string;
}

// Global active credential handler subscriber to guarantee single authoritative GIS initialization
type CredentialCallback = (response: any) => void;
let activeCredentialCallback: CredentialCallback | null = null;
let isGisInitialized = false;
let initializedClientId: string | null = null;

const globalGoogleCredentialDispatcher = (response: any) => {
  if (activeCredentialCallback) {
    activeCredentialCallback(response);
  } else {
    console.warn('[GoogleAuth] No active handler registered for credential response.');
  }
};

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'Continue with Google',
  onError,
  disabled = false,
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [configNotice, setConfigNotice] = useState<string | null>(null);
  const gisContainerRef = useRef<HTMLDivElement>(null);

  const clientId = CONFIG.GOOGLE_CLIENT_ID;

  const handleGoogleCredentialResponse = React.useCallback(async (response: any) => {
    if (!response?.credential) {
      const err = 'No authentication credential received from Google.';
      if (onError) onError(err);
      return;
    }

    setIsLoading(true);
    setConfigNotice(null);
    try {
      await loginWithGoogle(response.credential);
      navigate('/home');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Google authentication failed.';
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithGoogle, navigate, onError]);

  useEffect(() => {
    // Register this mounted component as the active receiver of Google credentials
    activeCredentialCallback = handleGoogleCredentialResponse;

    if (!clientId) return;

    let isMounted = true;

    const setupGIS = () => {
      if (!isMounted) return;
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      // Exactly ONE authoritative initialization per client ID
      if (!isGisInitialized || initializedClientId !== clientId) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: globalGoogleCredentialDispatcher,
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true,
            use_fedcm_for_prompt: false,
          });
          isGisInitialized = true;
          initializedClientId = clientId;
        } catch (e) {
          console.debug('[GoogleAuth] GIS initialize notice:', e);
        }
      }

      // Render official GIS button with SwachhLens dark-green compact pill styling
      if (gisContainerRef.current) {
        try {
          gisContainerRef.current.innerHTML = '';
          google.accounts.id.renderButton(gisContainerRef.current, {
            theme: 'filled_black',
            size: 'medium',
            type: 'standard',
            shape: 'pill',
            text: text.toLowerCase().includes('sign up') ? 'signup_with' : 'continue_with',
            logo_alignment: 'left',
            width: 320,
          });
        } catch (e) {
          console.debug('[GoogleAuth] GIS renderButton notice:', e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      setupGIS();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          setupGIS();
          clearInterval(interval);
        }
      }, 150);

      return () => {
        isMounted = false;
        clearInterval(interval);
        if (activeCredentialCallback === handleGoogleCredentialResponse) {
          activeCredentialCallback = null;
        }
      };
    }

    return () => {
      isMounted = false;
      if (activeCredentialCallback === handleGoogleCredentialResponse) {
        activeCredentialCallback = null;
      }
    };
  }, [clientId, text, handleGoogleCredentialResponse]);

  const handleClick = () => {
    if (disabled || isLoading) return;

    if (!clientId) {
      setConfigNotice(
        'Google OAuth requires VITE_GOOGLE_CLIENT_ID to be configured. Please use email registration/login below.'
      );
      if (onError) {
        onError('Google Sign-In is blocked: VITE_GOOGLE_CLIENT_ID external configuration required.');
      }
      return;
    }

    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.debug('Google prompt notification:', notification);
        }
      });
    } else {
      if (onError) onError('Google Identity Services SDK is still loading. Please check your network connection.');
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Container for GIS rendered button with SwachhLens dark-green compact pill styling */}
      {clientId ? (
        <div className="w-full flex justify-center items-center py-1">
          <div
            ref={gisContainerRef}
            className={`w-full flex justify-center items-center rounded-full overflow-hidden transition-all duration-200 ${className}`}
            style={{ minHeight: '38px' }}
          />
        </div>
      ) : (
        /* Styled Interactive / Status Button fallback when Client ID is missing */
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isLoading}
          aria-label={text}
          className={`w-full py-2.5 px-4 rounded-full bg-[#14221B] hover:bg-[#1A2C23] border border-[#168A5B]/30 dark:border-[#39B77A]/30 text-xs font-bold text-[#F2F7F4] flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#168A5B] dark:text-[#39B77A]" />
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{isLoading ? 'Authenticating with Google...' : text}</span>
        </button>
      )}

      {/* Clear configuration notification when client ID is missing */}
      {configNotice && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>{configNotice}</p>
        </div>
      )}
    </div>
  );
};
