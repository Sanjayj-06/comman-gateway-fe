import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from './api';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  apiKey: string | null;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('apiKey'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (apiKey) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [apiKey]);

  const fetchUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newApiKey: string) => {
    localStorage.setItem('apiKey', newApiKey);
    setApiKey(newApiKey);
    setIsLoading(true);
  };

  const logout = () => {
    localStorage.removeItem('apiKey');
    setApiKey(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, apiKey, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
