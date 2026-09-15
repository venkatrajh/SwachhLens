import { api } from './api';

export const authService = {
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.trim();

    // The backend uses a JSON payload for login.
    const { access_token } = await api.post('/auth/login', {
      email: cleanEmail,
      password: password
    });

    api.setToken(access_token);

    // Fetch profile after login
    const user = await api.get('/auth/me');
    return { token: access_token, user };
  },

  async forgotPassword(email) {
    if (!email) throw new Error('Please enter your email address.');
    return await api.post('/auth/forgot-password', { email: email.trim() });
  },

  async resetPassword(token, newPassword) {
    if (!token) throw new Error('Reset token is required.');
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    return await api.post('/auth/reset-password', {
      token: token.trim(),
      new_password: newPassword
    });
  },

  async getCurrentUser() {
    const token = api.getToken();
    if (!token) return null;
    try {
      return await api.get('/auth/me');
    } catch {
      api.removeToken();
      return null;
    }
  },

  async logout() {
    api.removeToken();
  }
};
