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

  async loginWithGoogle() {
    throw new Error("Google Sign-In is not currently supported by the backend.");
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
