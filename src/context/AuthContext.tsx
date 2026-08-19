import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState } from '../types/user';
import { apiService } from '../services/api';
import { INITIAL_USER } from '../services/mockApi';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'swachhlens_auth_user';
const AUTH_TOKEN_KEY = 'swachhlens_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // Default mock session for immediate demo readiness
          const defaultUser = await apiService.getCurrentUser();
          setUser(defaultUser);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
          localStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token_' + defaultUser.id);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        setUser(INITIAL_USER);
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentUser = await apiService.getCurrentUser();
      const updatedUser: User = {
        ...currentUser,
        email: email || currentUser.email,
      };
      setUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token_' + updatedUser.id);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentUser = await apiService.getCurrentUser();
      const googleUser: User = {
        ...currentUser,
        name: 'Kavin Kumar',
        email: 'kavin.swachh@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      };
      setUser(googleUser);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));
      localStorage.setItem(AUTH_TOKEN_KEY, 'mock_google_oauth_token_' + googleUser.id);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: 'U' + Math.floor(100 + Math.random() * 900),
        name: name || 'Citizen',
        email: email || 'citizen@example.com',
        role: 'citizen',
        reportsSubmitted: 0,
        issuesResolved: 0,
        ward: 'Ward 117 - Central Zone',
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token_' + newUser.id);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_USER_KEY);
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
