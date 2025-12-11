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
    // Only fetch user if API key exists in localStorage
    const storedKey = localStorage.getItem('apiKey');
    
    if (storedKey) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Don't logout on error, just show login page
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newApiKey: string) => {
    localStorage.setItem('apiKey', newApiKey);
    setApiKey(newApiKey);
    setIsLoading(true);
    
    // Fetch user after setting API key
    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to login:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
