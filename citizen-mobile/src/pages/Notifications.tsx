import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { notificationService } from '../services/notificationService';
import type { NotificationPreferences } from '../services/notificationService';
import { apiService } from '../services/api';
import { Bell, RefreshCw, AlertTriangle, CheckCheck, Inbox } from 'lucide-react';

interface BackendNotification {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  message: string;
  report_id?: string;
  is_read: boolean;
  created_at: string;
}

export const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'feed' | 'preferences'>('feed');
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    notificationService.getPreferences()
  );
  const [permissionStatus, setPermissionStatus] = useState<string>(() =>
    notificationService.getPermissionStatus()
  );

  useEffect(() => {
    let isMounted = true;
    apiService.getNotifications()
      .then((data) => {
        if (isMounted) setNotifications(data || []);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('settings.notifications', 'Notifications')}
        subtitle="Alerts & Status Updates"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-3 space-y-3.5 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex p-1 bg-[#EAF6EF] dark:bg-[#14221B] rounded-xl border border-[#DCE7E1] dark:border-[#294037]">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-white dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] shadow-xs'
                : 'text-[#64736A] dark:text-[#A9BBB1]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] rounded-full text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] shadow-xs'
                : 'text-[#64736A] dark:text-[#A9BBB1]'
            }`}
          >
            <span>Preferences</span>
          </button>
        </div>

        {/* FEED VIEW */}
        {activeTab === 'feed' && (
          <div className="flex-1 flex flex-col space-y-3">
            {unreadCount > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-[#168A5B] dark:text-[#39B77A] hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all as read</span>
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[#64736A] dark:text-[#A9BBB1]">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4]">
                  No notifications yet
                </h3>
                <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] max-w-[220px]">
                  You will receive live updates as your submitted reports move through municipal verification.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => !item.is_read && handleMarkRead(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      item.is_read
                        ? 'bg-white/70 dark:bg-[#14221B]/70 border-[#DCE7E1]/60 dark:border-[#294037]/60'
                        : 'bg-white dark:bg-[#1A2C23] border-[#168A5B]/40 dark:border-[#39B77A]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            item.is_read
                              ? 'bg-transparent'
                              : 'bg-[#168A5B] dark:bg-[#39B77A]'
                          }`}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] mt-0.5 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-[#64736A]/70 dark:text-[#A9BBB1]/70 block mt-1.5">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREFERENCES VIEW */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card divide-y divide-[#DCE7E1]/60 dark:divide-[#294037]/60 overflow-hidden">
              {/* Push Notifications */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                      Push Notifications
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
                      Report Status Updates
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
                      Urgent Alerts
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
          </div>
        )}

        <div className="pt-2 pb-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23]"
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    </div>
  );
};
