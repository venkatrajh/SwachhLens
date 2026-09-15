import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = await authService.getCurrentUser();
        setUser(storedUser);
      } catch (err) {
        console.warn('Failed to load user session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('swachhlens:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('swachhlens:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Email/Password Login
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { user: authenticatedUser } = await authService.login(email, password);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        setAuthError,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
