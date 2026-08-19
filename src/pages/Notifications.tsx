import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { notificationService } from '../services/notificationService';
import type { NotificationPreferences } from '../services/notificationService';
import { Bell, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    notificationService.getPreferences()
  );

  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key],
    };
    setPrefs(updated);
    notificationService.savePreferences(updated);

    if (key === 'pushEnabled' && updated.pushEnabled && permissionStatus !== 'granted') {
      notificationService.requestPermission().then((granted) => {
        setPermissionStatus(granted ? 'granted' : 'denied');
      });
    }
  };

  const handleSendTestNotification = () => {
    notificationService.dispatchLocalNotification(
      'SwachhLens Status Update',
      'Your report SWL1023 has been assigned to Team B.'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('settings.notifications', 'Notifications')}
        subtitle="Alerts & Status Preferences"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] px-1">
            Stay informed about your reported civic waste and cleanup progress.
          </p>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card divide-y divide-[#DCE7E1]/60 dark:divide-[#294037]/60 overflow-hidden">
            {/* Push Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('notifications.push', 'Push Notifications')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] block mt-0.5">
                    General SwachhLens updates and civic advisories
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('pushEnabled')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center flex-shrink-0 ${
                  prefs.pushEnabled
                    ? 'bg-[#168A5B] dark:bg-[#39B77A]'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
                role="switch"
                aria-checked={prefs.pushEnabled}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    prefs.pushEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Report Status Updates */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('notifications.statusUpdates', 'Report Status Updates')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] block mt-0.5">
                    Live notifications when teams are assigned or cleanup verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('statusUpdatesEnabled')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center flex-shrink-0 ${
                  prefs.statusUpdatesEnabled
                    ? 'bg-[#168A5B] dark:bg-[#39B77A]'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
                role="switch"
                aria-checked={prefs.statusUpdatesEnabled}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    prefs.statusUpdatesEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Alerts */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                    {t('notifications.alerts', 'Urgent Alerts')}
                  </span>
                  <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] block mt-0.5">
                    Duplicate warnings, hazardous waste escalations
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('alertsEnabled')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center flex-shrink-0 ${
                  prefs.alertsEnabled
                    ? 'bg-[#168A5B] dark:bg-[#39B77A]'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
                role="switch"
                aria-checked={prefs.alertsEnabled}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    prefs.alertsEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test Notification Action */}
          <div className="p-3 bg-[#EAF6EF] dark:bg-[#1A2C23] rounded-2xl border border-[#168A5B]/20 dark:border-[#39B77A]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F5132] dark:text-[#39B77A]">
              <Sparkles className="w-4 h-4" />
              <span>Simulate Mock Notification</span>
            </div>
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="px-3 py-1.5 rounded-lg bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] text-xs font-bold active:scale-95 transition-transform"
            >
              {testSent ? 'Sent ✓' : 'Send Test'}
            </button>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23]"
          >
            {t('common.back', 'Back to Settings')}
          </button>
        </div>
      </div>
    </div>
  );
};
