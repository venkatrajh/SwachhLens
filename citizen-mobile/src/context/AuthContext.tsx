import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState } from '../types/user';
import { apiService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, ward?: string) => Promise<any>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'swachhlens_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

        if (storedToken) {
          const userProfile = await apiService.getCurrentUser();
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    };

    window.addEventListener('swachhlens:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('swachhlens:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { access_token } = await apiService.login(email, pass);
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);

      const userProfile = await apiService.getCurrentUser();
      setUser(userProfile);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { access_token } = await apiService.googleLogin(idToken);
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);

      const userProfile = await apiService.getCurrentUser();
      setUser(userProfile);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Google login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, ward?: string): Promise<any> => {
    setIsLoading(true);
    try {
      // Create user with is_verified=False; do NOT auto-login
      const result = await apiService.register(name, email, pass, ward);
      return result;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userProfile = await apiService.getCurrentUser();
      setUser(userProfile);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        register,
        refreshUser,
        logout,
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
