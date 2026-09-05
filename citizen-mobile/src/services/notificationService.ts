export interface NotificationPreferences {
  pushEnabled: boolean;
  statusUpdatesEnabled: boolean;
  alertsEnabled: boolean;
}

const PREFS_KEY = 'swachhlens_notification_prefs';

const DEFAULT_PREFS: NotificationPreferences = {
  pushEnabled: true,
  statusUpdatesEnabled: true,
  alertsEnabled: true,
};

export const notificationService = {
  getPreferences(): NotificationPreferences {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // use default
      }
    }
    return DEFAULT_PREFS;
  },

  savePreferences(prefs: NotificationPreferences): void {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  },

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  },
};
