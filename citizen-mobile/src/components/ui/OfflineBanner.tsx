import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    let timer: any = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
    };

    const handleOffline = () => {
      if (timer) clearTimeout(timer);
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 w-full bg-amber-500/95 dark:bg-amber-600/95 text-stone-900 dark:text-white px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all duration-300"
      >
        <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">
          You're offline. Some actions may be unavailable until your connection returns.
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-emerald-600/95 text-white px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all duration-300"
    >
      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Back online. Connection restored.</span>
    </div>
  );
};
