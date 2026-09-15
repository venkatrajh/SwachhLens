/**
 * User notification preferences stored in local storage.
 */
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

/**
 * Service for managing user notification preferences and Web Notification API permissions.
 */
export const notificationService = {
  /**
   * Retrieve saved notification preferences from LocalStorage with fallback to defaults.
   *
   * @returns Active NotificationPreferences configuration.
   */
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

  /**
   * Persist user notification preferences to LocalStorage.
   *
   * @param prefs - NotificationPreferences configuration to save.
   */
  savePreferences(prefs: NotificationPreferences): void {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  },

  /**
   * Check current browser Notification permission status.
   *
   * @returns 'granted', 'denied', 'default', or 'unsupported' if the browser lacks Notification API.
   */
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  /**
   * Prompt user to grant Web Notification permission.
   *
   * @returns Promise resolving to true if permission is granted, false otherwise.
   */
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
