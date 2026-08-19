/**
 * Auth Service (Mock Authentication Layer)
 * Cleanly encapsulated so real backend endpoints can be plugged in later
 * without modifying UI components.
 */

const MOCK_STORAGE_KEY = 'swachhlens_mock_auth_user';

export const authService = {
  /**
   * Mock Email/Password login
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.trim();
    const isCommissioner = cleanEmail.includes('commissioner');

    const mockUser = {
      id: isCommissioner ? 'USR-1001' : 'USR-1002',
      email: cleanEmail,
      name: isCommissioner ? 'Dr. K. Ramanathan, IAS' : 'S. Murugan',
      role: isCommissioner ? 'Zonal Commissioner' : 'Operations Superintendent',
      department: isCommissioner ? 'Greater Chennai Corporation - Zone 5' : 'Solid Waste Management Wing',
      auth_provider: 'local',
      avatar_url: null,
      is_active: true
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    return { token: 'mock_jwt_token_swachhlens_2026', user: mockUser };
  },

  /**
   * Mock Google Sign-In
   */
  async loginWithGoogle() {
    const mockGoogleUser = {
      id: 'USR-G-2001',
      email: 'authority.officer@chennaicorporation.gov.in',
      name: 'Dr. K. Ramanathan, IAS',
      role: 'Zonal Commissioner',
      department: 'Greater Chennai Corporation - Zone 5',
      auth_provider: 'google',
      avatar_url: null,
      is_active: true
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockGoogleUser));
    return { token: 'mock_google_jwt_token_swachhlens_2026', user: mockGoogleUser };
  },

  /**
   * Retrieve current stored mock user session
   */
  async getCurrentUser() {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      return null;
    }
  },

  /**
   * Mock Logout
   */
  async logout() {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }
};
