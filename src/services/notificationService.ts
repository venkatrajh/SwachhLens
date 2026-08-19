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

  /**
   * Mock / Dispatch local notification for report updates
   */
  dispatchLocalNotification(title: string, body: string): void {
    const prefs = this.getPreferences();
    if (!prefs.pushEnabled) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
        });
      } catch {
        console.log(`[SwachhLens Notification] ${title}: ${body}`);
      }
    } else {
      console.log(`[SwachhLens Mock Notification] ${title}: ${body}`);
    }
  },
};
